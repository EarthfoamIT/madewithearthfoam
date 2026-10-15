// Dev-only stand-in for the API's GET /ordertracking endpoint
// (api/src/ordertracking/ordertracking.service.ts), until that module is
// registered in the API. Serves the same response shape at
// /sample-api/ordertracking?ordernum=... from the local ERP database.
//
// Set ORDER_TRACKING_SAMPLE_DB in .env.local, e.g.
//   ORDER_TRACKING_SAMPLE_DB=mysql://root:password@127.0.0.1:3306/hexsysbackup
//
// Keep the SQL and mapping in step with the API service.

import mysql from 'mysql2/promise'

const COMPANY_ID = 3
const ORDER_NUMBER_PATTERN = /^[A-Z0-9][A-Z0-9/-]{2,49}$/

const STATUS_STAGES = {
  BOOKED: 'at_port',
  INPROGRESS: 'at_port',
  EMPTY_TO_SHIPPER: 'at_port',
  GATE_IN: 'at_port',
  LOADED: 'sailing',
  SAILING: 'sailing',
  TRANSSHIPMENT: 'sailing',
  ARRIVED: 'arrived',
  DISCHARGED: 'delivered',
  GATE_OUT: 'delivered',
  EMPTY_RETURN: 'delivered',
}

const TRACKING_SQL = `
  SELECT
    b.ordernum,
    b.containerno,
    b.vesselname,
    b.arrivalport,
    b.finaldes,
    DATE_FORMAT(b.loaddate, '%Y-%m-%d') loaddate,
    DATE_FORMAT(b.estloaddate, '%Y-%m-%d') estloaddate,
    DATE_FORMAT(b.etd, '%Y-%m-%d') etd,
    DATE_FORMAT(b.eta, '%Y-%m-%d') eta,
    DATE_FORMAT(COALESCE(v.vessel_eta, b.vesseleta), '%Y-%m-%d') vesseleta,
    DATE_FORMAT(COALESCE(v.arrival_date, b.arrivaldt), '%Y-%m-%d') arrivaldt,
    COALESCE(v.current_location, b.curloc) curloc,
    v.container_status containerStatus,
    v.shipment_status shipmentStatus,
    v.container_size containerSize,
    v.carrier_name carrierName,
    v.port_of_loading portOfLoading,
    v.port_of_discharge portOfDischarge,
    v.transit_percentage transitPercentage,
    v.last_synced_at lastSyncedAt,
    v.movements_json movementsJson,
    v.route_ports_json routePortsJson
  FROM loadingdet b
  LEFT JOIN vessel_tracking_snapshot v
    ON v.companyId = b.companyId
    AND v.shipmentId = b.shipmentId
    AND v.containerno = COALESCE(b.containerno, '')
  WHERE b.companyId = ?
    AND UPPER(b.ordernum) = ?
  ORDER BY b.loaddate, b.id
`

function parseJson(value, fallback) {
  if (value === null || value === undefined || value === '') return fallback
  if (typeof value !== 'string') return value
  try {
    return JSON.parse(value)
  } catch {
    return fallback
  }
}

function cleanVesselName(value) {
  const words = `${value || ''}`.split(/\s+[-/]\s+|\s*\(/)[0].trim().split(/\s+/)
  while (words.length > 1 && /\d/.test(words[words.length - 1]) && /[a-z]/i.test(words[words.length - 1])) {
    words.pop()
  }
  return words.join(' ') || null
}

function getProgress(stage, transitPercentage, start, end, today) {
  if (stage === 'arrived' || stage === 'delivered') return 100
  if (stage === 'preparing' || stage === 'at_port') return 0

  const percent = Number(transitPercentage)
  if (transitPercentage !== null && Number.isFinite(percent)) {
    return Math.max(0, Math.min(100, Math.round(percent)))
  }

  const startTime = start ? Date.parse(start) : NaN
  const endTime = end ? Date.parse(end) : NaN
  if (!Number.isFinite(startTime) || !Number.isFinite(endTime) || endTime <= startTime) return null

  const ratio = (Date.parse(today) - startTime) / (endTime - startTime)
  return Math.max(5, Math.min(95, Math.round(ratio * 100)))
}

function toShipment(row) {
  const today = new Date().toISOString().slice(0, 10)
  const status = row.containerStatus || row.shipmentStatus || null
  const loadDate = row.loaddate || null
  const departureDate = row.etd && !(loadDate && row.etd < loadDate) ? row.etd : null
  const rawEta = row.vesseleta || row.eta || null
  const eta = rawEta && !(rawEta < (departureDate || loadDate || '')) ? rawEta : null
  const arrivalDate = row.arrivaldt || null

  const containerNumber = `${row.containerno || ''}`.trim()
  const hasContainer = !!containerNumber && containerNumber !== '0'
  const hasShippingDetails = hasContainer || !!`${row.vesselname || ''}`.trim() || !!departureDate || !!eta

  let stage
  let basis
  if (status && STATUS_STAGES[status]) [stage, basis] = [STATUS_STAGES[status], 'carrier']
  else if (!loadDate || loadDate > today || !hasShippingDetails) [stage, basis] = ['preparing', 'plan']
  else if (arrivalDate || (eta && eta < today)) [stage, basis] = ['arrived', 'schedule']
  else if (departureDate && departureDate <= today) [stage, basis] = ['sailing', 'schedule']
  else [stage, basis] = ['at_port', 'schedule']

  const movements = parseJson(row.movementsJson, [])
  const routePorts = parseJson(row.routePortsJson, [])
  const origin = routePorts[0]
  const destination = routePorts[routePorts.length - 1]
  const [arrivalPortName, arrivalPortCountry] = `${row.arrivalport || ''}`
    .split(/\s*-\s*(?=[^-]*$)/)
    .map((part) => part.trim() || null)

  return {
    stage,
    basis,
    containerNumber: hasContainer ? containerNumber : null,
    containerSize: row.containerSize || null,
    vesselName: cleanVesselName(row.vesselname),
    carrierName: row.carrierName || null,
    loadDate,
    estimatedLoadDate: loadDate ? null : row.estloaddate || null,
    departureDate,
    eta,
    arrivalDate,
    origin: {
      name: origin?.name || row.portOfLoading || 'Colombo',
      country: origin?.countryName || (origin ? null : 'Sri Lanka'),
    },
    destination: {
      name: destination?.name || row.portOfDischarge || arrivalPortName || null,
      country: destination?.countryName || arrivalPortCountry || null,
    },
    finalDestination: row.finaldes || null,
    currentLocation: row.curloc || null,
    progress: getProgress(stage, row.transitPercentage, departureDate || loadDate, eta, today),
    route: (Array.isArray(routePorts) ? routePorts : []).map((port) => ({
      name: port?.name || null,
      country: port?.countryName || null,
      status: port?.status || null,
    })),
    events: (Array.isArray(movements) ? movements : []).map((movement) => ({
      label: movement?.label || movement?.event || null,
      location: movement?.locationName || null,
      date: movement?.date || null,
      estimated: !!movement?.isEstimated,
      vesselName: movement?.vesselName || null,
    })),
    updatedAt: row.lastSyncedAt || null,
  }
}

function send(res, statusCode, body) {
  res.statusCode = statusCode
  res.setHeader('Content-Type', 'application/json; charset=utf-8')
  res.end(JSON.stringify(body))
}

export default function orderTrackingSample(databaseUrl) {
  let pool

  return {
    name: 'order-tracking-sample',
    apply: 'serve',
    configureServer(server) {
      server.middlewares.use('/sample-api/ordertracking', async (req, res) => {
        if (!databaseUrl) {
          return send(res, 500, { message: 'ORDER_TRACKING_SAMPLE_DB is not set in .env.local.' })
        }

        const url = new URL(req.url, 'http://localhost')
        const orderNumber = `${url.searchParams.get('ordernum') || ''}`.trim().toUpperCase().replace(/\s+/g, '')

        if (!ORDER_NUMBER_PATTERN.test(orderNumber)) {
          return send(res, 400, { statusCode: 400, message: 'Please enter a valid order number.' })
        }

        try {
          pool ??= mysql.createPool({ uri: databaseUrl, connectionLimit: 2, dateStrings: true })
          const [rows] = await pool.query(TRACKING_SQL, [COMPANY_ID, orderNumber])

          if (!rows.length) {
            return send(res, 404, { statusCode: 404, message: 'We could not find an order with that number.' })
          }

          const shipments = rows.map(toShipment)
          const withContainer = shipments.filter((shipment) => shipment.containerNumber)

          send(res, 200, {
            orderNumber: rows[0].ordernum,
            shipments: withContainer.length ? withContainer : shipments.slice(0, 1),
          })
        } catch (err) {
          server.config.logger.error(`[order-tracking-sample] ${err.message}`)
          send(res, 500, {
            statusCode: 500,
            message: 'We could not look up your order right now. Please try again shortly.',
          })
        }
      })
    },
  }
}
