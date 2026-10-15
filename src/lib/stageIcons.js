import { Anchor, Package, PackageCheck, Ship, Sprout } from 'lucide-react'

// Lucide icon for each tracking stage (see STAGES in orderTracking.js).
export const STAGE_ICONS = {
  preparing: Sprout,
  at_port: Package,
  sailing: Ship,
  arrived: Anchor,
  delivered: PackageCheck,
}
