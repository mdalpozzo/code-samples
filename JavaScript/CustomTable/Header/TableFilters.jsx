import React from 'react';
import PropTypes from 'prop-types';
import { Grid, makeStyles } from '@material-ui/core';
import { useFilterActions } from 'state/storeActions';
import { DropdownTableFilter } from './DropdownTableFilter';

const useStyles = makeStyles((theme) => ({
  filterGrid: {
    marginBottom: theme.spacing(1),
  },
}));

export const TableFilters = ({
  filterDefinitions,
  identifier,
  onFilterChange,
  numFiltersPerRow,
}) => {
  const classes = useStyles();
  const { setFiltersByDomain, removeFiltersByDomain } = useFilterActions();

  // * if numFilterRows is provided then calculate the correct width per filter, otherwise default to 3 (4 filters per row)
  const filterWidths = numFiltersPerRow ? Math.floor(12 / numFiltersPerRow) : 3;

  const handleDropdownFilterSelection = (field) => async (selectedFilters) => {
    if (Array.isArray(selectedFilters) && !selectedFilters.length) {
      removeFiltersByDomain(field, identifier);
    } else {
      setFiltersByDomain(
        {
          [field]: selectedFilters,
        },
        identifier
      );
    }

    onFilterChange();
  };

  return (
    <Grid container alignItems="center" spacing={1} className={classes.filterGrid}>
      {filterDefinitions.map(({ field, label, selectDefaultOption, singleSelect }) => {
        return (
          <Grid key={field} xs sm md lg={filterWidths} item>
            <DropdownTableFilter
              field={field}
              label={label}
              section={identifier}
              onChange={handleDropdownFilterSelection(field)}
              selectDefaultOption={Boolean(selectDefaultOption)}
              singleSelect={Boolean(singleSelect)}
            />
          </Grid>
        );
      })}
    </Grid>
  );
};

TableFilters.propTypes = {
  filterDefinitions: PropTypes.arrayOf(PropTypes.any).isRequired,
  identifier: PropTypes.string.isRequired,
  onFilterChange: PropTypes.func,
  numFiltersPerRow: PropTypes.number,
};
TableFilters.defaultProps = {
  onFilterChange: null,
  numFiltersPerRow: null,
};
