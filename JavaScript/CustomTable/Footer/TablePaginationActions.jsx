import React from 'react';
import PropTypes from 'prop-types';
import { makeStyles, useTheme } from '@material-ui/core/styles';
import { IconButton, Typography } from '@material-ui/core';
import KeyboardArrowLeft from '@material-ui/icons/KeyboardArrowLeft';
import KeyboardArrowRight from '@material-ui/icons/KeyboardArrowRight';

const useStyles = makeStyles((theme) => ({
  root: {
    flexShrink: 0,
    marginLeft: theme.spacing(2.5),
    marginRight: theme.spacing(2.5),
  },
  button: {
    color: theme?.palette?.primary?.main,
    '&.Mui-disabled': {
      color: theme?.palette?.common?.grey,
    },
    '&:hover': {
      color: theme?.palette?.primary?.light,
    },
  },
}));

const TablePaginationActions = (props) => {
  const classes = useStyles();
  const theme = useTheme();
  const { page, onPageChange, numResults, rowsPerPage, isMoreData } = props;

  const handleBackButtonClick = (event) => {
    onPageChange(event, page - 1);
  };

  const handleNextButtonClick = (event) => {
    onPageChange(event, page + 1);
  };

  return (
    <div className={classes.root}>
      <IconButton
        className={classes.button}
        onClick={handleBackButtonClick}
        disabled={page === 0}
        aria-label="previous page"
      >
        {theme.direction === 'rtl' ? (
          <>
            <Typography style={{ textTransform: 'uppercase', fontSize: 12, fontWeight: 'bold' }}>
              Previous
            </Typography>
            <KeyboardArrowRight className={classes.icon} />
          </>
        ) : (
          <>
            <KeyboardArrowLeft className={classes.icon} />
            <Typography style={{ textTransform: 'uppercase', fontSize: 12, fontWeight: 'bold' }}>
              Previous
            </Typography>
          </>
        )}
      </IconButton>
      <IconButton
        className={classes.button}
        onClick={handleNextButtonClick}
        disabled={numResults < rowsPerPage || !isMoreData}
        aria-label="next page"
      >
        {theme.direction === 'rtl' ? (
          <>
            <KeyboardArrowLeft className={classes.icon} />
            <Typography style={{ textTransform: 'uppercase', fontSize: 12, fontWeight: 'bold' }}>
              Next
            </Typography>
          </>
        ) : (
          <>
            <Typography style={{ textTransform: 'uppercase', fontSize: 12, fontWeight: 'bold' }}>
              Next
            </Typography>
            <KeyboardArrowRight className={classes.icon} />
          </>
        )}
      </IconButton>
    </div>
  );
};

TablePaginationActions.propTypes = {
  onPageChange: PropTypes.func.isRequired,
  page: PropTypes.number.isRequired,
  rowsPerPage: PropTypes.number.isRequired,
  numResults: PropTypes.number.isRequired,
  isMoreData: PropTypes.bool,
};

TablePaginationActions.defaultProps = {
  isMoreData: true,
};

export { TablePaginationActions };
