import { InventoryItem } from '../types';

export function downloadCSV(items: InventoryItem[]) {
  // Define CSV headers
  const headers = [
    'ID',
    'Category',
    'Label',
    'Status',
    'Purchase Price',
    'Listed Price',
    'Sold At',
    'Delivery Charges',
    'Profit',
    'Sale Type',
    'Paid To',
    'Customer Name',
    'Customer Email',
    'Customer Phone',
    'Customer Address',
    'Created At',
    'Updated At'
  ];

  // Convert items to CSV rows
  const rows = items.map(item => [
    item.id,
    item.category || '',
    item.label || '',
    item.sale_status,
    item.purchase_price,
    item.listed_price,
    item.sold_at || '',
    item.delivery_charges,
    item.sold_at ? (item.sold_at - item.purchase_price - item.delivery_charges).toFixed(2) : '',
    item.sale_type,
    item.paid_to || '',
    item.customer_name || '',
    item.customer_email || '',
    item.customer_phone || '',
    item.customer_address || '',
    new Date(item.created_at).toLocaleString(),
    new Date(item.updated_at).toLocaleString()
  ]);

  // Combine headers and rows
  const csvContent = [
    headers.join(','),
    ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
  ].join('\n');

  // Create and trigger download
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  
  link.setAttribute('href', url);
  link.setAttribute('download', `inventory_${new Date().toISOString().split('T')[0]}.csv`);
  link.style.display = 'none';
  
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}