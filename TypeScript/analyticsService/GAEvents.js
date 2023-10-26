import Events from './constants';
import mapItemsForAnalytics from './utils';

//* resources:
//* GA4 event model reference
//* https://developers.google.com/gtagjs/reference/ga4-events#purchase
//* setting up GTM tag/trigger setup tutorial
//* https://www.webtalentmarketing.com/blog/ga4-ecommerce-and-purchase-event-setup/
//* GA4 recommended events (recommended events get optimized reporting in GA console)
//* https://support.google.com/analytics/answer/9267735?hl=en&ref_topic=9756175
//* https://developers.google.com/gtagjs/reference/ga4-events#purchase
//* https://developers.google.com/tag-manager/ecommerce-ga4#measure_purchases

export const GABookingComplete = ({
  quote: { total, tax, discount_code: discountCode, items, from, to, duration },
  bookingId,
}) => {
  window.dataLayer.push({ booking: null });
  window.dataLayer.push({
    event: Events.BOOKING_TRANSACTION,
    booking: {
      transaction_id: bookingId,
      price: total ? total / 100 : 'N/A',
      tax: tax ? tax / 100 : 'N/A',
      currency: 'USD', // ? USD hardcoded for now
      promo: discountCode,
      items: mapItemsForAnalytics(items),
      from,
      to,
      duration,
    },
  });
};
export default {
  GABookingComplete,
};
