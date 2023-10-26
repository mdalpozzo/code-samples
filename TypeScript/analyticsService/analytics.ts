import { useCallback } from 'react';
import { useStore } from 'state/store';
import { generateUuid } from 'utils/generateUuid';
import sha256 from 'utils/sha256';
import { logger } from 'services/logdna';
import { AddOnBookingStateModel } from 'types/state';
import GTMService from './GTMService';
import { Events } from './constants';

interface PersonalInfo {
  fn?: string;
  ln?: string;
  em?: string;
  ph?: string;
}

interface BookingParam {
  price?: number;
  transaction_id?: string;
  tax?: number;
  currency?: string;
  promo?: string;
  items?: AddOnBookingStateModel[] | null;
  from?: string | null;
  to?: string | null;
}

interface EventParams {
  [index: string]: number | string | boolean | undefined | null | BookingParam;
  booking?: BookingParam;
  fn?: string;
  ln?: string;
  em?: string;
  ph?: string;
}

/**
 * This manual analytics event function can be used if you NEED to fire an event from outside of a react component where context/appState is not available.
 * In general it is preferred to use the "useAnalytics" custom hook b/c appStore is integrated with the event and already has default shared event data configured.
 *
 * @param {*} eventName - name of the event (e.g. add_to_cart, booking_funnel_step)
 * @param {*} eventProps - data from application state or user information (e.g. market_id, start_date);
 */
export const analyticsEvent = async (eventName: string, eventProps: EventParams) => {
  // eslint-disable-next-line camelcase
  const { fn, ln, em, ph, external_id: externalId } = eventProps || {};

  // =============== hash personal info
  const personalInfo: PersonalInfo = {
    fn,
    ln,
    em,
    ph,
  };

  let hashedPersonalInfo: PersonalInfo = { ...personalInfo };
  const personalInfoKeys = Object.keys(personalInfo);
  const personalInfoPromiseArray = [];
  try {
    for (let i = 0; i < personalInfoKeys.length; i += 1) {
      const key = personalInfoKeys[i];
      const data = personalInfo[key as keyof PersonalInfo];

      personalInfoPromiseArray.push((async () => ({ key, data: await sha256(data) }))());
    }
    const completedPromises = await Promise.all(personalInfoPromiseArray);
    completedPromises.forEach(({ key, data }) => {
      hashedPersonalInfo[key as keyof PersonalInfo] = data;
    });
  } catch (err) {
    hashedPersonalInfo = {};
    logger.error('Error hashing analytics data');
  }
  // ===============

  // =============== hash external ids
  let hashedExternalIds;
  try {
    if (Array.isArray(externalId)) {
      const promiseArray = [];
      for (let i = 0; i < externalId.length; i += 1) {
        const id = externalId[i];
        promiseArray.push(sha256(id));
      }
      hashedExternalIds = await Promise.all(promiseArray);
      // eslint-disable-next-line camelcase
    } else if (typeof externalId === 'string') {
      hashedExternalIds = await sha256(externalId);
    }
  } catch (err) {
    hashedExternalIds = null;
    logger.error('Error hashing analytics data');
  }
  // ===============

  GTMService.pushToDataLayer({
    event: eventName,
    ...eventProps,
    ...hashedPersonalInfo,
    external_id: hashedExternalIds,
    event_id: generateUuid(),
  });
};

export const useAnalytics = () => {
  // * fallback when store is not available
  const { state } = useStore() || {};

  const fireAnalyticsEvent = useCallback(
    (eventName: string, eventProps?: EventParams) => {
      const sharedEventData = {
        metro_name: state?.booking?.metroName || null,
        metro_id: state?.booking?.metroId || null,
        metro_uuid: state?.booking?.metroId || null,
        market_id: state?.booking?.marketId || null,
        location_id: state?.booking?.locationId || null,
        start_date: state?.booking?.checkIn || null,
        end_date: state?.booking?.checkOut || null,
        vehicle_category_id: state?.booking?.vehicleCategoryId || null,
        // CAPI enhancements - https://docs.google.com/spreadsheets/d/1Uw3xpcUu7FRppu562k4QiNGbUb0GYV8azsrmNDjBoFI/edit#gid=557220942
        event_id: generateUuid(),
        external_id: state?.user?.sessionId,
        em: state?.user?.email,
        ph: state?.user?.phoneNumber,
        fn: state?.user?.firstName,
        ln: state?.user?.lastName,
      };

      analyticsEvent(eventName, { ...sharedEventData, ...eventProps });
    },
    [state]
  );

  return {
    /**
     * This function is hooked up to react context and can automatically configure default/shared analytic event props
     */
    fireAnalyticsEvent,
    Events,
  };
};

export default {
  analyticsEvent,
  useAnalytics,
};
