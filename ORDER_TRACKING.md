# Order tracking: how ERP data becomes customer statuses

This document explains how the public **Track your order** page on madewith.earthfoam.com (`/track-order`) reads shipment data from the ERP: which tables and columns it uses, how it derives a status from them, and which text the customer sees as a result.

The logic lives in the API module `api/src/ordertracking/` and in the page's wording code `src/lib/orderTracking.js` (see [Code locations](#code-locations)).

## 1. Request and query

The page calls one endpoint, which needs no login:

```
GET https://api.hexagonasia.xyz/ordertracking?ordernum=BIA/CA/014/26
```

- `ordernum` is trimmed, upper-cased and stripped of whitespace. It must match `^[A-Z0-9][A-Z0-9/-]{2,49}$`, or the API returns **400**.
- No rows found returns **404**. Database errors return **500**.

The API runs one parameterised query. It is read-only, and the company is fixed to **3**:

```sql
SELECT
  b.ordernum, b.containerno, b.vesselname, b.arrivalport, b.finaldes,
  DATE_FORMAT(b.loaddate,    '%Y-%m-%d') loaddate,
  DATE_FORMAT(b.estloaddate, '%Y-%m-%d') estloaddate,
  DATE_FORMAT(b.etd,         '%Y-%m-%d') etd,
  DATE_FORMAT(b.eta,         '%Y-%m-%d') eta,
  DATE_FORMAT(COALESCE(v.vessel_eta,   b.vesseleta), '%Y-%m-%d') vesseleta,
  DATE_FORMAT(COALESCE(v.arrival_date, b.arrivaldt), '%Y-%m-%d') arrivaldt,
  COALESCE(v.current_location, b.curloc) curloc,
  v.container_status, v.shipment_status, v.container_size, v.carrier_name,
  v.port_of_loading, v.port_of_discharge, v.transit_percentage,
  v.last_synced_at, v.movements_json, v.route_ports_json
FROM loadingdet b
LEFT JOIN vessel_tracking_snapshot v
  ON  v.companyId   = b.companyId
  AND v.shipmentId  = b.shipmentId
  AND v.containerno = COALESCE(b.containerno, '')
WHERE b.companyId = 3
  AND UPPER(b.ordernum) = ?
ORDER BY b.loaddate, b.id
```

**Each `loadingdet` row becomes one shipment** (one container card on the page).

How this differs from the Vessel Tracking Dashboard query (`LoadingdetService.getVesselTrackingDashboard`):

| | Dashboard | Order tracking |
|---|---|---|
| Joins `doctxnm` | Yes, and requires `doccod = 'EXPS'` | **No.** An order shows as soon as it has a `loadingdet` row, before it's invoiced. |
| Date window | `loaddate` in the last 70 days | **None.** Any order number can be looked up. |
| Calls ShipsGo live | Detail view can, when there's no snapshot | **Never.** Reads `vessel_tracking_snapshot` only. |

## 2. Columns used

### `loadingdet`

| Column | Used as | Purpose |
|---|---|---|
| `ordernum` | Lookup key | Match the customer's input (case-insensitive) |
| `companyId` | Filter, join | Fixed to 3 |
| `shipmentId` | Join | Links the row to its ShipsGo snapshot |
| `containerno` | `containerNumber` | Shown to the customer. `'0'` or blank means "no container". Counts as a shipping detail (see §4). |
| `vesselname` | `vesselName` | Shown after removing voyage codes. Counts as a shipping detail. |
| `loaddate` | `loadDate` | Factory dispatch date (planned or actual). Gates "Being made"; day counter; "Left our factory" |
| `estloaddate` | `estimatedLoadDate` | Only used when `loaddate` is null, in the "Being made" wording |
| `etd` | `departureDate` | Departure from Colombo. Decides At the port or At sea when ShipsGo has no status. |
| `eta` | `eta` (fallback) | Used when there's no `vesseleta`. Decides Arrived when ShipsGo has no status. |
| `vesseleta` | `eta` | Only when the snapshot has no `vessel_eta` |
| `arrivaldt` | `arrivalDate` | Only when the snapshot has no `arrival_date` |
| `curloc` | `currentLocation` | Only when the snapshot has no `current_location` |
| `arrivalport` | `destination` (fallback) | Split at the last dash, for example `LOS ANGELES - USA` → port *Los Angeles*, country *USA* |
| `finaldes` | `finalDestination` | Returned in the API response, **not shown** on the page today |
| `istracking`, `trackingstate` | (not returned) | Decide whether the map is sent (§7, Map) |

### `vessel_tracking_snapshot` (ShipsGo data kept in sync by the ERP)

| Column | Used as | Purpose |
|---|---|---|
| `container_status`, then `shipment_status` | `status` | **Main stage input** (§4, rule 1). The container status wins if both are set. |
| `vessel_eta` | `eta` | Preferred over `loadingdet.vesseleta` and `loadingdet.eta` |
| `arrival_date` | `arrivalDate` | Preferred over `loadingdet.arrivaldt` |
| `current_location` | `currentLocation` | *"Last seen near …"*, or *"Currently at sea between … and …"* when it reads `At sea - X to Y` |
| `transit_percentage` | `progress` | The progress line on the page |
| `container_size` | `containerSize` | *"(40ft)"* after the container number |
| `carrier_name` | `carrierName` | "Shipping line" detail |
| `port_of_loading`, `port_of_discharge` | `origin`, `destination` | Used when there's no `route_ports_json` |
| `route_ports_json` | `route`, `origin`, `destination` | First port = From, last port = To, the ports between = *"Via …"* |
| `movements_json` | `events` | The journey list: `label`, `locationName`, `date`, `isEstimated`, `vesselName` |
| `last_synced_at` | `updatedAt` | *"Tracking last updated …"* |
| `latitude`, `longitude` | `map.position` | Ship marker on the map (when there's no live point on the route) |
| `route_segments_json` | `map.lines` | Route lines on the map. The `CURRENT` segment is split at its `currentCoordinates` into the sailed part and the part still to go. |

### Columns not used (and how often they're filled)

Fill counts are for company 3, `loaddate` in 2026, from the local `hexsysbackup` copy (1,136 rows):

| Column | Filled | Note |
|---|---|---|
| `shipmentId` | 232 (20%) | Only these rows can get a ShipsGo status. The other 80% fall back to dates (§4, rules 2–5). |
| `bldate` | 707 (62%) | **Not used.** If it is the bill of lading date, it's a stronger "has shipped" signal than `loaddate`. See [Questions](#8-questions-for-the-erp-owner). |
| `atadesti` | 3 | Not used; rarely filled |
| `emptyretdate` | 0 | Not used |
| `etadesti`, `estloadingdate` | 0 | Not used |
| `trackingclosedat`, `status` | — | Not used. The stage comes from the snapshot status and the dates instead. |
| `consignee`, `bookingno`, `invoiceno`, `lcno`, prices… | — | **Deliberately never returned** (public endpoint) |

`vessel_tracking_snapshot` columns not used: `reference` (it contains the PO number), `booking_number`, `co2`, `map_token`, `tracking_state`, `stop_reason`, `last_error`, `summary_json`, `shipment_json`, `geojson_json`.

## 3. Clean-up before deriving the stage

| Rule | Why |
|---|---|
| `etd` is ignored if it's earlier than `loaddate` | Typo protection |
| ETA is ignored if it's earlier than the (cleaned) `etd`, or than `loaddate` when there's no `etd` | Without this, 4 of 890 rows in 2026 (ETA earlier than ETD) would show as **Arrived** |
| `containerno` of `'0'` or blank counts as no container | Placeholder rows |
| Vessel name: cut at the first ` - `, ` / ` or `(`, then drop trailing letter+digit codes | `CMA CGM TAORMINA 0K13TW1MA` → *CMA CGM Taormina*. Plain numbers like *Wan Hai 517* are kept. |
| If any row on the order has a real container, rows without one are hidden. Otherwise only the first row is shown. | Placeholder duplicate rows (for example `SAV/040/26`) |

"Today" is the API server's **UTC** date (`new Date().toISOString()`), and dates are compared as `YYYY-MM-DD` strings. Between 00:00 and 05:30 Sri Lanka time, "today" is therefore still the previous day.

## 4. How the stage is derived

There are five stages: `preparing` (**Being made**), `at_port` (**At the port**), `sailing` (**At sea**), `arrived` (**Arrived**) and `delivered` (**Delivered**).

Each stage comes with a **basis**, which records where the decision came from:

- `carrier`: the shipping line's status from ShipsGo.
- `schedule`: dates the team entered in `loadingdet`.
- `plan`: only a planned load date.

The page words its messages more cautiously when the basis is `schedule` or `plan`.

The rules are checked **in order**, and the first match wins.

### Rule 1: snapshot status (basis `carrier`)

`status = container_status ?? shipment_status`:

| Status | Stage | Seen in data? |
|---|---|---|
| `BOOKED`, `INPROGRESS`, `GATE_IN` | `at_port` | Yes |
| `EMPTY_TO_SHIPPER` | `at_port` | Mapped in case it appears |
| `SAILING` | `sailing` | Yes |
| `LOADED`, `TRANSSHIPMENT` | `sailing` | Mapped in case they appear |
| `ARRIVED` | `arrived` | Yes |
| `DISCHARGED`, `GATE_OUT`, `EMPTY_RETURN` | `delivered` | Yes |
| `NEW`, `UNTRACKED`, NULL, anything else | (go on to rule 2) | `NEW`, `UNTRACKED` and NULL seen |

> **Delivered means discharged.** `delivered` means the container is off the ship at the destination port (`DISCHARGED` / `GATE_OUT` / `EMPTY_RETURN`). It does not mean delivered to the customer's premises.

### Rules 2–5: no usable snapshot status

`hasShippingDetails` = a real `containerno` **or** a `vesselname` **or** a cleaned `etd` **or** a cleaned ETA.

| Rule | Condition | Stage | Basis |
|---|---|---|---|
| 2 | `loaddate` is null, **or** `loaddate > today`, **or** not `hasShippingDetails` | `preparing` | `plan` |
| 3 | An arrival date is recorded, **or** the ETA is before today | `arrived` | `schedule` |
| 4 | `etd <= today` | `sailing` | `schedule` |
| 5 | Otherwise (booked, but no `etd` or `etd` still ahead) | `at_port` | `schedule` |

Rule 2 treats a past `loaddate` with no other shipping data as a **plan, not a fact**. Example: `ECR/006/26` has `loaddate = 2026-10-13` (equal to `estloaddate`), and container, vessel, ETD and ETA are all null. It shows **Being made** (*"getting ready to ship"*). About 52 recent rows look like this.

### Progress (`progress`, 0–100 or null)

| Stage | Value |
|---|---|
| `preparing`, `at_port` | 0 (empty line) |
| `arrived`, `delivered` | 100 (full line) |
| `sailing` with `transit_percentage` | `transit_percentage` |
| `sailing` with no `transit_percentage` | (today − (`etd` or `loaddate`)) ÷ (ETA − (`etd` or `loaddate`)), kept between 5 and 95 |
| `sailing` with no usable dates | `null`, so the line is hidden |

## 5. API response

```jsonc
{
  "orderNumber": "BIA/CA/014/26",          // loadingdet.ordernum
  "shipments": [{                          // one per loadingdet row (after §3 de-duplication)
    "stage": "sailing",                    // §4
    "basis": "carrier",                    // §4
    "containerNumber": "WHSU5793813",      // loadingdet.containerno
    "containerSize": 40,                   // snapshot.container_size
    "vesselName": "WAN HAI 517",           // loadingdet.vesselname, cleaned
    "carrierName": "WAN HAI LINES",        // snapshot.carrier_name
    "loadDate": "2026-08-26",              // loadingdet.loaddate
    "estimatedLoadDate": null,             // loadingdet.estloaddate, only if loaddate is null
    "departureDate": "2026-09-02",         // loadingdet.etd, cleaned
    "eta": "2026-10-28",                   // snapshot.vessel_eta ?? vesseleta ?? eta, cleaned
    "arrivalDate": null,                   // snapshot.arrival_date ?? arrivaldt
    "origin":      { "name": "COLOMBO",     "country": "Sri Lanka" },          // first route port ?? port_of_loading ?? Colombo
    "destination": { "name": "LOS ANGELES", "country": "United States (USA)" }, // last route port ?? port_of_discharge ?? arrivalport
    "finalDestination": "USA",             // loadingdet.finaldes (not shown)
    "currentLocation": "SHEKOU (SHENZHEN)",// snapshot.current_location ?? curloc
    "progress": 71,                        // §4 Progress
    "route":  [{ "name": "COLOMBO", "country": "Sri Lanka", "status": "PAST" }],  // route_ports_json
    "events": [{ "label": "Loaded on Board", "location": "COLOMBO", "date": "2026-09-02",
                 "estimated": false, "vesselName": "WAN HAI 507" }],             // movements_json
    "updatedAt": "2026-10-11 18:35:20"     // snapshot.last_synced_at
  }]
}
```

## 6. What the customer sees, by stage

The page builds the headline and two sentences under it from the response, in `describeShipment()` in `src/lib/orderTracking.js`. `{…}` marks values filled in from the response, and dates are shown like *28 Oct 2026*.

In the page's own calculations, "today" is the **browser's** UTC date.

### `preparing`: Being made

`date` below is `loadDate`, or `estimatedLoadDate` when there's no `loadDate`.

| Condition | Headline | Sentences |
|---|---|---|
| `date` is after today | **Your order is being made.** | Our team in Horana is turning fresh Sri Lankan latex into your Earthfoam. / It's scheduled to leave the factory on {date}, in {N} days. *("tomorrow" when N = 1)* |
| `date` is today | **Your order is being made.** | Our team in Horana is turning fresh Sri Lankan latex into your Earthfoam. / It's due to leave the factory today. |
| No `date` | **Your order is being made.** | Our team in Horana is turning fresh Sri Lankan latex into your Earthfoam. / We'll have shipping details for you as soon as it's scheduled. |
| `date` is before today (rule 2: no shipping details yet) | **Your order is getting ready to ship.** | It was scheduled to leave our factory in Horana on {date}. / We'll share its container and sailing details as soon as it's booked onto a ship. |

### `at_port`: At the port

| Condition | Headline | Sentences |
|---|---|---|
| `eta` set | **Your order is at the port.** | It's packed into its container and waiting at {origin} to board the {vesselName}. / It should reach {destination} around {eta}. |
| no `eta` | **Your order is at the port.** | …waiting at {origin} to board the {vesselName}. / We'll share an arrival date once it sets sail. |

With no `vesselName`, *"to board the {vesselName}"* becomes *"to set sail"*.

### `sailing`: At sea

Day N = today − (`departureDate` ?? `loadDate`) + 1. If that can't be worked out, the first sentence is *"On its way to {destination}."* instead.

When `currentLocation` is set, one more sentence is added:
- If it reads `At sea - COLOMBO to NEW YORK`, the sentence is *"Currently at sea between Colombo and New York."*
- Otherwise it is *"Last seen near {currentLocation}."*

| Condition | Headline | Sentences |
|---|---|---|
| `eta` after today | **Your order is at sea.** | Day {N} of its journey to {destination, country}. Last seen near {currentLocation}. / About {eta − today} days to go. It's expected on {eta}. |
| `eta` today or earlier (still `SAILING` per ShipsGo) | **Your order is at sea.** | Day {N} of its journey to {destination, country}. / It's running a little behind. It was expected on {eta}, and we're keeping an eye on it. |
| no `eta` | **Your order is at sea.** | Day {N} of its journey to {destination, country}. / We'll share an arrival date as soon as the shipping line confirms it. |

Example: `BIA/CA/014/26` (ShipsGo `SAILING`, `transit_percentage` 71, `vessel_eta` 2026-10-28, `current_location` SHEKOU) on 14 Oct 2026 showed **"Your order is at sea."** / *"Day 43 of its journey to Los Angeles, United States (USA). Last seen near Shekou (Shenzhen)."* / *"About 14 days to go. It's expected on 28 Oct 2026."*

### `arrived`: Arrived

| Condition | Headline | Sentences |
|---|---|---|
| `basis = carrier`, or `arrivalDate` set | **Your order has arrived.** | It reached {destination, country} on {arrivalDate} *(or "around {eta}")*. / It's being unloaded now and will be ready to collect soon. |
| `basis = schedule` and no `arrivalDate` (ETA has passed, nothing confirms it) | **Your order should have arrived.** | It was due to reach {destination, country} on {eta}. / We're waiting for the shipping line to confirm. If you need it urgently, get in touch and we'll check for you. |

### `delivered`: Delivered

| Condition | Headline | Sentences |
|---|---|---|
| Always | **Your order has been delivered.** | It reached {destination, country} on {arrivalDate}, {arrivalDate − loadDate} days after leaving our factory in Horana. / We hope you love it as much as we loved making it. |

The *"{N} days after…"* part only appears when both `arrivalDate` and `loadDate` are set.

## 7. Other parts of the result

| Element | Driven by | Shown when |
|---|---|---|
| Stage label and icon (for example *AT SEA*) | `stage` | Always |
| Five-step stage bar | `stage` (done / current / to come) | Always |
| From → To, *"Via …"* | `origin`, `destination`, the ports between them in `route` | `stage` is not `preparing` and there is a destination |
| Progress line and ship icon | `progress` | `progress` is not null. Ship shown only while `sailing`. |
| Details: Container, Vessel, Shipping line | `containerNumber` + `containerSize`, `vesselName`, `carrierName` | Each one only if set |
| Details: Left our factory | `loadDate` | `stage` is not `preparing` |
| Details: Expected / Arrived | `eta` / `arrivalDate` | Arrived if `arrivalDate` is set; otherwise Expected if there's an `eta` and `stage` is not `preparing` |
| Map (collapsed: *"See where it is now"* while at sea, otherwise *"See its route on the map"*) | `map`. See **Map** below. | `map` is not null |
| Journey: shipping line events | `events` (from `movements_json`), oldest first. *(expected)* when `estimated` | There are events |
| Journey: factory step | `loadDate`. *"Left our factory"* if it has passed **and** `basis` is not `plan`; otherwise *"Scheduled to leave our factory (expected)"* | `loadDate` is set |
| Journey: arrival step | *"Arrived at destination port"* if `arrivalDate` is set or `eta` has passed, otherwise *"Expected arrival"* | `events` is empty, there's an `eta`, and `stage` is not `preparing` |
| *Tracking last updated {date}* | `updatedAt` (`last_synced_at`) | Snapshot row exists |

### Map

The API sends `map` only when **`loadingdet.istracking = 'Y'`** and **`loadingdet.trackingstate` is not `MISMATCH`**, and the snapshot has a position or route. Otherwise `map` is `null` and the page shows no map section. Orders with tracking switched off (including finished shipments with `istracking = 'N'`) don't get a map.

```jsonc
"map": {
  "position": [22.504, 113.853],                  // ship marker, [lat, lon]
  "lines": [{ "sailed": true,  "path": [[6.95, 79.85], …] },   // drawn solid coral
            { "sailed": false, "path": [[22.504, 113.853], …] }], // drawn dashed grey
  "ports": [{ "name": "COLOMBO", "country": "Sri Lanka", "status": "PAST", "position": [6.95, 79.85] }, …]
}
```

- **Ship position:** the same order as the ERP Vessel Tracking Dashboard. The live point on the current route segment first, then the snapshot `latitude`/`longitude`, then the port marked `CURRENT`.
- **Routes across the Pacific:** longitudes are kept within 180° of the first point (Los Angeles becomes 241.8), so they don't wrap the long way round the map.
- **Coordinates** are rounded to 4 decimal places.
- **Zoom:** Ctrl/⌘ + scroll, trackpad pinch (Ctrl + scroll in Chrome, Edge and Firefox; gesture events in Safari), and two-finger pinch on phones. A plain scroll, or a one-finger drag on a phone, scrolls the page and briefly shows how to zoom, so the map never traps scrolling.
- **Map tiles:** Esri World Dark Gray Canvas, the same provider as the ERP dashboard. They are loaded in the visitor's browser, and Leaflet is only downloaded when the map is opened. A caption says *"Position as last reported by the shipping line on {last_synced_at}."*

### Search and error messages

| API result | Page shows |
|---|---|
| (before searching) | The five stages, with one line explaining each |
| (waiting) | **Finding your order…** |
| 404 | **We couldn't find that order.** Check the number and try again. It should look like ABC/012/26. Still stuck? Email foamfactory@earthfoam.com and we'll look it up for you. |
| 400 | **Tracking is unavailable right now.** Please enter a valid order number. |
| 500 | **Tracking is unavailable right now.** Something went wrong on our side. Please try again shortly. |
| No response (network) | **Tracking is unavailable right now.** We couldn't reach our tracking service. Please try again in a moment. |

## 8. Questions for the ERP owner

These would make the statuses more accurate. They depend on what the columns mean in the ERP, so they're questions rather than changes:

1. **`loaddate`: plan or actual?** It seems to hold the plan until loading happens (`ECR/006/26` has `loaddate = estloaddate` and nothing else). Is there a column or flag that confirms the container actually left the factory?
2. **`bldate`** (filled in 62% of 2026 rows): if this is the bill of lading date, should it confirm "At sea" for orders without ShipsGo tracking, instead of relying on `etd`?
3. **`atadesti`** (actual arrival at destination?): it's filled for only 3 rows. If it were maintained, it could confirm "Arrived" without ShipsGo.
4. **Only 20% of 2026 rows have a `shipmentId`**, so most customers see schedule-based estimates. Should more shipments be registered with ShipsGo?
5. **`trackingstate` / `istracking`**: should `MISMATCH` or a closed tracking state stop the snapshot status from being used?
6. **Customer-premises delivery** isn't recorded anywhere we read, so "Delivered" stops at the destination port. Is there an ERP field for final delivery?

## Code locations

| What | File |
|---|---|
| Query, data clean-up, stage and basis rules, response | `api/src/ordertracking/ordertracking.service.ts` |
| Endpoint | `api/src/ordertracking/ordertracking.controller.ts` (registered in `app.module.ts`) |
| Headlines and sentences | `src/lib/orderTracking.js`: `describeShipment()` |
| Journey list | `src/lib/orderTracking.js`: `buildTimeline()` |
| Stage bar, From/To, details layout | `src/components/ShipmentCard.jsx` |
| Search and error messages | `src/pages/TrackOrderPage.jsx` |
| Development-only copy of the API logic | `dev/orderTrackingSample.js` |
