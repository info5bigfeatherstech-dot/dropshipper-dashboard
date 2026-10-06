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
 * Helper to convert an image URL to Base64 for jsPDF
 */
export const getBase64ImageFromUrl = async (
  imageUrl: string,
  fallbackUrl: string = 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=800&q=80'
): Promise<string | null> => {
  const attemptFetch = async (url: string): Promise<string | null> => {
    try {
      const response = await fetch(url, { mode: 'cors' });
      if (response.ok) {
        const blob = await response.blob();
        return await new Promise<string>((resolve) => {
          const reader = new FileReader();
          reader.onloadend = () => resolve(reader.result as string);
          reader.readAsDataURL(blob);
        });
      }
    } catch {
      // CORS or network failure, proceed to canvas attempt
    }

    return new Promise<string | null>((resolve) => {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.onload = () => {
        try {
          const canvas = document.createElement('canvas');
          canvas.width = img.naturalWidth || 600;
          canvas.height = img.naturalHeight || 600;
          const ctx = canvas.getContext('2d');
          if (ctx) {
            ctx.drawImage(img, 0, 0);
            resolve(canvas.toDataURL('image/jpeg', 0.9));
            return;
          }
        } catch {
          // ignore
        }
        resolve(null);
      };
      img.onerror = () => resolve(null);
      img.src = url;
    });
  };

  const primaryResult = await attemptFetch(imageUrl);
  if (primaryResult) return primaryResult;

  if (fallbackUrl && fallbackUrl !== imageUrl) {
    return await attemptFetch(fallbackUrl);
  }

  return null;
};

/**
 * Generate and download a comprehensive PDF Specification Sheet for a product.
 * By default, omits dropship/wholesale prices and profit margins so dropshippers can
 * share product sheets with their clients. Embeds product image and full specifications.
 */
export const downloadProductPDF = async (
  product: Product,
  options: { includePrice?: boolean } = { includePrice: false }
): Promise<boolean> => {
  try {
    const doc = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4'
    });

    const primaryIndigo = [79, 70, 229] as const; // #4F46E5
    const slateDark = [15, 23, 42] as const; // #0F172A
    const slateMuted = [100, 116, 139] as const; // #64748B
    const bgLight = [248, 250, 252] as const; // #F8FAFC
    const borderSlate = [226, 232, 240] as const; // #E2E8F0

    // Header Background Bar
    doc.setFillColor(primaryIndigo[0], primaryIndigo[1], primaryIndigo[2]);
    doc.rect(0, 0, 210, 26, 'F');

    // Brand title
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(16);
    doc.setFont('helvetica', 'bold');
    doc.text('PRODUCT SPECIFICATION SHEET', 14, 16);

    doc.setFontSize(9.5);
    doc.setFont('helvetica', 'normal');
    doc.text('Product Dossier & Specifications', 145, 16);

    // Try to load product image for embedding
    const imgUrl = product.thumbnail || (product.images && product.images[0]) || '';
    let imageBase64: string | null = null;
    if (imgUrl) {
      imageBase64 = await getBase64ImageFromUrl(imgUrl);
    }

    const imageX = 14;
    const imageY = 32;
    const imageW = 60;
    const imageH = 60;

    // Draw Image Box Frame
    doc.setFillColor(bgLight[0], bgLight[1], bgLight[2]);
    doc.roundedRect(imageX, imageY, imageW, imageH, 3, 3, 'F');
    doc.setDrawColor(borderSlate[0], borderSlate[1], borderSlate[2]);
    doc.setLineWidth(0.4);
    doc.roundedRect(imageX, imageY, imageW, imageH, 3, 3, 'S');

    if (imageBase64) {
      try {
        // Embed image inside the rounded box (with 1.5mm padding)
        doc.addImage(imageBase64, 'JPEG', imageX + 1.5, imageY + 1.5, imageW - 3, imageH - 3);
      } catch (e) {
        console.warn('Could not render image inside PDF', e);
      }
    } else {
      // Placeholder text if image cannot be loaded
      doc.setFontSize(9);
      doc.setTextColor(slateMuted[0], slateMuted[1], slateMuted[2]);
      doc.text('Product Photo', imageX + 18, imageY + 31);
    }

    // Right Column: Product Core Details (Next to Image)
    const detailX = 80;
    let detailY = 38;

    // Category Badge
    const categoryName =
      typeof product.category === 'object' && product.category !== null
        ? (product.category as any)?.name || 'General'
        : product.category || 'General';

    doc.setFillColor(238, 242, 255); // Indigo 50
    doc.roundedRect(detailX, detailY - 4, 38, 6.5, 1.5, 1.5, 'F');
    doc.setTextColor(primaryIndigo[0], primaryIndigo[1], primaryIndigo[2]);
    doc.setFontSize(8);
    doc.setFont('helvetica', 'bold');
    doc.text(categoryName.toUpperCase().slice(0, 18), detailX + 3, detailY);

    // Stock status pill
    const statusColor: Record<string, [number, number, number]> = {
      in_stock: [16, 185, 129],
      low_stock: [245, 158, 11],
      out_of_stock: [244, 63, 94]
    };
    const badgeColor = statusColor[product.stockStatus] || [100, 116, 139];
    doc.setFillColor(badgeColor[0], badgeColor[1], badgeColor[2]);
    doc.roundedRect(detailX + 42, detailY - 4, 38, 6.5, 1.5, 1.5, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7.5);
    const stockLabel =
      product.stockStatus === 'in_stock'
        ? `IN STOCK (${product.stock ?? 10})`
        : product.stockStatus === 'low_stock'
        ? `LOW STOCK (${product.stock ?? 2})`
        : 'OUT OF STOCK';
    doc.text(stockLabel, detailX + 45, detailY);

    detailY += 9;

    // Product Title
    doc.setTextColor(slateDark[0], slateDark[1], slateDark[2]);
    doc.setFontSize(13);
    doc.setFont('helvetica', 'bold');
    const splitTitle = doc.splitTextToSize(product.name, 116);
    doc.text(splitTitle, detailX, detailY);
    detailY += splitTitle.length * 5.5 + 2;

    // SKU & Verified Rating
    doc.setFontSize(8.5);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(slateMuted[0], slateMuted[1], slateMuted[2]);
    doc.text(`SKU: ${product.sku || 'SKU-INVENTORY'}`, detailX, detailY);
    detailY += 5;
    doc.text(
      `Rating: ★ ${product.rating || 4.8} / 5.0 (${product.reviewCount || 42} reviews)`,
      detailX,
      detailY
    );
    detailY += 5;

    // Fulfillment & Dispatch
    const fulfillmentTime = product.specs?.fulfillmentTime || '24-48 Hours';
    const origin = product.specs?.origin || 'India';
    doc.text(`Dispatch Turnaround: ${fulfillmentTime}`, detailX, detailY);
    detailY += 5;
    doc.text(`Country of Origin: ${origin}`, detailX, detailY);

    // Optional Pricing Box (ONLY if options.includePrice is explicitly true; defaults to FALSE)
    let curY = 98;
    if (options.includePrice) {
      const { profit, percentage } = calculateMargin(
        product.dropshipPrice,
        product.suggestedRetailPrice
      );
      doc.setFillColor(bgLight[0], bgLight[1], bgLight[2]);
      doc.roundedRect(14, curY, 182, 18, 2, 2, 'F');
      doc.setDrawColor(borderSlate[0], borderSlate[1], borderSlate[2]);
      doc.roundedRect(14, curY, 182, 18, 2, 2, 'S');

      doc.setFontSize(8);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(slateMuted[0], slateMuted[1], slateMuted[2]);
      doc.text('DROPSHIP PRICE', 20, curY + 6);
      doc.text('SUGGESTED MSRP', 80, curY + 6);
      doc.text(`MARGIN (${percentage}%)`, 140, curY + 6);

      doc.setFontSize(11);
      doc.setTextColor(primaryIndigo[0], primaryIndigo[1], primaryIndigo[2]);
      doc.text(formatCurrency(product.dropshipPrice), 20, curY + 14);

      doc.setTextColor(slateDark[0], slateDark[1], slateDark[2]);
      doc.text(formatCurrency(product.suggestedRetailPrice), 80, curY + 14);

      doc.setTextColor(16, 185, 129);
      doc.text(`+${formatCurrency(profit)}`, 140, curY + 14);

      curY += 24;
    } else {
      // Clean separator line when NO price is included
      doc.setDrawColor(borderSlate[0], borderSlate[1], borderSlate[2]);
      doc.setLineWidth(0.4);
      doc.line(14, curY, 196, curY);
      curY += 6;
    }

    // Product Description Section
    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(slateDark[0], slateDark[1], slateDark[2]);
    doc.text('PRODUCT DESCRIPTION & OVERVIEW', 14, curY);

    curY += 5;
    doc.setFontSize(8.5);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(slateMuted[0], slateMuted[1], slateMuted[2]);
    const descLines = doc.splitTextToSize(
      product.description || 'Verified catalog item.',
      182
    );
    doc.text(descLines, 14, curY);
    curY += descLines.length * 4.2 + 5;

    // Key Features & Highlights
    if (product.features && product.features.length > 0) {
      doc.setFontSize(10);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(slateDark[0], slateDark[1], slateDark[2]);
      doc.text('KEY FEATURES & HIGHLIGHTS', 14, curY);
      curY += 5;

      doc.setFontSize(8.5);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(slateDark[0], slateDark[1], slateDark[2]);
      product.features.forEach((feat) => {
        const featLines = doc.splitTextToSize(`• ${feat}`, 178);
        doc.text(featLines, 16, curY);
        curY += featLines.length * 4.2;
      });
      curY += 5;
    }

    // Detailed Specifications Table
    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(slateDark[0], slateDark[1], slateDark[2]);
    doc.text('PRODUCT SPECIFICATIONS & DETAILS', 14, curY);
    curY += 4;

    const specsRows = [
      ['Gross Weight', product.specs?.weight || '0.5 kg'],
      ['Parcel Dimensions (L × W × H)', product.specs?.dimensions || '15 x 10 x 5 cm'],
      ['Material Composition', product.specs?.material || 'Premium Quality Grade'],
      ['Country of Origin', product.specs?.origin || 'India'],
      ['Dispatch Turnaround', product.specs?.fulfillmentTime || '24-48 Hours'],
      ['Quality Warranty', product.specs?.warranty || 'Supplier Assured']
    ];

    // Table Header
    doc.setFillColor(241, 245, 249);
    doc.rect(14, curY, 182, 6, 'F');
    doc.setFontSize(8);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(slateDark[0], slateDark[1], slateDark[2]);
    doc.text('SPECIFICATION PROPERTY', 18, curY + 4.2);
    doc.text('VERIFIED DETAIL', 110, curY + 4.2);
    curY += 6;

    specsRows.forEach(([prop, val], idx) => {
      if (idx % 2 === 1) {
        doc.setFillColor(bgLight[0], bgLight[1], bgLight[2]);
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

    // Packaging & Quality Assurance Box
    curY += 6;
    doc.setFillColor(bgLight[0], bgLight[1], bgLight[2]);
    doc.roundedRect(14, curY, 182, 14, 2, 2, 'F');
    doc.setDrawColor(borderSlate[0], borderSlate[1], borderSlate[2]);
    doc.roundedRect(14, curY, 182, 14, 2, 2, 'S');

    doc.setFontSize(8);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(slateDark[0], slateDark[1], slateDark[2]);
    doc.text('Quality & Transit Packaging Guarantee', 18, curY + 5);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7.5);
    doc.setTextColor(slateMuted[0], slateMuted[1], slateMuted[2]);
    doc.text(
      'Carefully packed in secure, protective transit packaging. Rigorous quality inspection conducted prior to dispatch.',
      18,
      curY + 10
    );

    // Page Bottom Footer
    doc.setFontSize(7.5);
    doc.setTextColor(slateMuted[0], slateMuted[1], slateMuted[2]);
    doc.text(
      `Product Dossier • SKU: ${product.sku} • Generated on ${formatDateTime(new Date().toISOString())}`,
      14,
      287
    );

    doc.save(`${product.sku}_Product_Details.pdf`);
    return true;
  } catch (err) {
    console.error('Failed to generate product PDF', err);
    return false;
  }
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

