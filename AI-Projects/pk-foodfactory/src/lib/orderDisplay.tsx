import {
  AlertIcon,
  CheckIcon,
  ClockIcon,
  TruckIcon,
  UserIcon,
  XIcon,
  type IconProps,
} from '../components/Icons'
import type { DeliveryStatus, OrderDoc } from '../services/api'

export function formatOrderDate(iso: string): string {
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return iso
  return d.toLocaleString(undefined, {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

export function deliveryLabel(s?: DeliveryStatus): string {
  switch (s) {
    case 'assigned':
      return 'Rider assigned'
    case 'out_for_delivery':
      return 'Out for delivery'
    case 'delivered':
      return 'Delivered'
    case 'not_delivered':
      return 'Not delivered'
    case 'unassigned':
    default:
      return 'Waiting for rider'
  }
}

export function deliveryLabelAdmin(s?: DeliveryStatus): string {
  switch (s) {
    case 'assigned':
      return 'Assigned'
    case 'out_for_delivery':
      return 'Out for delivery'
    case 'delivered':
      return 'Delivered'
    case 'not_delivered':
      return 'Not delivered'
    case 'unassigned':
    default:
      return 'Unassigned'
  }
}

export function deliveryStatusIcon(s?: DeliveryStatus) {
  const iconProps: IconProps = { size: 14 }
  switch (s) {
    case 'assigned':
      return <UserIcon {...iconProps} />
    case 'out_for_delivery':
      return <TruckIcon {...iconProps} />
    case 'delivered':
      return <CheckIcon {...iconProps} />
    case 'not_delivered':
      return <XIcon {...iconProps} />
    case 'unassigned':
    default:
      return <ClockIcon {...iconProps} />
  }
}

export function paymentStatusIcon(status: OrderDoc['paymentStatus']) {
  const iconProps: IconProps = { size: 14 }
  switch (status) {
    case 'paid':
      return <CheckIcon {...iconProps} />
    case 'pending':
      return <ClockIcon {...iconProps} />
    case 'failed':
    case 'refunded':
      return <AlertIcon {...iconProps} />
    default:
      return <ClockIcon {...iconProps} />
  }
}

export const DELIVERY_STATUS_OPTIONS: DeliveryStatus[] = [
  'unassigned',
  'assigned',
  'out_for_delivery',
  'delivered',
  'not_delivered',
]

export const PAYMENT_STATUS_OPTIONS: OrderDoc['paymentStatus'][] = [
  'pending',
  'paid',
  'failed',
  'refunded',
]
