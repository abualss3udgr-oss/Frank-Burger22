declare global {
  interface Window {
    fbq?: any;
    _fbq?: any;
  }
}

let isPixelInitialized = false;

export function initMetaPixel(pixelId?: string) {
  if (typeof window === 'undefined') return;
  const idToUse = pixelId?.trim() || '1015887239201928'; // Standard Meta Pixel instance ID or fallback

  if (!window.fbq) {
    (function (f: any, b: any, e: any, v: any, n?: any, t?: any, s?: any) {
      if (f.fbq) return;
      n = f.fbq = function () {
        n.callMethod ? n.callMethod.apply(n, arguments) : n.queue.push(arguments);
      };
      if (!f._fbq) f._fbq = n;
      n.push = n;
      n.loaded = true;
      n.version = '2.0';
      n.queue = [];
      t = b.createElement(e);
      t.async = true;
      t.src = v;
      s = b.getElementsByTagName(e)[0];
      s.parentNode.insertBefore(t, s);
    })(window, document, 'script', 'https://connect.facebook.net/en_US/fbevents.js');
  }

  if (idToUse && !isPixelInitialized) {
    try {
      window.fbq('init', idToUse);
      isPixelInitialized = true;
      console.log(`[Meta Pixel] Initialized successfully with ID: ${idToUse}`);
    } catch (err) {
      console.error('[Meta Pixel] Error initializing:', err);
    }
  }
}

export function trackPageView(viewName?: string) {
  if (typeof window === 'undefined') return;
  initMetaPixel();
  try {
    if (window.fbq) {
      window.fbq('track', 'PageView', viewName ? { page_name: viewName } : undefined);
      console.log(`[Meta Pixel] Tracked PageView: ${viewName || 'Default'}`);
    }
  } catch (err) {
    console.error('[Meta Pixel] PageView error:', err);
  }
}

export function trackViewContent(product: {
  id: string;
  nameAr?: string;
  nameEn?: string;
  name?: string;
  price: number;
  category?: string;
}) {
  if (typeof window === 'undefined') return;
  initMetaPixel();
  try {
    if (window.fbq) {
      const prodName = product.nameAr || product.nameEn || product.name || 'Burger Item';
      window.fbq('track', 'ViewContent', {
        content_name: prodName,
        content_category: product.category || 'Burgers',
        content_ids: [product.id],
        content_type: 'product',
        value: Number(product.price) || 0,
        currency: 'EGP',
      });
      console.log(`[Meta Pixel] Tracked ViewContent: ${prodName} (${product.price} EGP)`);
    }
  } catch (err) {
    console.error('[Meta Pixel] ViewContent error:', err);
  }
}

export function trackAddToCart(item: {
  id?: string;
  productId?: string;
  nameAr?: string;
  nameEn?: string;
  name?: string;
  price: number;
  quantity?: number;
}) {
  if (typeof window === 'undefined') return;
  initMetaPixel();
  try {
    if (window.fbq) {
      const prodName = item.nameAr || item.nameEn || item.name || 'Burger Item';
      const qty = item.quantity || 1;
      const totalVal = (Number(item.price) || 0) * qty;

      window.fbq('track', 'AddToCart', {
        content_name: prodName,
        content_ids: [item.productId || item.id || 'prod'],
        content_type: 'product',
        value: totalVal,
        currency: 'EGP',
        quantity: qty,
      });
      console.log(`[Meta Pixel] Tracked AddToCart: ${prodName} | Qty: ${qty} | Value: ${totalVal} EGP`);
    }
  } catch (err) {
    console.error('[Meta Pixel] AddToCart error:', err);
  }
}

export function trackInitiateCheckout(cartItems: any[], totalValue: number) {
  if (typeof window === 'undefined') return;
  initMetaPixel();
  try {
    if (window.fbq) {
      const numItems = cartItems.reduce((acc, item) => acc + (item.quantity || 1), 0);
      const itemIds = cartItems.map((item) => item.productId || item.product?.id || item.id);

      window.fbq('track', 'InitiateCheckout', {
        content_type: 'product',
        content_ids: itemIds,
        num_items: numItems,
        value: Number(totalValue) || 0,
        currency: 'EGP',
      });
      console.log(`[Meta Pixel] Tracked InitiateCheckout | Items: ${numItems} | Value: ${totalValue} EGP`);
    }
  } catch (err) {
    console.error('[Meta Pixel] InitiateCheckout error:', err);
  }
}

export function trackPurchase(order: {
  id: string;
  total: number;
  items?: any[];
}) {
  if (typeof window === 'undefined') return;
  initMetaPixel();
  try {
    if (window.fbq) {
      const totalVal = Number(order.total) || 0;
      const numItems = order.items?.reduce((acc: number, item: any) => acc + (item.quantity || 1), 0) || 1;
      const itemIds = order.items?.map((item: any) => item.productId || item.product?.id || item.id) || [];

      window.fbq('track', 'Purchase', {
        content_type: 'product',
        content_ids: itemIds,
        num_items: numItems,
        value: totalVal,
        currency: 'EGP',
        order_id: order.id,
      });
      console.log(`[Meta Pixel] Tracked Purchase | Order: ${order.id} | Value: ${totalVal} EGP | Items: ${numItems}`);
    }
  } catch (err) {
    console.error('[Meta Pixel] Purchase error:', err);
  }
}
