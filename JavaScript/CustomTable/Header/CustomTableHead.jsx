import React from 'react';
import PropTypes from 'prop-types';
import { makeStyles } from '@material-ui/core/styles';
import { TableCell, TableRow, TableSortLabel, TableHead, Typography } from '@material-ui/core';
import Feature from 'services/Features';
import { SORT_ORDER } from '../constants';

const useStyles = makeStyles((theme) => ({
  header: {
    backgroundColor: theme.palette.brand.sand,
    zIndex: -10,
  },
  headCell: {
    backgroundColor: theme.palette.brand.sand,
    color: theme.palette.common.black,
  },
  tableSortLabel: {
    '&.MuiTableSortLabel-active': {
      color: theme.palette.brand.black,
      fontWeight: 'bold',
    },
  },
}));

// * Used for a table that has sorts
export const CustomTableHead = ({
  columnDefinitions,
  order,
  orderBy,
  onHandleSort,
  isLoading = false,
}) => {
  const classes = useStyles();

  // * Property is the orderBy, event is the click handler
  const createSortHandler = (property) => (event) => {
    onHandleSort(event, property);
  };

  return (
    <TableHead className={classes.header}>
      <TableRow>
        {isLoading ? (
          <TableCell className={classes.headCell}> </TableCell>
        ) : (
          columnDefinitions.map(({ field, headerName, sortable, featureID }) => (
            // * Feature ID is an optional field that can hide an entire column depending on role/etc.
            <Feature id={featureID} key={field}>
              <TableCell className={classes.headCell} key={field}>
                {sortable && (
                  <TableSortLabel
                    // * "active" and "direction" only impact UI, it does not have an effect on the data fetching itself
                    active={orderBy === field}
                    direction={orderBy === field ? order : SORT_ORDER.ASC}
                    onClick={createSortHandler(field)}
                    className={classes.tableSortLabel}
                  >
                    <Typography variant="body1">{headerName}</Typography>
                  </TableSortLabel>
                )}
                {!sortable && <Typography variant="body1">{headerName}</Typography>}
              </TableCell>
            </Feature>
          ))
        )}
      </TableRow>
    </TableHead>
  );
};

CustomTableHead.propTypes = {
  columnDefinitions: PropTypes.arrayOf(
    PropTypes.shape({
      field: PropTypes.string,
      headerName: PropTypes.string,
      sortable: PropTypes.bool || undefined,
      featureID: PropTypes.string || undefined,
    })
  ).isRequired,
  order: PropTypes.oneOf([SORT_ORDER.ASC, SORT_ORDER.DESC]),
  orderBy: PropTypes.string,
  onHandleSort: PropTypes.func,
  isLoading: PropTypes.bool,
};

CustomTableHead.defaultProps = {
  order: 'asc',
  orderBy: '',
  onHandleSort: null,
  isLoading: false,
};
