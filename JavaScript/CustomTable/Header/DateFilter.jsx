import React, { useState, useCallback, useMemo } from 'react';
import PropTypes from 'prop-types';
import { useSnackbar } from 'notistack';
import dayjs from 'dayjs';
import Grid from '@material-ui/core/Grid';
import { makeStyles } from '@material-ui/core/styles';
import Radio from '@material-ui/core/Radio';
import RadioGroup from '@material-ui/core/RadioGroup';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import FormControl from '@material-ui/core/FormControl';
import FormLabel from '@material-ui/core/FormLabel';
import { FormTextField } from 'components/TextFields';
import { DateRangeMode } from 'services/constants';
import { useStore } from 'state/store';
import { useFilterActions } from 'state/storeActions';
import CustomButton from 'components/Buttons/CustomButton';

const useStyles = makeStyles((theme) => ({
  root: {
    paddingLeft: theme.spacing(1),
    paddingRight: theme.spacing(1),
  },
}));

export const DateFilter = (props) => {
  const classes = useStyles();
  const { state } = useStore();
  const { enqueueSnackbar } = useSnackbar();
  const { setFiltersByDomain } = useFilterActions();
  const [error, setError] = useState('');

  const { tableView, dateMode } = props;

  const startDate = useMemo(() => state.filters?.[tableView]?.startDate || '', [
    state.filters,
    tableView,
  ]);
  const endDate = useMemo(() => state.filters?.[tableView]?.endDate || '', [
    state.filters,
    tableView,
  ]);
  const mode = useMemo(() => state.filters?.[tableView]?.dateMode, [state.filters, tableView]);

  const setEndDate = useCallback(
    (endDateValue) => {
      setError('');
      if (!endDateValue) {
        // * For resetting end date
        setFiltersByDomain(
          {
            endDate: '',
          },
          tableView
        );
      } else {
        // * If we want a startDate after endDate, just reset the endDate
        if (dayjs(endDateValue).isBefore(dayjs(startDate))) {
          setError('End date cannot be before start date!');
          return;
        }

        // * If range is larger than 90 days just reset end date as well
        if (dayjs(endDateValue).diff(dayjs(startDate), 'day') > 90) {
          setError('Cannot search range larger than 90 days!');
          return;
        }

        setFiltersByDomain(
          {
            endDate: endDateValue,
          },
          tableView
        );
      }
    },
    [setFiltersByDomain, startDate, tableView]
  );

  const setStartDate = useCallback(
    (startDateValue) => {
      setError('');
      if (!startDateValue) {
        // * For resetting startDate
        setFiltersByDomain({ startDate: '' }, tableView);
      } else {
        // * If we want a startDate after endDate, just reset the endDate
        if (dayjs(endDate).isBefore(dayjs(startDateValue))) {
          enqueueSnackbar('Resetting End Date: End date cannot be before start date!', {
            variant: 'warning',
          });
          setEndDate('');
        }

        // * If range is larger than 90 days just reset end date as well
        if (dayjs(endDate).diff(dayjs(startDateValue), 'day') > 90) {
          enqueueSnackbar('Resetting End Date: Cannot search range larger than 90 days!', {
            variant: 'warning',
          });
          setEndDate('');
        }

        setFiltersByDomain({ startDate: startDateValue }, tableView);
      }
    },
    [setFiltersByDomain, tableView, endDate, enqueueSnackbar, setEndDate]
  );

  const changeDateMode = useCallback(
    ({ target: { value } }) => {
      setFiltersByDomain({ dateMode: value }, tableView);
    },
    [setFiltersByDomain, tableView]
  );

  const resetDateSelection = useCallback(() => {
    setFiltersByDomain({ startDate: '', endDate: '' }, tableView);
  }, [setFiltersByDomain, tableView]);

  return (
    <Grid container spacing={1} alignItems="center" className={classes.root}>
      {dateMode && (
        <Grid xs item>
          <FormControl component="fieldset">
            <FormLabel component="legend">Date Filter Options</FormLabel>
            <RadioGroup
              aria-label="Date Range Mode"
              name="Date Range Mode"
              value={mode}
              onChange={changeDateMode}
            >
              <Grid justifyContent="space-evenly" alignItems="center" container>
                <FormControlLabel
                  value={DateRangeMode.START_DATE}
                  control={<Radio />}
                  label="Start Date"
                />
                <FormControlLabel
                  value={DateRangeMode.END_DATE}
                  control={<Radio />}
                  label="End Date"
                />
              </Grid>
            </RadioGroup>
          </FormControl>
        </Grid>
      )}

      <Grid xs item>
        <FormTextField
          type="date"
          label="Start of Range"
          value={startDate}
          onChange={setStartDate}
          InputLabelProps={{
            shrink: true,
          }}
        />
      </Grid>
      <Grid xs item>
        <FormTextField
          type="date"
          label="End of Range"
          value={endDate}
          onChange={setEndDate}
          InputLabelProps={{
            shrink: true,
          }}
          error={Boolean(error)}
          helperText={error}
        />
      </Grid>
      <Grid xs container item direction="column" alignItems="center" justifyContent="center">
        <CustomButton color="primary" variant="outlined" onClick={resetDateSelection}>
          Reset Date Range Filter
        </CustomButton>
      </Grid>
    </Grid>
  );
};

DateFilter.propTypes = {
  tableView: PropTypes.string.isRequired,
  dateMode: PropTypes.bool,
};

DateFilter.defaultProps = {
  dateMode: false,
};

export {};
