import PropTypes from 'prop-types';
import { Helmet } from 'react-helmet-async';
import { forwardRef } from 'react';
// @mui
import { Box, Stack, Typography } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import Iconify from './Iconify';

// ----------------------------------------------------------------------

const Page = forwardRef(({ children, title = '', meta, ...other }, ref) => {
  const navigate = useNavigate();

  const handleGoBack = () => {
    navigate(-1);
  };

  return (
    <>
      <Helmet>
        <title>{`${title} | Dashboard`}</title>
        {meta}
      </Helmet>

      <Box ref={ref} {...other}>
        {/* Implmenet go back button here  */}
        {/* <Stack
          onClick={handleGoBack}
          direction={'row'}
          alignItems={'center'}
          spacing={1}
          sx={{ mb: 3, cursor: 'pointer', color: 'primary' }}
        >
          <Iconify icon="eva:arrow-ios-back-fill" width={20} height={20} />
          <Typography>
            <strong>Go Back</strong>
          </Typography>
        </Stack> */}

        {children}
      </Box>
    </>
  );
});

Page.propTypes = {
  children: PropTypes.node.isRequired,
  title: PropTypes.string,
  meta: PropTypes.node,
};

export default Page;
