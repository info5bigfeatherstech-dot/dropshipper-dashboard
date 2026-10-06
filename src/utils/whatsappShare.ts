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
 * Shares multiple product photos and formatted specifications to WhatsApp.
 * - Mobile / Modern browsers: uses navigator.share with files array so all images are attached together as an album with caption.
 * - Desktop Web Fallback: downloads all clean photos, copies details to clipboard, and opens web.whatsapp.com.
 */
export async function shareProductToWhatsApp(
  product: Product,
  options?: {
    images?: string[];
    onToast?: (toast: { type: 'info' | 'success' | 'error'; title: string; message: string }) => void;
  }
): Promise<boolean> {
  const onToast = options?.onToast;

  // Determine images to share: specific passed array or all unique gallery images
  const targetImages =
    options?.images && options.images.length > 0
      ? options.images
      : Array.from(
          new Set(
            [
              product.thumbnail,
              ...(Array.isArray(product.images) ? product.images : [])
            ].filter(Boolean) as string[]
          )
        );

  const messageText = formatWhatsAppProductText(product);
  const filePrefix = product.sku ? product.sku : 'product';

  try {
    // 1. Fetch all requested images as File Blobs in parallel
    const filePromises = targetImages.map((url, idx) =>
      fetchProductImageFile(url, `${filePrefix}_photo_${idx + 1}`)
    );
    const fetchedFiles = await Promise.all(filePromises);
    const imageFiles = fetchedFiles.filter(Boolean) as File[];

    // 2. Check if native Web Share with files is supported (Mobile Chrome/Safari, Modern Desktop)
    if (
      typeof navigator !== 'undefined' &&
      navigator.canShare &&
      imageFiles.length > 0 &&
      navigator.canShare({ files: imageFiles })
    ) {
      try {
        await navigator.share({
          title: product.name,
          text: messageText,
          files: imageFiles
        });

        onToast?.({
          type: 'success',
          title: 'Shared to WhatsApp',
          message: `Shared ${imageFiles.length} photo${imageFiles.length > 1 ? 's' : ''} and product details successfully.`
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

    // Download photos sequentially so user can easily drag them into the WhatsApp chat
    for (let i = 0; i < targetImages.length; i++) {
      downloadProductImage(
        targetImages[i],
        `${filePrefix}_photo_${i + 1}`,
        product.thumbnail
      );
      if (i < targetImages.length - 1) {
        await new Promise((r) => setTimeout(r, 250));
      }
    }

    // Open WhatsApp Web with prefilled message
    const waUrl = `https://web.whatsapp.com/send?text=${encodeURIComponent(messageText)}`;
    window.open(waUrl, '_blank', 'noopener,noreferrer');

    onToast?.({
      type: 'success',
      title: 'Opening WhatsApp Web',
      message: `${targetImages.length} photo${targetImages.length > 1 ? 's' : ''} downloaded & details copied! Paste directly into chat.`
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
