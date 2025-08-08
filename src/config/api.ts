export const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

export const API_ENDPOINTS = {
  // RFID endpoints
  RFID_TAGS: `${API_BASE_URL}/rfid/tags`,
  RFID_ASSIGN: `${API_BASE_URL}/rfid/assign`,
  RFID_VALIDATE: `${API_BASE_URL}/rfid/validate`,
  RFID_STATISTICS: `${API_BASE_URL}/rfid/statistics`,
  RFID_TAG_UPDATE: (tagId: string) => `${API_BASE_URL}/rfid/tags/${tagId}`,
  
  // Inventory endpoints
  INVENTORY_SUPPLIES: `${API_BASE_URL}/inventory/supplies`,
  INVENTORY_ALERTS: `${API_BASE_URL}/inventory/alerts`,
  INVENTORY_PURCHASE_ORDERS: `${API_BASE_URL}/inventory/purchase-orders`,
  INVENTORY_SUPPLIERS: `${API_BASE_URL}/inventory/suppliers`,
  INVENTORY_ALERTS_CHECK: `${API_BASE_URL}/inventory/alerts/check`,
  INVENTORY_PURCHASE_ORDERS_AUTO_GENERATE: `${API_BASE_URL}/inventory/purchase-orders/auto-generate`,
  INVENTORY_ALERTS_DISMISS: `${API_BASE_URL}/inventory/alerts/dismiss`,
  
  // Health check
  HEALTH: `${API_BASE_URL}/health`,
}; 