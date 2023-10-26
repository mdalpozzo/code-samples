import React, { useEffect, useState, useMemo, useCallback } from 'react';
import PropTypes from 'prop-types';
import { snakeCase } from 'lodash';
import { makeStyles } from '@material-ui/core/styles';
import {
  Table,
  TableContainer,
  TableBody,
  TableRow,
  Paper,
  CircularProgress,
  Box,
  TableCell,
} from '@material-ui/core';
import { useNavigation } from 'services/navigation';
import Feature from 'services/Features';
import generateListItemKey from 'utilities/generateListItemKey';
import { useFiltersModel } from 'state/models/tableModel';
import { useSortActions } from 'state/storeActions';
import { useStore } from 'state/store';
import Logger from 'services/Logger';
import { useSnackbar } from 'notistack';
import { CustomTableCell } from './CustomTableCell';
import { CustomTableHead } from './Header/CustomTableHead';
import { useTableSubscription } from './useTableSubscription';
import { ROWS_PER_PAGE_OPTIONS, SORT_ORDER, DEFAULT_COLUMN_WIDTH } from './constants';
import { Footer } from './Footer';
import { TableFilters } from './Header/TableFilters';
import { CustomSearch } from './Header/CustomSearch';
import { generateGQLSearchArgument } from './generateGQLSearchArgument';
import { generateGQLOrderByArgument } from './generateGQLOrderByArgument';

const useStyles = makeStyles((theme) => ({
  container: {
    width: '100%',
    display: 'flex',
    flexDirection: 'column',
  },
  tableContainer: {
    backgroundColor: theme.palette.common.white,
  },
  tableHeadAndBody: {
    height: '100%',
    backgroundColor: 'purple',
  },
  row: {
    backgroundColor: theme.palette.common.white,
    height: '50px',
    borderBottom: '2px solid grey',
    '&.MuiTableRow-hover': {
      '&:hover': {
        cursor: 'pointer',
        backgroundColor: theme.palette.brand.limestone,
      },
    },
  },
}));

/**
 * @description The foundational element used to create tables
 * @param {Object} data array of formatted rows to render
 * @param queryFilters queryFilters that match our underlying provider syntax (hasura).  The table filter component will update filters in state/store, but you have to then read those and manually generate your own queryFilters wherever you use the table
 * @returns Table
 */
export const CustomTable = ({
  columnDefinitions,
  rowLinkPagePath, // * if this is not passed then there will be no row click action and the cursor will display as default
  subscriptionQuery,
  queryFilters,
  dataMapping,
  filterDefinitions,
  identifier,
  // * Search Label also decides whether or not we render the search bar
  searchLabel,
  numFiltersPerRow,
  // ? onClickConfig example is used in Market Management for the base price edit
  onClickConfig,
}) => {
  const classes = useStyles();
  const { state } = useStore();
  const navigation = useNavigation();
  const { setSorts } = useSortActions();
  const { getSortsById } = useFiltersModel();
  const { enqueueSnackbar } = useSnackbar();

  // ===== QUERY args and dependencies ===========================================
  // * Should be set by the footer, dropdown
  const [paginationLimit, setPaginationLimit] = useState(ROWS_PER_PAGE_OPTIONS[0]);
  // * Offset is the page * paginationLimit
  const [page, setPage] = useState(0);
  const [search, setSearch] = useState('');
  const { orderBy, order } = getSortsById(identifier);
  const orderByQueryFilter = useMemo(() => {
    return generateGQLOrderByArgument({ orderPath: orderBy, orderValue: order });
  }, [order, orderBy]);

  const whereQueryFilters = useMemo(() => {
    let searchFilter = {};

    const processedSearchPaths = columnDefinitions.reduce((acc, { searchPath }) => {
      if (searchPath) {
        // * format path to snake case and split (ex. location.market.displayName => ['location','market','display_name'])
        const splitPaths = searchPath.split('.').map((path) => snakeCase(path));
        acc.push(splitPaths);
      }
      return acc;
    }, []);

    if (processedSearchPaths?.length) {
      const searchFilterArray = [];
      processedSearchPaths.forEach((paths) =>
        searchFilterArray.push(generateGQLSearchArgument(search, paths))
      );
      searchFilter = { _or: searchFilterArray };
    }

    return {
      _and: [...(queryFilters || []), ...(searchFilter ? [searchFilter] : [])],
    };
  }, [columnDefinitions, queryFilters, search]);
  // ================================================================================

  const [rowData, setRowData] = useState([]);
  const [isMoreData, setIsMoreData] = useState(false);

  const { loading: isFetching, data: subscriptionRowData, error } = useTableSubscription({
    query: subscriptionQuery,
    dataMapping,
    filters: whereQueryFilters,
    orderBy: orderByQueryFilter,
    // fetch one extra to allow us to see if there are more results
    limit: paginationLimit,
    page,
    tableId: identifier,
  });

  const isFetchingInitialData = useMemo(() => isFetching && rowData?.length === 0, [
    isFetching,
    rowData?.length,
  ]);

  useEffect(() => {
    if (error) {
      const errorMessage = `CustomTable: ${
        error?.message ?? 'Error occurred in table subscription'
      }`;
      Logger.error(errorMessage, error);
      enqueueSnackbar(errorMessage, {
        variant: 'error',
      });
    }
  }, [enqueueSnackbar, error]);

  useEffect(() => {
    const moreResultsThanLimit = (subscriptionRowData?.length || 0) > paginationLimit;
    if (moreResultsThanLimit) {
      // remove the extra fetched item
      setRowData(subscriptionRowData?.slice(0, -1) || []);
      setIsMoreData(true);
    } else {
      setRowData(subscriptionRowData || []);
      setIsMoreData(false);
    }
  }, [subscriptionRowData, paginationLimit]);

  const onChangeSearch = useCallback((newSearch) => {
    setSearch(newSearch.trim());
    setPage(0);
  }, []);

  // * Reset page when certain manual filters change (booking date filter etc.)
  useEffect(() => {
    setPage(0);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    state.filters.bookings.startDate,
    state.filters.bookings.endDate,
    state.filters.bookings.dateMode,
  ]);

  // ================ SORTING ================
  const onHandleSort = useCallback(
    (event, newSortingProperty) => {
      // * Might be an empty object
      const oldSortingProperty = orderBy;
      const oldOrder = order;

      // * if it's the same property/column as before we just toggled the order
      const newOrder =
        newSortingProperty === oldSortingProperty && oldOrder === SORT_ORDER.ASC
          ? SORT_ORDER.DESC
          : SORT_ORDER.ASC;

      // * reset page back to 0 when sorts change
      setPage(0);
      const newSort = {};

      newSort[identifier] = {
        order: newOrder,
        orderBy: newSortingProperty,
      };

      setSorts(newSort);
    },
    [orderBy, order, setSorts, identifier]
  );

  return (
    <div className={classes.container}>
      <TableFilters
        filterDefinitions={filterDefinitions}
        identifier={identifier}
        onFilterChange={() => setPage(0)}
        numFiltersPerRow={numFiltersPerRow}
      />
      <Box sx={{ mb: 1 }}>
        {Boolean(searchLabel) && <CustomSearch updateSearch={onChangeSearch} label={searchLabel} />}
      </Box>
      <TableContainer component={Paper} className={classes.tableContainer}>
        <Table stickyHeader>
          <CustomTableHead
            columnDefinitions={columnDefinitions}
            order={order}
            orderBy={orderBy}
            onHandleSort={onHandleSort}
            // * this is specifically a loading state for ONLY the initial fetch
            isLoading={isFetchingInitialData}
          />

          <TableBody>
            {
              // * this is specifically a loading state for ONLY the initial fetch
              isFetchingInitialData ? (
                <TableRow>
                  <TableCell
                    style={{
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                    }}
                  >
                    <CircularProgress size={30} />
                  </TableCell>
                </TableRow>
              ) : (
                rowData?.map((row, index) => {
                  const rowOnClick = (e) => {
                    if (row?.onClick) {
                      row.onClick();
                    }
                    if (rowLinkPagePath) {
                      navigation.to(`${rowLinkPagePath}/${row.id}`, e.metaKey || e.ctrlKey);
                    }
                  };

                  return (
                    <TableRow
                      hover
                      className={classes.row}
                      key={row?.id ?? generateListItemKey(index)}
                      onClick={rowOnClick}
                      style={{
                        pointerEvents: isFetching ? 'none' : 'auto',
                        cursor: !rowLinkPagePath ? 'default' : 'pointer',
                      }}
                    >
                      {columnDefinitions.map(
                        ({ field, secondaryField, customCellType, featureId, style }) => {
                          return (
                            <Feature id={featureId} key={`${row.objectID}-${field}`}>
                              <CustomTableCell
                                style={{
                                  maxWidth: DEFAULT_COLUMN_WIDTH,
                                  ...style,
                                }}
                                search={search}
                                type={customCellType}
                                secondaryField={secondaryField}
                                field={field}
                                rowData={row}
                                onClick={onClickConfig[field]}
                                isLoading={isFetching}
                              />
                            </Feature>
                          );
                        }
                      )}
                    </TableRow>
                  );
                })
              )
            }
          </TableBody>
        </Table>
        <Footer
          page={page}
          setPage={setPage}
          rowsLength={rowData?.length || 0}
          paginationLimit={paginationLimit}
          setPaginationLimit={setPaginationLimit}
          isFetching={isFetching}
          isMoreData={isMoreData}
        />
      </TableContainer>
    </div>
  );
};

CustomTable.propTypes = {
  columnDefinitions: PropTypes.arrayOf(
    PropTypes.shape({
      field: PropTypes.string,
      headerName: PropTypes.string,
    })
  ).isRequired,
  rowLinkPagePath: PropTypes.string,
  subscriptionQuery: PropTypes.object,
  queryFilters: PropTypes.array,
  identifier: PropTypes.string.isRequired,
  dataMapping: PropTypes.func,
  onClickConfig: PropTypes.objectOf(PropTypes.func),
  filterDefinitions: PropTypes.array,
  searchLabel: PropTypes.string,
  numFiltersPerRow: PropTypes.number,
};

CustomTable.defaultProps = {
  rowLinkPagePath: '',
  subscriptionQuery: null,
  queryFilters: [],
  dataMapping: () => {},
  filterDefinitions: [],
  searchLabel: '',
  onClickConfig: {},
  numFiltersPerRow: null,
};
