declare global {
  interface Window {
    fbq?: any;
    _fbq?: any;
    ttq?: any;
  }
}

let activeFacebookId: string | null = null;
let activeTiktokId: string | null = null;

// Initialize Meta (Facebook) Pixel
export function initMetaPixel(pixelId?: string) {
  if (typeof window === 'undefined') return;
  const idToUse = pixelId?.trim() || '';

  if (!idToUse) return;

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

  if (activeFacebookId !== idToUse) {
    try {
      window.fbq('init', idToUse);
      activeFacebookId = idToUse;
      console.log(`%c[Meta Pixel] Initialized successfully with ID: ${idToUse}`, 'color: #1877F2; font-weight: bold;');
    } catch (err) {
      console.error('[Meta Pixel] Error initializing:', err);
    }
  }
}

// Initialize TikTok Pixel
export function initTiktokPixel(pixelId?: string) {
  if (typeof window === 'undefined') return;
  const idToUse = pixelId?.trim() || '';

  if (!idToUse) return;

  if (!window.ttq) {
    (function (w: any, d: any, t: any) {
      w.TiktokAnalyticsObject = t;
      var ttq = (w[t] = w[t] || []);
      ttq.methods = [
        "page", "track", "identify", "instances", "debug", "on", "off", "once", "ready", "alias", "group", "enableCookie", "disableCookie", "holdConsent", "revokeConsent", "grantConsent"
      ];
      ttq.setAndDefer = function (t: any, e: any) {
        t[e] = function () {
          t.push([e].concat(Array.prototype.slice.call(arguments, 0)));
        };
      };
      for (var i = 0; i < ttq.methods.length; i++) {
        ttq.setAndDefer(ttq, ttq.methods[i]);
      }
      ttq.instance = function (t: any) {
        for (var e = ttq._i[t] || [], n = 0; n < ttq.methods.length; n++) {
          ttq.setAndDefer(e, ttq.methods[n]);
        }
        return e;
      };
      ttq._t = ttq._t || {};
      ttq._t[t] = +new Date();
      ttq._o = ttq._o || {};
      ttq._i = ttq._i || {};
      ttq._i[t] = [];
      ttq._f = ttq._f || {};
      ttq._l = ttq._l || {};
      ttq._prev = ttq._prev || {};
      var s = d.createElement("script");
      s.type = "text/javascript";
      s.async = !0;
      s.src = "https://analytics.tiktok.com/i18n/pixel/events.js?sdkid=" + idToUse;
      var a = d.getElementsByTagName("script")[0];
      if (a && a.parentNode) {
        a.parentNode.insertBefore(s, a);
      } else {
        d.head.appendChild(s);
      }
    })(window, document, 'ttq');
  }

  if (activeTiktokId !== idToUse) {
    try {
      window.ttq('load', idToUse);
      activeTiktokId = idToUse;
      console.log(`%c[TikTok Pixel] Loaded successfully with ID: ${idToUse}`, 'color: #00f2fe; font-weight: bold;');
    } catch (err) {
      console.error('[TikTok Pixel] Error loading:', err);
    }
  }
}

// 1. Track Page View
export function trackPageView(viewName?: string) {
  if (typeof window === 'undefined') return;
  const pageLabel = viewName || 'Home';

  // Track on Meta Pixel
  if (activeFacebookId && window.fbq) {
    try {
      window.fbq('track', 'PageView', { page_name: pageLabel });
      console.log(`%c[Meta Pixel] Tracked PageView: ${pageLabel}`, 'color: #1877F2;');
    } catch (err) {
      console.error('[Meta Pixel] PageView tracking error:', err);
    }
  }

  // Track on TikTok Pixel
  if (activeTiktokId && window.ttq) {
    try {
      window.ttq.page();
      console.log(`%c[TikTok Pixel] Tracked PageView: ${pageLabel}`, 'color: #00f2fe;');
    } catch (err) {
      console.error('[TikTok Pixel] PageView tracking error:', err);
    }
  }
}

// 2. Track View Content (When opening a product modal)
export function trackViewContent(product: {
  id: string;
  nameAr?: string;
  nameEn?: string;
  name?: string;
  price: number;
  category?: string;
}) {
  if (typeof window === 'undefined') return;
  const prodName = product.nameAr || product.nameEn || product.name || 'Burger Item';
  const prodPrice = Number(product.price) || 0;
  const prodCategory = product.category || 'Burgers';

  // Track on Meta Pixel
  if (activeFacebookId && window.fbq) {
    try {
      window.fbq('track', 'ViewContent', {
        content_name: prodName,
        content_category: prodCategory,
        content_ids: [product.id],
        content_type: 'product',
        value: prodPrice,
        currency: 'EGP',
      });
      console.log(`%c[Meta Pixel] Tracked ViewContent: ${prodName} | ${prodPrice} EGP`, 'color: #1877F2;');
    } catch (err) {
      console.error('[Meta Pixel] ViewContent tracking error:', err);
    }
  }

  // Track on TikTok Pixel
  if (activeTiktokId && window.ttq) {
    try {
      window.ttq.track('ViewContent', {
        contents: [{
          content_id: product.id,
          content_type: 'product',
          content_name: prodName,
          price: prodPrice,
          quantity: 1,
          category: prodCategory
        }],
        value: prodPrice,
        currency: 'EGP',
      });
      console.log(`%c[TikTok Pixel] Tracked ViewContent: ${prodName} | ${prodPrice} EGP`, 'color: #00f2fe;');
    } catch (err) {
      console.error('[TikTok Pixel] ViewContent tracking error:', err);
    }
  }
}

// 3. Track Add To Cart
export function trackAddToCart(item: {
  id?: string;
  productId?: string;
  nameAr?: string;
  nameEn?: string;
  name?: string;
  price: number;
  quantity?: number;
  category?: string;
}) {
  if (typeof window === 'undefined') return;
  const prodId = item.productId || item.id || 'prod';
  const prodName = item.nameAr || item.nameEn || item.name || 'Burger Item';
  const qty = item.quantity || 1;
  const itemPrice = Number(item.price) || 0;
  const totalVal = itemPrice * qty;
  const prodCategory = item.category || 'Burgers';

  // Track on Meta Pixel
  if (activeFacebookId && window.fbq) {
    try {
      window.fbq('track', 'AddToCart', {
        content_name: prodName,
        content_ids: [prodId],
        content_type: 'product',
        value: totalVal,
        currency: 'EGP',
        quantity: qty,
      });
      console.log(`%c[Meta Pixel] Tracked AddToCart: ${prodName} (x${qty}) | Total: ${totalVal} EGP`, 'color: #1877F2;');
    } catch (err) {
      console.error('[Meta Pixel] AddToCart tracking error:', err);
    }
  }

  // Track on TikTok Pixel
  if (activeTiktokId && window.ttq) {
    try {
      window.ttq.track('AddToCart', {
        contents: [{
          content_id: prodId,
          content_type: 'product',
          content_name: prodName,
          price: itemPrice,
          quantity: qty,
          category: prodCategory
        }],
        value: totalVal,
        currency: 'EGP',
      });
      console.log(`%c[TikTok Pixel] Tracked AddToCart: ${prodName} (x${qty}) | Total: ${totalVal} EGP`, 'color: #00f2fe;');
    } catch (err) {
      console.error('[TikTok Pixel] AddToCart tracking error:', err);
    }
  }
}

// 4. Track Initiate Checkout
export function trackInitiateCheckout(cartItems: any[], totalValue: number) {
  if (typeof window === 'undefined') return;
  const numItems = cartItems.reduce((acc, item) => acc + (item.quantity || 1), 0);
  const itemIds = cartItems.map((item) => item.productId || item.product?.id || item.id || 'item');
  const checkoutValue = Number(totalValue) || 0;

  // Track on Meta Pixel
  if (activeFacebookId && window.fbq) {
    try {
      window.fbq('track', 'InitiateCheckout', {
        content_type: 'product',
        content_ids: itemIds,
        num_items: numItems,
        value: checkoutValue,
        currency: 'EGP',
      });
      console.log(`%c[Meta Pixel] Tracked InitiateCheckout | Items: ${numItems} | Total: ${checkoutValue} EGP`, 'color: #1877F2;');
    } catch (err) {
      console.error('[Meta Pixel] InitiateCheckout tracking error:', err);
    }
  }

  // Track on TikTok Pixel
  if (activeTiktokId && window.ttq) {
    try {
      const tiktokContents = cartItems.map(item => ({
        content_id: item.productId || item.product?.id || item.id || 'item',
        content_type: 'product',
        content_name: item.nameAr || item.nameEn || item.name || 'Burger Item',
        price: Number(item.price) || 0,
        quantity: item.quantity || 1,
      }));

      window.ttq.track('InitiateCheckout', {
        contents: tiktokContents,
        value: checkoutValue,
        currency: 'EGP',
      });
      console.log(`%c[TikTok Pixel] Tracked InitiateCheckout | Items: ${numItems} | Total: ${checkoutValue} EGP`, 'color: #00f2fe;');
    } catch (err) {
      console.error('[TikTok Pixel] InitiateCheckout tracking error:', err);
    }
  }
}

// 5. Track Complete Purchase
export function trackPurchase(order: {
  id: string;
  total: number;
  items?: any[];
}) {
  if (typeof window === 'undefined') return;
  const totalVal = Number(order.total) || 0;
  const numItems = order.items?.reduce((acc: number, item: any) => acc + (item.quantity || 1), 0) || 1;
  const itemIds = order.items?.map((item: any) => item.productId || item.product?.id || item.id || 'item') || [];

  // Track on Meta Pixel
  if (activeFacebookId && window.fbq) {
    try {
      window.fbq('track', 'Purchase', {
        content_type: 'product',
        content_ids: itemIds,
        num_items: numItems,
        value: totalVal,
        currency: 'EGP',
        order_id: order.id,
      });
      console.log(`%c[Meta Pixel] Tracked Purchase | Order: ${order.id} | Total: ${totalVal} EGP`, 'color: #1877F2;');
    } catch (err) {
      console.error('[Meta Pixel] Purchase tracking error:', err);
    }
  }

  // Track on TikTok Pixel
  if (activeTiktokId && window.ttq) {
    try {
      const tiktokContents = order.items?.map(item => ({
        content_id: item.productId || item.product?.id || item.id || 'item',
        content_type: 'product',
        content_name: item.nameAr || item.nameEn || item.name || 'Burger Item',
        price: Number(item.price) || 0,
        quantity: item.quantity || 1,
      })) || [];

      window.ttq.track('CompletePayment', {
        contents: tiktokContents,
        value: totalVal,
        currency: 'EGP',
      });
      console.log(`%c[TikTok Pixel] Tracked CompletePayment (Purchase) | Order: ${order.id} | Total: ${totalVal} EGP`, 'color: #00f2fe;');
    } catch (err) {
      console.error('[TikTok Pixel] CompletePayment tracking error:', err);
    }
  }
}
