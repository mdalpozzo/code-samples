import React, { useMemo } from 'react';
import PropTypes from 'prop-types';
import { makeStyles, useTheme } from '@material-ui/core/styles';
import { Typography, Box, Chip, Grid, Tooltip, TableCell } from '@material-ui/core';
import VehicleLocationSelector from 'components/VehicleLocationSelector';
import SmartVehicleAvailabilitySelector from 'components/SmartVehicleAvailabilitySelector';
import {
  UserRegistrationStatesToReadable,
  BookingTripStates,
  BookingTypeCodeToDisplay,
} from 'services/constants';
import { formatToReadableTableDate } from 'utilities/time';
import bookingSourceMapping from 'utilities/bookings/mapBookingSources';
import InfoIcon from '@material-ui/icons/Info';
import { convertNumberToCurrency } from 'utilities/data/currency';
import EditButton from 'components/Buttons/EditButton';
import { VIPChip } from 'components/VIPChip';
import LaunchIcon from '@material-ui/icons/Launch';
import CustomButton from 'components/Buttons/CustomButton/CustomButton';
import { useNavigation } from 'services/navigation';
import { RoutePaths } from 'Routes/constants';
import WheelbaseTodoActionButtons from 'views/Tasks/components/ActionButtons/WheelbaseTodoActionButtons';
import CustomTodoActionButtons from 'views/Tasks/components/ActionButtons/CustomTodoActionButtons';
import Feature, { FEATURE_CONFIG } from 'services/Features';
import { Skeleton } from '@material-ui/lab';
import { RegistrationStatus } from '../../RegistrationStatus';
import { CustomCellTypes } from './constants';
import { SearchTableCell } from './SearchTableCell';

// ** we may need to suppress the default click on table rows/cells
/**
 * This is for custom cells where we don't want the cell background to be clickable and trigger the row click action
 */
// const noOpClick = (e) => {
//   e.stopPropagation();
// };

const useStyles = makeStyles((theme) => ({
  dataCell: {
    color: theme.palette.common.black,
    maxWidth: '180px',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
  },
  text: {
    maxWidth: '250px',
  },
  vehicleCategoryEditButtonContainer: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'flex-end',
    width: '100%',
    height: '100%',
  },
  infoTooltip: {
    marginRight: theme.spacing(1),
    color: theme.palette.common.grey,
  },
  icon: {
    marginRight: theme.spacing(1),
  },
}));

// * Promo restrictions are not an enum, so I'm manually mapping them here just for the table
const PROMO_CODE_RESTRICTION_MAP = {
  ONCE_PER_CUSTOMER: 'Once Per Customer',
  ONE_TIME_USE: 'Single Use',
  UNLIMITED_USE: 'Unlimited',
};

export const CustomTableCell = (props) => {
  // * onClick is currently only configured for the VEHICLE_CATEGORY_PRICE_EDIT custom cell type
  const { type, rowData, field, secondaryField, onClick, search, isLoading, style } = props;

  const classes = useStyles();
  const theme = useTheme();
  const navigation = useNavigation();

  const content = useMemo(() => rowData[field], [field, rowData]);
  const secondaryContent = useMemo(() => secondaryField && rowData[secondaryField], [
    rowData,
    secondaryField,
  ]);

  // this prevents it from executing on EVERY render cycle as well as short-circuiting when it finds a matching case
  // TODO this may be even better as a map...
  const customCell = useMemo(() => {
    switch (type) {
      case CustomCellTypes.BOOKING_TYPE:
        return <Chip label={BookingTypeCodeToDisplay[content]} />;
      case CustomCellTypes.BOOKING_REGISTRATION_STATUS:
        return (
          <>
            <RegistrationStatus status={rowData.registrationStatus} />
            {rowData?.vip && <VIPChip small />}
            <Typography variant="body2" className={classes.text} noWrap>
              {content}
            </Typography>
          </>
        );
      case CustomCellTypes.VEHICLE_LOCATION:
        return <VehicleLocationSelector locationId={content} vehicleId={secondaryContent} />;
      case CustomCellTypes.EDIT_AVAILABILITY_STATUS:
        return (
          <SmartVehicleAvailabilitySelector availability={content} vehicleId={secondaryContent} />
        );
      case CustomCellTypes.BOOKING_TRIP_STATUS:
        return <Chip label={BookingTripStates[content] || 'N/A'} />;
      case CustomCellTypes.CHIP:
        return <Chip label={content} />;
      case CustomCellTypes.VEHICLE_CATEGORIES:
        return (
          <Grid spacing={1} container>
            {Boolean(content.length) &&
              content.map((category) => (
                <Grid item>
                  <Chip label={category} variant="outlined" size="small" />
                </Grid>
              ))}
          </Grid>
        );
      case CustomCellTypes.USER_REGISTRATION_STATUS:
        return (
          <Typography variant="body2" className={classes.text} noWrap>
            {UserRegistrationStatesToReadable[content]}
          </Typography>
        );
      case CustomCellTypes.USER_NAME:
        return (
          <>
            {secondaryContent && <VIPChip style={{ marginRight: 5 }} small />}
            <SearchTableCell search={search} content={content} />
          </>
        );
      case CustomCellTypes.PHONE_NUMBER:
        return <SearchTableCell search={search} content={content} isPhone />;
      case CustomCellTypes.PRICE_DAYS:
        return content.map((day) => <Typography>{day},</Typography>);
      case CustomCellTypes.HIGHLIGHT:
        return (
          <Typography variant="body2" className={classes.text} noWrap>
            {rowData[field]}
          </Typography>
        );
      case CustomCellTypes.DATE:
        return (
          <Typography variant="body2" className={classes.text} noWrap>
            {formatToReadableTableDate(content)}
          </Typography>
        );
      case CustomCellTypes.PRICE:
        return <Typography>{convertNumberToCurrency(content)}</Typography>;
      case CustomCellTypes.VEHICLE_CATEGORY_PRICE_EDIT:
        // rowData.vehicleCategoryId should be pulled from constant "columnFields" in src/views/MarketManagement/VehiclePricingSection/constants.js
        return (
          <Box className={classes.vehicleCategoryEditButtonContainer}>
            <Feature id={FEATURE_CONFIG.EDIT_VEHICLE_BASE_PRICE_BUTTON.id}>
              <EditButton
                onClick={onClick({
                  vehicleCategoryId: rowData?.vehicleCategoryId,
                  vehicleCategoryName: rowData?.vehicleCategory,
                  basePrice: rowData?.basePrice,
                })}
              />
            </Feature>
          </Box>
        );
      case CustomCellTypes.PRICING_RULE_NAME:
        return (
          <Typography>
            {secondaryContent} <SearchTableCell search={search} content={content} />
          </Typography>
        );
      case CustomCellTypes.PROMO_MARKETS:
        return (
          <>
            {' '}
            {content.allMarkets ? (
              <Typography>All</Typography>
            ) : (
              <>
                {Boolean(content?.markets?.length) && (
                  <Tooltip
                    className={classes.infoTooltip}
                    title={
                      <div style={{ width: 100, whiteSpace: 'normal', textAlign: 'left' }}>
                        {content?.markets?.map(({ market }) => (
                          <Typography key={market?.name} gutterBottom>
                            {market?.name}
                          </Typography>
                        ))}
                      </div>
                    }
                  >
                    <InfoIcon />
                  </Tooltip>
                )}
                <Typography>{content?.markets?.length ? 'Restricted' : 'None'}</Typography>
              </>
            )}
          </>
        );
      case CustomCellTypes.PROMO_RESTRICTION:
        return <Typography>{PROMO_CODE_RESTRICTION_MAP[content]}</Typography>;
      case CustomCellTypes.BOOKING_SOURCE: {
        return <Typography>{bookingSourceMapping(content)}</Typography>;
      }
      case CustomCellTypes.TODO_ACTIONS: {
        const { isWheelbase, id: todoId, chargeAmount, bookingOwnerUid, taxRate } = rowData;
        if (isWheelbase) {
          return (
            <WheelbaseTodoActionButtons
              bookingSourceBookingId={rowData?.bookingSourceBookingId}
              todoId={todoId}
            />
          );
        }
        return (
          <CustomTodoActionButtons
            todoId={todoId}
            chargeAmount={chargeAmount}
            uid={bookingOwnerUid}
            taxRate={taxRate}
          />
        );
      }
      case CustomCellTypes.TASK_GUEST_NAME: {
        const { bookingInternalId } = rowData;
        return (
          <CustomButton
            variant="text"
            onClick={() => navigation.to(`${RoutePaths.BOOKINGS}/${bookingInternalId}`, true)}
          >
            {content}
            <LaunchIcon color="primary" className={classes.icon} />
          </CustomButton>
        );
      }
      default: {
        if (search) {
          return <SearchTableCell search={search} content={content} />;
        }
        return <Typography>{content}</Typography>;
      }
    }
  }, [
    classes.icon,
    classes.infoTooltip,
    classes.text,
    classes.vehicleCategoryEditButtonContainer,
    content,
    field,
    navigation,
    onClick,
    rowData,
    search,
    secondaryContent,
    type,
  ]);

  return (
    <TableCell
      className={classes.dataCell}
      style={{ ...style }}
      // onClick={CustomCellTypesWithClick.includes(type) ? noOpClick : undefined}
      // style={{
      //   cursor: CustomCellTypesWithClick.includes(type) ? 'default' : undefined,
      // }}
    >
      <Box display="flex" alignItems="center" position="relative">
        {customCell}
        {isLoading && (
          <Box
            style={{
              backgroundColor: 'white',
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
            }}
          >
            <Skeleton
              variant="text"
              style={{
                backgroundColor: theme?.palette?.grey[300],
              }}
            />
          </Box>
        )}
      </Box>
    </TableCell>
  );
};

CustomTableCell.propTypes = {
  type: PropTypes.string,
  field: PropTypes.string,
  secondaryField: PropTypes.string,
  rowData: PropTypes.shape(),
  onClick: PropTypes.func,
  search: PropTypes.string,
  isLoading: PropTypes.bool,
  style: PropTypes.object,
};

CustomTableCell.defaultProps = {
  type: null,
  field: '',
  secondaryField: '',
  rowData: {},
  onClick: undefined,
  search: '',
  isLoading: false,
};

export default {};
