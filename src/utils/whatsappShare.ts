import { Product } from '../types';
import { getBase64ImageFromUrl, downloadProductImage } from './exportUtils';

/**
 * Converts a remote image URL into a binary File object.
 * Uses direct fetch first, and falls back to canvas-rendered base64
 * to bypass CORS issues on external image CDNs.
 */
export async function fetchProductImageFile(
  imageUrl: string,
  filename: string
): Promise<File | null> {
  if (!imageUrl) return null;

  const safeFilename = `${filename.replace(/[^a-zA-Z0-9_-]/g, '_')}.jpg`;

  // 1. Direct fetch attempt
  try {
    const res = await fetch(imageUrl, { mode: 'cors' });
    if (res.ok) {
      const blob = await res.blob();
      if (blob && blob.size > 0) {
        return new File([blob], safeFilename, { type: blob.type || 'image/jpeg' });
      }
    }
  } catch {
    // CORS or network error, proceed to canvas fallback
  }

  // 2. Canvas crossOrigin base64 fallback
  try {
    const base64 = await getBase64ImageFromUrl(imageUrl);
    if (base64) {
      const res = await fetch(base64);
      const blob = await res.blob();
      return new File([blob], safeFilename, { type: 'image/jpeg' });
    }
  } catch (err) {
    console.warn('Canvas fallback failed to create image file:', err);
  }

  return null;
}

/**
 * Formats product details with WhatsApp-compatible markdown (*bold*, bullet points).
 * Strictly omits dropship price, MSRP, and internal margins for retail/client sharing.
 */
export function formatWhatsAppProductText(product: Product): string {
  const categoryLabel =
    typeof product.category === 'object' && product.category !== null
      ? (product.category as any)?.name || 'General'
      : product.category || 'General';

  const specs = product.specs || {};
  const specLines: string[] = [];

  if (specs.material) specLines.push(`• *Material:* ${specs.material}`);
  if (specs.dimensions) specLines.push(`• *Dimensions:* ${specs.dimensions}`);
  if (specs.weight) specLines.push(`• *Weight:* ${specs.weight}`);
  if (specs.origin) specLines.push(`• *Origin:* ${specs.origin}`);
  if (specs.fulfillmentTime) specLines.push(`• *Dispatch:* ${specs.fulfillmentTime}`);
  if (specs.warranty) specLines.push(`• *Warranty:* ${specs.warranty}`);

  const lines: string[] = [
    `📦 *${product.name || 'Product Details'}*`,
    `🏷️ *Item Code:* ${product.sku || 'SKU-INVENTORY'}`,
    `📁 *Category:* ${categoryLabel}`,
    ''
  ];

  if (product.description) {
    lines.push('📝 *Product Description:*');
    lines.push(product.description.trim());
    lines.push('');
  }

  if (specLines.length > 0) {
    lines.push('✨ *Specifications:*');
    lines.push(...specLines);
    lines.push('');
  }

  lines.push('🚚 *Delivery:* Pan-India Express Delivery Available');
  lines.push('');
  lines.push('💬 _Interested in this product or have questions? Reply directly to this message!_');

  return lines.join('\n');
}

/**
 * Shares product photo and formatted specifications to WhatsApp.
 * - Mobile / Modern browsers: uses navigator.share with files so image is attached with caption.
 * - Desktop Web Fallback: downloads clean photo, copies details to clipboard, and opens web.whatsapp.com.
 */
export async function shareProductToWhatsApp(
  product: Product,
  options?: {
    onToast?: (toast: { type: 'info' | 'success' | 'error'; title: string; message: string }) => void;
  }
): Promise<boolean> {
  const onToast = options?.onToast;
  const primaryImage = product.thumbnail || (product.images && product.images[0]) || '';
  const messageText = formatWhatsAppProductText(product);
  const filePrefix = product.sku ? product.sku : 'product';

  try {
    // 1. Fetch image as File Blob
    const imageFile = await fetchProductImageFile(primaryImage, `${filePrefix}_photo`);

    // 2. Check if native Web Share with files is supported (Mobile Chrome/Safari, Modern Desktop)
    if (
      typeof navigator !== 'undefined' &&
      navigator.canShare &&
      imageFile &&
      navigator.canShare({ files: [imageFile] })
    ) {
      try {
        await navigator.share({
          title: product.name,
          text: messageText,
          files: [imageFile]
        });

        onToast?.({
          type: 'success',
          title: 'Shared to WhatsApp',
          message: 'Product image and specifications shared successfully.'
        });
        return true;
      } catch (err: any) {
        // User cancelled native share sheet
        if (err?.name === 'AbortError') {
          return false;
        }
        console.warn('Native Web Share failed, falling back to WhatsApp Web:', err);
      }
    }

    // 3. Fallback for Desktop Browsers without file sharing
    // Copy details to clipboard
    try {
      if (navigator.clipboard) {
        await navigator.clipboard.writeText(messageText);
      }
    } catch {}

    // Download photo so user can easily drag it into the WhatsApp chat
    if (primaryImage) {
      downloadProductImage(primaryImage, `${filePrefix}_photo`, product.thumbnail);
    }

    // Open WhatsApp Web with prefilled message
    const waUrl = `https://web.whatsapp.com/send?text=${encodeURIComponent(messageText)}`;
    window.open(waUrl, '_blank', 'noopener,noreferrer');

    onToast?.({
      type: 'success',
      title: 'Opening WhatsApp Web',
      message: 'Photo downloaded & product details copied to clipboard. Paste directly into your chat!'
    });

    return true;
  } catch (error: any) {
    console.error('Error sharing to WhatsApp:', error);
    onToast?.({
      type: 'error',
      title: 'Share Failed',
      message: error?.message || 'Could not initiate WhatsApp share.'
    });
    return false;
  }
}
