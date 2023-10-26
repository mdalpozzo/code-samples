import React, { useMemo, useCallback } from 'react';
import PropTypes from 'prop-types';
import { makeStyles } from '@material-ui/core/styles';
import Typography from '@material-ui/core/Typography';
import { Box } from '@material-ui/core';
import { FilterFields } from 'services/constants';
import CustomDropDown, { CustomDropDownTypes } from 'components/CustomDropDown';
import { useStore } from '../../../state/store';

const useStyles = makeStyles((theme) => ({
  container: {
    minWidth: 200,
    color: theme.palette.brand.black,
  },
}));

const FilterFieldToCustomDropDownType = {
  [FilterFields.LOCATION]: CustomDropDownTypes.LOCATION,
  [FilterFields.MARKET]: CustomDropDownTypes.MARKET,
  [FilterFields.TRIP_STATUS]: CustomDropDownTypes.TRIP_STATE,
  [FilterFields.VAN_STATUS]: CustomDropDownTypes.VEHICLE_STATUS,
  [FilterFields.VEHICLE_AVAILABILITY]: CustomDropDownTypes.VEHICLE_AVAILABILITY,
  [FilterFields.REGISTRATION_STATUS]: CustomDropDownTypes.REGISTRATION_STATUS,
  [FilterFields.RELEVANT_BOOKING]: CustomDropDownTypes.RELEVANT_BOOKING,
  [FilterFields.SKU]: CustomDropDownTypes.VEHICLE_SKU,
  [FilterFields.INTERNATIONAL_STATUS]: CustomDropDownTypes.INTERNATIONAL_STATUS,
  [FilterFields.BOOKING_TYPE]: CustomDropDownTypes.BOOKING_TYPE,
  [FilterFields.ORPHAN_BOOKINGS]: CustomDropDownTypes.ORPHAN_BOOKINGS,
  [FilterFields.ACTIVE]: CustomDropDownTypes.PROMO_ACTIVE_STATUS,
  [FilterFields.MARKET_AVAILABILITY]: CustomDropDownTypes.MARKET_AVAILABILITY,
  [FilterFields.VIP]: CustomDropDownTypes.TABLE_FILTER_VIP,
  [FilterFields.VEHICLE_CATEGORIES]: CustomDropDownTypes.VEHICLE_CATEGORY,
};

export const DropdownTableFilter = ({
  field,
  label,
  onChange,
  section,
  singleSelect,
  selectDefaultOption,
  extraOptions,
  disabled,
  placeholderText,
}) => {
  const classes = useStyles();
  const { state } = useStore();
  const dropDownType = useMemo(() => FilterFieldToCustomDropDownType[field], [field]);

  const handleChange = useCallback(
    (value) => {
      onChange(value, { value, label, field });
    },
    [field, label, onChange]
  );

  const marketIds = useMemo(() => {
    const stateMarketFilters = state?.filters?.[section]?.[FilterFields.MARKET];

    if (Array.isArray(stateMarketFilters)) {
      return stateMarketFilters?.map((marketOptionsObject) => {
        return marketOptionsObject?.value;
      });
    }

    if (!stateMarketFilters) {
      return [];
    }

    return [stateMarketFilters];
  }, [section, state?.filters]);

  return (
    <Box variant="filled" className={classes.container}>
      <Typography>{label}</Typography>
      {Boolean(dropDownType) && (
        <CustomDropDown
          value={state.filters?.[section]?.[field] || (singleSelect ? '' : [])}
          onChange={handleChange}
          type={dropDownType}
          filters={{
            marketIds,
            // * For use for markets and locations. won't affect anything else
            availability: true,
          }}
          extraOptions={extraOptions}
          extraOptionsPrepend
          placeholderText={placeholderText}
          // eslint-disable-next-line react/jsx-props-no-spreading
          {...(!singleSelect ? { multi: true } : undefined)}
          // eslint-disable-next-line react/jsx-props-no-spreading
          {...(selectDefaultOption ? { selectDefaultOption: true } : undefined)}
          disabled={disabled}
        />
      )}
    </Box>
  );
};

DropdownTableFilter.propTypes = {
  label: PropTypes.string.isRequired,
  field: PropTypes.string.isRequired,
  section: PropTypes.string.isRequired,
  onChange: PropTypes.func,
  singleSelect: PropTypes.bool,
  selectDefaultOption: PropTypes.bool,
  disabled: PropTypes.bool,
  extraOptions: PropTypes.arrayOf(PropTypes.any),
  placeholderText: PropTypes.string,
};

DropdownTableFilter.defaultProps = {
  onChange: () => {},
  selectDefaultOption: false,
  singleSelect: false,
  disabled: false,
};

export default {};
