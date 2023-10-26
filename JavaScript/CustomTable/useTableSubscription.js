import { useEffect, useState, useCallback, useRef } from 'react';
import { useSnackbar } from 'notistack';
import Logger from 'services/Logger';
import { camelCaseToSnakeCase, snakeCaseToCamelCase } from 'utilities/data';
import { isEmpty } from 'utilities/validators';
import { GQLClient } from 'services/db/clients';

// ? How our filters look in state
/*
filters: {
  accounts: {
    registrationStatus: [
      {value: 'PA', label: 'Pending Approval', disabled: false, extraData: {…}},
      {value: 'I', label: 'Incomplete', disabled: false, extraData: {…}}
    ],
    relevantBooking: [
      {value: 'UPCOMING', label: 'Upcoming', disabled: false}
    ]
  }
}
*/

export const useTableSubscription = ({
  query,
  orderBy,
  filters,
  dataMapping = (data) => data,
  limit,
  page,
  tableId,
}) => {
  const { enqueueSnackbar } = useSnackbar();

  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const currentSubscriptionRef = useRef(null);

  const handleErrorMessaging = useCallback(
    (_error, message) => {
      Logger.error(`useTableSubscription: ${tableId}`, _error);
      enqueueSnackbar(message, {
        variant: 'error',
      });
    },
    [enqueueSnackbar, tableId]
  );

  useEffect(() => {
    // clean up old subscription
    if (currentSubscriptionRef.current) {
      currentSubscriptionRef.current.unsubscribe();
      currentSubscriptionRef.current = null;
    }

    if (query) {
      setLoading(true);
      const subscriptionObserver = GQLClient.subscribe(query, {
        filters,
        limit: limit + 1,
        offset: limit * page,
        // TODO can we figure out how to do this in conjunction with the START_DATE/END_DATE filters for bookings
        // * We default to sorting by last updated row
        // * We also need to make sure sort fields are converted to snake case (ex. startDate -> start_date)
        order_by: isEmpty(orderBy) ? { updated_at: 'desc' } : camelCaseToSnakeCase(orderBy),
        // * -> But we also need to keep the field in camel case so the UI knows which sort has been activated
      });

      const subscription = subscriptionObserver.subscribe(
        (observer) => {
          setLoading(false);
          setData(dataMapping(snakeCaseToCamelCase(observer?.data)));
        },
        (_error) => {
          setLoading(false);
          setError(_error);
          handleErrorMessaging(
            _error,
            'There was an error fetching table data.  Please try refreshing page then contact support if issue is not resolved.'
          );
        },
        () => {
          setLoading(false);
          // TODO handle complete?
        }
      );

      currentSubscriptionRef.current = subscription;

      return () => {
        subscription.unsubscribe();
      };
    }
    Logger.error(`No subscription query provided to table: ${tableId}`);

    return () => {};
  }, [query, dataMapping, handleErrorMessaging, filters, limit, page, orderBy, tableId]);

  return {
    data,
    loading,
    error,
  };
};
