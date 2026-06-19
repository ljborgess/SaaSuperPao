export type NotificationType =
  | 'LOW_STOCK_INGREDIENT'
  | 'LOW_STOCK_PRODUCT'
  | 'PURCHASE_RECEIVED'
  | 'PRODUCTION_COMPLETED'

export type NotificationSeverity = 'alert' | 'info'

export interface NotificationDto {
  id: string
  type: NotificationType
  severity: NotificationSeverity
  title: string
  description: string
  occurredAt: string
}

export interface NotificationsDto {
  alerts: NotificationDto[]
  activity: NotificationDto[]
  totalUnread: number
}
