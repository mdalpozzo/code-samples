import React, { useCallback } from 'react';
import TablePagination from '@material-ui/core/TablePagination';
import { makeStyles } from '@material-ui/core/styles';
import PropTypes from 'prop-types';
import { TablePaginationActions } from './TablePaginationActions';
import { ROWS_PER_PAGE_OPTIONS } from '../constants';

const useStyles = makeStyles((theme) => ({
  tablePagination: {
    backgroundColor: theme.palette.brand.sand,
    color: theme.palette.common.black,
    left: 0,
    bottom: 0,
    zIndex: 2,
    position: 'sticky',
    display: 'flex',
    justifyContent: 'center',
  },
  paginationActions: {
    display: 'flex',
    justifyContent: 'flex-end',
    backgroundColor: 'blue',
  },
}));

export const Footer = ({
  page,
  setPage,
  rowsLength,
  paginationLimit,
  setPaginationLimit,
  isFetching,
  isMoreData,
}) => {
  const classes = useStyles();

  const handleChangePage = useCallback(
    (event, newPage) => {
      setPage(newPage);
    },
    [setPage]
  );

  const handleChangeRowsPerPage = (event) => {
    const perPage = parseInt(event.target.value, 10);
    setPaginationLimit(perPage);
    setPage(0);
  };

  return (
    <TablePagination
      className={classes.tablePagination}
      component="div"
      rowsPerPageOptions={ROWS_PER_PAGE_OPTIONS}
      count={-1}
      page={page}
      rowsPerPage={paginationLimit}
      SelectProps={{
        inputProps: { 'aria-label': 'rows per page' },
        native: true,
      }}
      onPageChange={handleChangePage}
      onRowsPerPageChange={handleChangeRowsPerPage}
      labelDisplayedRows={({ from, to }) => {
        let labelContent;

        if (isFetching) {
          labelContent = `L O A D I N G . . .`;
        } else if (!rowsLength) {
          // There are no results
          labelContent = `Showing 0 -- No results`;
        } else if (isMoreData) {
          labelContent = `Showing ${from} - ${to} -- of more than ${to}`;
        } else {
          labelContent = `Showing ${from} - ${from + rowsLength - 1} -- end of results`;
        }

        return labelContent;
      }}
      ActionsComponent={(subProps) => (
        <TablePaginationActions
          // eslint-disable-next-line react/jsx-props-no-spreading
          {...subProps}
          numResults={rowsLength}
          isMoreData={isMoreData}
        />
      )}
    />
  );
};

Footer.propTypes = {
  page: PropTypes.number,
  setPage: PropTypes.func,
  rowsLength: PropTypes.number,
  paginationLimit: PropTypes.number,
  setPaginationLimit: PropTypes.func,
  isFetching: PropTypes.bool,
  isMoreData: PropTypes.bool,
};

// TODO defaults
Footer.defaultProps = {
  page: 0,
  setPage: () => {},
  rowsLength: null,
  paginationLimit: null,
  setPaginationLimit: null,
  isFetching: false,
  isMoreData: false,
};
