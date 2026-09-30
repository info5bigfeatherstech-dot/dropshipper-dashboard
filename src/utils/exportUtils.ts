import { jsPDF } from 'jspdf';
import { Order } from '../types';
import { formatCurrency, formatDateTime } from './formatters';

/**
 * Generate and download a PDF document for an order using jsPDF
 */
export const downloadOrderPDF = (order: Order) => {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4'
  });

  const primaryIndigo = [79, 70, 229] as const; // #4F46E5
  const slateDark = [15, 23, 42] as const; // #0F172A
  const slateMuted = [100, 116, 139] as const; // #64748B

  // Header Background Bar
  doc.setFillColor(primaryIndigo[0], primaryIndigo[1], primaryIndigo[2]);
  doc.rect(0, 0, 210, 28, 'F');

  // Brand title
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(18);
  doc.setFont('helvetica', 'bold');
  doc.text('DROPFLOW SELLER COMMERCE', 14, 18);

  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text('Official Order Fulfillment Summary', 140, 18);

  // Order Title & Status
  doc.setTextColor(slateDark[0], slateDark[1], slateDark[2]);
  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.text(`Order: ${order.orderNumber}`, 14, 42);

  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(slateMuted[0], slateMuted[1], slateMuted[2]);
  doc.text(`Generated on: ${formatDateTime(new Date().toISOString())}`, 14, 48);

  // Status Badge box
  const statusColor: Record<string, [number, number, number]> = {
    pending: [245, 158, 11],
    approved: [16, 185, 129],
    shipped: [59, 130, 246],
    delivered: [16, 185, 129],
    rejected: [244, 63, 94]
  };
  const badgeColor = statusColor[order.status] || [100, 116, 139];
  doc.setFillColor(badgeColor[0], badgeColor[1], badgeColor[2]);
  doc.roundedRect(150, 36, 45, 10, 2, 2, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.text(`STATUS: ${order.status.toUpperCase()}`, 155, 42.5);

  // Divider Line
  doc.setDrawColor(226, 232, 240);
  doc.setLineWidth(0.5);
  doc.line(14, 54, 196, 54);

  // 2-Column Details: Customer & Shipping
  doc.setTextColor(slateDark[0], slateDark[1], slateDark[2]);
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text('Customer Information', 14, 64);
  doc.text('Shipping Address', 110, 64);

  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(slateMuted[0], slateMuted[1], slateMuted[2]);

  // Customer
  doc.text(`Name: ${order.customer.name}`, 14, 72);
  doc.text(`Email: ${order.customer.email}`, 14, 78);
  doc.text(`Phone: ${order.customer.phone}`, 14, 84);

  // Address
  doc.text(`${order.shippingAddress.line1}`, 110, 72);
  if (order.shippingAddress.line2) {
    doc.text(`${order.shippingAddress.line2}`, 110, 78);
    doc.text(
      `${order.shippingAddress.city}, ${order.shippingAddress.state} ${order.shippingAddress.postalCode}`,
      110,
      84
    );
    doc.text(`${order.shippingAddress.country}`, 110, 90);
  } else {
    doc.text(
      `${order.shippingAddress.city}, ${order.shippingAddress.state} ${order.shippingAddress.postalCode}`,
      110,
      78
    );
    doc.text(`${order.shippingAddress.country}`, 110, 84);
  }

  // Item Table
  const tableStartY = 104;
  doc.setFillColor(241, 245, 249);
  doc.rect(14, tableStartY, 182, 8, 'F');
  doc.setTextColor(slateDark[0], slateDark[1], slateDark[2]);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.text('ITEM DESCRIPTION', 18, tableStartY + 5.5);
  doc.text('SKU', 115, tableStartY + 5.5);
  doc.text('QTY', 145, tableStartY + 5.5);
  doc.text('UNIT PRICE', 160, tableStartY + 5.5);
  doc.text('TOTAL', 182, tableStartY + 5.5);

  // Table row
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(slateDark[0], slateDark[1], slateDark[2]);
  doc.text(order.item.productName.substring(0, 48), 18, tableStartY + 16);
  doc.setTextColor(slateMuted[0], slateMuted[1], slateMuted[2]);
  doc.text(order.item.sku, 115, tableStartY + 16);
  doc.text(order.item.quantity.toString(), 148, tableStartY + 16);
  doc.text(formatCurrency(order.item.dropshipPrice), 160, tableStartY + 16);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(slateDark[0], slateDark[1], slateDark[2]);
  doc.text(formatCurrency(order.item.total), 182, tableStartY + 16);

  // Table bottom line
  doc.setDrawColor(226, 232, 240);
  doc.line(14, tableStartY + 22, 196, tableStartY + 22);

  // Total summary block
  const totalBoxY = tableStartY + 28;
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(slateMuted[0], slateMuted[1], slateMuted[2]);
  doc.text('Subtotal (Dropship Cost):', 125, totalBoxY);
  doc.text(formatCurrency(order.item.total), 182, totalBoxY);

  doc.text('Standard Dropship Fulfillment:', 125, totalBoxY + 6);
  doc.text('$0.00 (Included)', 173, totalBoxY + 6);

  doc.setDrawColor(primaryIndigo[0], primaryIndigo[1], primaryIndigo[2]);
  doc.setLineWidth(0.4);
  doc.line(125, totalBoxY + 9, 196, totalBoxY + 9);

  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(primaryIndigo[0], primaryIndigo[1], primaryIndigo[2]);
  doc.text('Total Charged:', 125, totalBoxY + 16);
  doc.text(formatCurrency(order.item.total), 180, totalBoxY + 16);

  // Admin notes / remarks
  let notesY = totalBoxY + 28;
  if (order.adminNote || order.notes || order.trackingNumber) {
    doc.setFillColor(248, 250, 252);
    doc.roundedRect(14, notesY, 182, 32, 2, 2, 'F');
    doc.setDrawColor(226, 232, 240);
    doc.roundedRect(14, notesY, 182, 32, 2, 2, 'S');

    doc.setFontSize(9);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(slateDark[0], slateDark[1], slateDark[2]);
    doc.text('Fulfillment & Tracking Notes', 20, notesY + 7);

    doc.setFont('helvetica', 'normal');
    doc.setTextColor(slateMuted[0], slateMuted[1], slateMuted[2]);
    let textOffset = notesY + 14;
    if (order.trackingNumber) {
      doc.text(`Tracking Number: ${order.trackingNumber} (${order.shippingCarrier || 'Standard Delivery'})`, 20, textOffset);
      textOffset += 5;
    }
    if (order.adminNote) {
      doc.text(`Admin Remark: ${order.adminNote}`, 20, textOffset);
      textOffset += 5;
    }
    if (order.notes) {
      doc.text(`Seller Order Note: ${order.notes}`, 20, textOffset);
    }
  }

  // Footer
  doc.setFontSize(8);
  doc.setTextColor(slateMuted[0], slateMuted[1], slateMuted[2]);
  doc.text('Generated by DropFlow Seller Portal. For supplier inquiries contact support@dropflow.internal', 14, 285);

  doc.save(`${order.orderNumber}_Details.pdf`);
};

/**
 * Generate CSV export of the order data
 */
export const downloadOrderCSV = (order: Order) => {
  const headers = [
    'Order Number',
    'Status',
    'Created At',
    'Customer Name',
    'Customer Email',
    'Customer Phone',
    'Shipping Address',
    'Product Name',
    'Product SKU',
    'Dropship Price',
    'Quantity',
    'Total Amount',
    'Tracking Number',
    'Admin Notes'
  ];

  const addressStr = `"${order.shippingAddress.line1}${order.shippingAddress.line2 ? ' ' + order.shippingAddress.line2 : ''}, ${order.shippingAddress.city}, ${order.shippingAddress.state} ${order.shippingAddress.postalCode}, ${order.shippingAddress.country}"`;

  const values = [
    order.orderNumber,
    order.status,
    order.createdAt,
    `"${order.customer.name}"`,
    order.customer.email,
    `"${order.customer.phone}"`,
    addressStr,
    `"${order.item.productName.replace(/"/g, '""')}"`,
    order.item.sku,
    order.item.dropshipPrice.toFixed(2),
    order.item.quantity,
    order.item.total.toFixed(2),
    order.trackingNumber || 'N/A',
    `"${(order.adminNote || order.rejectionReason || '').replace(/"/g, '""')}"`
  ];

  const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), values.join(',')].join('\n');
  const encodedUri = encodeURI(csvContent);
  const link = document.createElement('a');
  link.setAttribute('href', encodedUri);
  link.setAttribute('download', `${order.orderNumber}_export.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

/**
 * Trigger download of the actual product image
 */
export const downloadProductImage = async (imageUrl: string, filename: string): Promise<boolean> => {
  try {
    const response = await fetch(imageUrl, { mode: 'cors' });
    const blob = await response.blob();
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${filename.replace(/[^a-zA-Z0-9_-]/g, '_')}.jpg`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
    return true;
  } catch {
    // If CORS blocks direct blob download, open in new tab as safe fallback
    const link = document.createElement('a');
    link.href = imageUrl;
    link.target = '_blank';
    link.rel = 'noopener noreferrer';
    link.download = `${filename}.jpg`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    return true;
  }
};
