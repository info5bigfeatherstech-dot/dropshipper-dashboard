import { jsPDF } from 'jspdf';
import { Order, Product } from '../types';
import { formatCurrency, formatDateTime, calculateMargin } from './formatters';

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

  // Table rows for all items in order
  const items = order.items && order.items.length > 0 ? order.items : [order.item];
  let currentY = tableStartY + 16;
  items.forEach((it) => {
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(slateDark[0], slateDark[1], slateDark[2]);
    doc.text(it.productName.substring(0, 48), 18, currentY);
    doc.setTextColor(slateMuted[0], slateMuted[1], slateMuted[2]);
    doc.text(it.sku, 115, currentY);
    doc.text(it.quantity.toString(), 148, currentY);
    doc.text(formatCurrency(it.dropshipPrice), 160, currentY);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(slateDark[0], slateDark[1], slateDark[2]);
    doc.text(formatCurrency(it.total), 182, currentY);
    currentY += 8;
  });

  const grandTotal = items.reduce((acc, it) => acc + it.total, 0);

  // Table bottom line
  doc.setDrawColor(226, 232, 240);
  doc.line(14, currentY + 2, 196, currentY + 2);

  // Total summary block
  const totalBoxY = currentY + 8;
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(slateMuted[0], slateMuted[1], slateMuted[2]);
  doc.text('Subtotal (Dropship Cost):', 125, totalBoxY);
  doc.text(formatCurrency(grandTotal), 182, totalBoxY);

  doc.text('Standard Dropship Fulfillment:', 125, totalBoxY + 6);
  doc.text('Rs. 0.00 (Included)', 170, totalBoxY + 6);

  doc.setDrawColor(primaryIndigo[0], primaryIndigo[1], primaryIndigo[2]);
  doc.setLineWidth(0.4);
  doc.line(125, totalBoxY + 9, 196, totalBoxY + 9);

  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(primaryIndigo[0], primaryIndigo[1], primaryIndigo[2]);
  doc.text('Total Charged:', 125, totalBoxY + 16);
  doc.text(formatCurrency(grandTotal), 180, totalBoxY + 16);

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
    `"${(order.items && order.items.length > 0 ? order.items.map((i) => `${i.productName} (x${i.quantity})`).join('; ') : order.item.productName).replace(/"/g, '""')}"`,
    order.items && order.items.length > 0 ? order.items.map((i) => i.sku).join('; ') : order.item.sku,
    order.items && order.items.length > 0 ? order.items.map((i) => i.dropshipPrice.toFixed(2)).join('; ') : order.item.dropshipPrice.toFixed(2),
    order.items && order.items.length > 0 ? order.items.reduce((acc, i) => acc + i.quantity, 0) : order.item.quantity,
    (order.items && order.items.length > 0 ? order.items.reduce((acc, i) => acc + i.total, 0) : order.item.total).toFixed(2),
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
export const downloadProductImage = async (
  imageUrl: string,
  filename: string,
  fallbackUrl: string = 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=800&q=80'
): Promise<boolean> => {
  const safeFilename = `${filename.replace(/[^a-zA-Z0-9_-]/g, '_')}.jpg`;

  const attemptDownload = async (url: string): Promise<boolean> => {
    try {
      const response = await fetch(url, { mode: 'cors' });
      if (!response.ok) {
        // If HTTP status is 404 or not OK, fail so fallback can be attempted
        return false;
      }
      const blob = await response.blob();
      const objUrl = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = objUrl;
      link.download = safeFilename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(objUrl);
      return true;
    } catch {
      // Canvas fallback for images with CORS restrictions
      try {
        const img = new Image();
        img.crossOrigin = 'anonymous';
        const canvasPromise = new Promise<boolean>((resolve) => {
          img.onload = () => {
            try {
              const canvas = document.createElement('canvas');
              canvas.width = img.naturalWidth || 800;
              canvas.height = img.naturalHeight || 600;
              const ctx = canvas.getContext('2d');
              if (ctx) {
                ctx.drawImage(img, 0, 0);
                canvas.toBlob((blob) => {
                  if (blob) {
                    const blobUrl = window.URL.createObjectURL(blob);
                    const link = document.createElement('a');
                    link.href = blobUrl;
                    link.download = safeFilename;
                    document.body.appendChild(link);
                    link.click();
                    document.body.removeChild(link);
                    window.URL.revokeObjectURL(blobUrl);
                    resolve(true);
                    return;
                  }
                  resolve(false);
                }, 'image/jpeg', 0.95);
                return;
              }
              resolve(false);
            } catch {
              resolve(false);
            }
          };
          img.onerror = () => resolve(false);
          img.src = url;
        });

        const canvasSuccess = await canvasPromise;
        if (canvasSuccess) return true;
      } catch {
        // Continue to fallback
      }
      return false;
    }
  };

  // First attempt with original image URL
  const success = await attemptDownload(imageUrl);
  if (success) return true;

  // If original URL failed (e.g. 404 error or broken link), attempt with verified fallback
  if (fallbackUrl && fallbackUrl !== imageUrl) {
    const fallbackSuccess = await attemptDownload(fallbackUrl);
    if (fallbackSuccess) return true;
  }

  return false;
};

/**
 * Generate and download a comprehensive PDF Specification Sheet for a product
 */
export const downloadProductPDF = (product: Product) => {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4'
  });

  const primaryIndigo = [79, 70, 229] as const; // #4F46E5
  const slateDark = [15, 23, 42] as const; // #0F172A
  const slateMuted = [100, 116, 139] as const; // #64748B
  const emeraldGreen = [16, 185, 129] as const;

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
  doc.text('Product Specification & Dropship Sheet', 132, 18);

  // Product Name & Category
  doc.setTextColor(slateDark[0], slateDark[1], slateDark[2]);
  doc.setFontSize(15);
  doc.setFont('helvetica', 'bold');
  const splitTitle = doc.splitTextToSize(product.name, 132);
  doc.text(splitTitle, 14, 40);

  const titleBottomY = 40 + (splitTitle.length * 6);

  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(slateMuted[0], slateMuted[1], slateMuted[2]);
  doc.text(`Category: ${product.category}  |  SKU: ${product.sku}  |  Rating: ${product.rating} / 5.0 (${product.reviewCount} verified reviews)`, 14, titleBottomY);
  doc.text(`Generated on: ${formatDateTime(new Date().toISOString())}`, 14, titleBottomY + 5);

  // Status Badge box
  const statusColor: Record<string, [number, number, number]> = {
    in_stock: [16, 185, 129],
    low_stock: [245, 158, 11],
    out_of_stock: [244, 63, 94]
  };
  const badgeColor = statusColor[product.stockStatus] || [100, 116, 139];
  doc.setFillColor(badgeColor[0], badgeColor[1], badgeColor[2]);
  doc.roundedRect(150, 36, 46, 9, 2, 2, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.5);
  const stockLabel = product.stockStatus === 'in_stock'
    ? `IN STOCK (${product.stock})`
    : product.stockStatus === 'low_stock'
      ? `LOW STOCK (${product.stock})`
      : 'OUT OF STOCK';
  doc.text(stockLabel, 154, 42);

  // Divider Line
  const dividerY = titleBottomY + 9;
  doc.setDrawColor(226, 232, 240);
  doc.setLineWidth(0.5);
  doc.line(14, dividerY, 196, dividerY);

  // Pricing Box
  const { profit, percentage } = calculateMargin(product.dropshipPrice, product.suggestedRetailPrice);
  const priceBoxY = dividerY + 5;
  doc.setFillColor(248, 250, 252);
  doc.roundedRect(14, priceBoxY, 182, 22, 2, 2, 'F');
  doc.setDrawColor(226, 232, 240);
  doc.roundedRect(14, priceBoxY, 182, 22, 2, 2, 'S');

  // Wholesale Dropship
  doc.setFontSize(8);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(slateMuted[0], slateMuted[1], slateMuted[2]);
  doc.text('LOCKED DROPSHIP COST', 20, priceBoxY + 7);
  doc.setFontSize(13);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(primaryIndigo[0], primaryIndigo[1], primaryIndigo[2]);
  doc.text(formatCurrency(product.dropshipPrice), 20, priceBoxY + 16);

  // Suggested MSRP
  doc.setFontSize(8);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(slateMuted[0], slateMuted[1], slateMuted[2]);
  doc.text('SUGGESTED MSRP', 80, priceBoxY + 7);
  doc.setFontSize(13);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(slateDark[0], slateDark[1], slateDark[2]);
  doc.text(formatCurrency(product.suggestedRetailPrice), 80, priceBoxY + 16);

  // Estimated Margin
  doc.setFontSize(8);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(emeraldGreen[0], emeraldGreen[1], emeraldGreen[2]);
  doc.text(`ESTIMATED NET MARGIN (${percentage}% RETURN)`, 136, priceBoxY + 7);
  doc.setFontSize(13);
  doc.setFont('helvetica', 'bold');
  doc.text(`+${formatCurrency(profit)}`, 136, priceBoxY + 16);

  // Product Description Section
  let curY = priceBoxY + 28;
  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(slateDark[0], slateDark[1], slateDark[2]);
  doc.text('PRODUCT OVERVIEW & DESCRIPTION', 14, curY);

  curY += 5;
  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(slateMuted[0], slateMuted[1], slateMuted[2]);
  const descLines = doc.splitTextToSize(product.description, 182);
  doc.text(descLines, 14, curY);
  curY += (descLines.length * 4.5) + 5;

  // Key Specifications Highlights
  if (product.features && product.features.length > 0) {
    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(slateDark[0], slateDark[1], slateDark[2]);
    doc.text('KEY SPECIFICATIONS & VALUE HIGHLIGHTS', 14, curY);
    curY += 5;

    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(slateDark[0], slateDark[1], slateDark[2]);
    product.features.forEach((feat) => {
      const featLines = doc.splitTextToSize(`• ${feat}`, 178);
      doc.text(featLines, 16, curY);
      curY += (featLines.length * 4.5);
    });
    curY += 5;
  }

  // Logistics & Carrier Compliance Table
  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(slateDark[0], slateDark[1], slateDark[2]);
  doc.text('LOGISTICS & CARRIER COMPLIANCE', 14, curY);
  curY += 4;

  const specsRows = [
    ['Dispatch Turnaround', product.specs.fulfillmentTime],
    ['Fulfillment Origin Hub', product.specs.origin],
    ['Parcel Dimensions', product.specs.dimensions],
    ['Gross Weight', product.specs.weight],
    ['Material Composition', product.specs.material],
    ['Supplier Warranty', product.specs.warranty]
  ];

  doc.setFillColor(241, 245, 249);
  doc.rect(14, curY, 182, 6, 'F');
  doc.setFontSize(8.5);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(slateDark[0], slateDark[1], slateDark[2]);
  doc.text('SPECIFICATION PROPERTY', 18, curY + 4.2);
  doc.text('VERIFIED DETAIL', 110, curY + 4.2);
  curY += 6;

  specsRows.forEach(([prop, val], idx) => {
    if (idx % 2 === 1) {
      doc.setFillColor(248, 250, 252);
      doc.rect(14, curY, 182, 6, 'F');
    }
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(slateMuted[0], slateMuted[1], slateMuted[2]);
    doc.text(prop, 18, curY + 4.2);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(slateDark[0], slateDark[1], slateDark[2]);
    doc.text(val, 110, curY + 4.2);
    curY += 6;
  });

  // Footer notes & packaging
  curY += 6;
  doc.setFillColor(248, 250, 252);
  doc.roundedRect(14, curY, 182, 17, 2, 2, 'F');
  doc.setDrawColor(226, 232, 240);
  doc.roundedRect(14, curY, 182, 17, 2, 2, 'S');
  doc.setFontSize(8.5);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(slateDark[0], slateDark[1], slateDark[2]);
  doc.text('Wholesale Blind Packaging & Delivery Guarantee', 18, curY + 5.5);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(slateMuted[0], slateMuted[1], slateMuted[2]);
  doc.text('Shipped in unbranded packaging directly to your end customers. Zero middleman supplier paperwork attached.', 18, curY + 11.5);

  // Footer
  doc.setFontSize(8);
  doc.setTextColor(slateMuted[0], slateMuted[1], slateMuted[2]);
  doc.text('DropFlow Seller Commerce Platform - Confidential dropship catalog specification', 14, 285);

  doc.save(`${product.sku}_Product_Details.pdf`);
};

/**
 * Generate CSV export of the product data (compatible with store bulk import)
 */
export const downloadProductCSV = (product: Product) => {
  const { profit, percentage } = calculateMargin(product.dropshipPrice, product.suggestedRetailPrice);
  const headers = [
    'SKU',
    'Product Name',
    'Category',
    'Dropship Price (INR)',
    'Suggested MSRP (INR)',
    'Profit Margin (INR)',
    'Margin Percentage (%)',
    'Stock Status',
    'Inventory Count',
    'Rating',
    'Review Count',
    'Turnaround',
    'Origin Hub',
    'Dimensions',
    'Weight',
    'Material',
    'Warranty',
    'Description',
    'Features',
    'Primary Image',
    'Gallery Images'
  ];

  const escapeCsv = (val: string | number) => `"${String(val).replace(/"/g, '""')}"`;

  const values = [
    escapeCsv(product.sku),
    escapeCsv(product.name),
    escapeCsv(product.category),
    product.dropshipPrice.toFixed(2),
    product.suggestedRetailPrice.toFixed(2),
    profit.toFixed(2),
    percentage.toString(),
    escapeCsv(product.stockStatus),
    product.stock.toString(),
    product.rating.toString(),
    product.reviewCount.toString(),
    escapeCsv(product.specs.fulfillmentTime),
    escapeCsv(product.specs.origin),
    escapeCsv(product.specs.dimensions),
    escapeCsv(product.specs.weight),
    escapeCsv(product.specs.material),
    escapeCsv(product.specs.warranty),
    escapeCsv(product.description),
    escapeCsv(product.features.join(' | ')),
    escapeCsv(product.thumbnail),
    escapeCsv((product.images || []).join('; '))
  ];

  const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), values.join(',')].join('\n');
  const encodedUri = encodeURI(csvContent);
  const link = document.createElement('a');
  link.setAttribute('href', encodedUri);
  link.setAttribute('download', `${product.sku}_details.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

/**
 * Generate JSON export of the product data
 */
export const downloadProductJSON = (product: Product) => {
  const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(product, null, 2));
  const link = document.createElement('a');
  link.setAttribute('href', dataStr);
  link.setAttribute('download', `${product.sku}_data.json`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

/**
 * Generate clean Text/Markdown listing export of product
 */
export const downloadProductText = (product: Product) => {
  const { profit, percentage } = calculateMargin(product.dropshipPrice, product.suggestedRetailPrice);
  const content = `PRODUCT SPECIFICATION SHEET
=============================================
Product Name: ${product.name}
SKU: ${product.sku}
Category: ${product.category}
Status: ${product.stockStatus.toUpperCase()} (${product.stock} units available)
Rating: ${product.rating} / 5.0 (${product.reviewCount} customer reviews)

PRICING & MARGINS
---------------------------------------------
Wholesale Dropship Cost: ₹${product.dropshipPrice.toFixed(2)}
Suggested Retail Price:  ₹${product.suggestedRetailPrice.toFixed(2)}
Estimated Net Profit:    +₹${profit.toFixed(2)} (${percentage}% Margin)

OVERVIEW & DESCRIPTION
---------------------------------------------
${product.description}

KEY FEATURES & VALUE HIGHLIGHTS
---------------------------------------------
${product.features.map((f) => `* ${f}`).join('\n')}

LOGISTICS & CARRIER SPECIFICATIONS
---------------------------------------------
Dispatch Turnaround:   ${product.specs.fulfillmentTime}
Fulfillment Hub:       ${product.specs.origin}
Parcel Dimensions:     ${product.specs.dimensions}
Gross Weight:          ${product.specs.weight}
Material Composition:  ${product.specs.material}
Supplier Warranty:     ${product.specs.warranty}

IMAGES
---------------------------------------------
Primary Thumbnail: ${product.thumbnail}
${(product.images || []).map((img, i) => `Image ${i + 1}: ${img}`).join('\n')}
=============================================
Exported from DropFlow Seller Portal
`;

  const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `${product.sku}_listing.txt`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

/**
 * Sequentially trigger download for all images in the product gallery
 */
export const downloadAllProductImages = async (product: Product): Promise<number> => {
  const images = product.images && product.images.length > 0 ? product.images : [product.thumbnail];
  let count = 0;
  for (let i = 0; i < images.length; i++) {
    const success = await downloadProductImage(
      images[i],
      `${product.sku}_image_${i + 1}`,
      product.thumbnail
    );
    if (success) count++;
    // Small delay between downloads so browser doesn't block multi-download
    await new Promise((resolve) => setTimeout(resolve, 300));
  }
  return count;
};

