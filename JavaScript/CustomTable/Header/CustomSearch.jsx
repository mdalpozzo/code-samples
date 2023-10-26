import React from 'react';
import _ from 'lodash';
import PropTypes from 'prop-types';
import SearchIcon from '@material-ui/icons/Search';
import InputAdornment from '@material-ui/core/InputAdornment';
import { makeStyles } from '@material-ui/core/styles';
import { FormTextField } from 'components/TextFields/FormTextField';

const useStyles = makeStyles((theme) => ({
  textfield: {
    width: '100%',
    backgroundColor: theme?.palette?.common?.white,
  },
  input: {
    color: theme.palette.brand.black,
  },
  icon: {
    color: theme.palette.brand.bark,
  },
}));

export const CustomSearch = (props) => {
  const classes = useStyles();

  const { updateSearch, label } = props;

  const debouncedSearch = _.debounce(
    (searchInput) => {
      updateSearch(searchInput);
    },
    500,
    { trailing: true }
  );

  const handleSearchField = (searchInput) => {
    debouncedSearch(searchInput);
  };

  return (
    <FormTextField
      variant="outlined"
      onChange={handleSearchField}
      id="standard-search"
      placeholder={label}
      type="search"
      className={classes.textfield}
      size="small"
      InputProps={{
        className: classes.input,
        startAdornment: (
          <InputAdornment position="start">
            <SearchIcon className={classes.icon} />
          </InputAdornment>
        ),
      }}
    />
  );
};

CustomSearch.propTypes = {
  updateSearch: PropTypes.func.isRequired,
  label: PropTypes.string,
};

CustomSearch.defaultProps = {
  label: 'Search',
};
