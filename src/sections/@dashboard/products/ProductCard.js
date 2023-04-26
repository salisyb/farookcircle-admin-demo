/* eslint-disable camelcase */
import PropTypes from 'prop-types';
import { Link as RouterLink } from 'react-router-dom';
// material
import { Box, Card, Link, Typography, Stack } from '@mui/material';
import { styled } from '@mui/material/styles';
// utils
import { fCurrency } from '../../../utils/formatNumber';
// components
import Label from '../../../components/Label';
import { ColorPreview } from '../../../components/color-utils';

// ----------------------------------------------------------------------

// ----------------------------------------------------------------------

const getRandomImage = () => `/static/logo.svg`;
// const getRandomImage = () => `/static/materials/material_${Math.floor(Math.random() * (3 - 1) + 1)}.jpg`;

ShopProductCard.propTypes = {
  product: PropTypes.object,
};

export default function ShopProductCard({ title, imageUrl, onMaterialClick }) {
  return (
    <Card sx={{ height: '150px', }}>
        <Link to="#" color="inherit" underline="hover" component={RouterLink} onClick={onMaterialClick}>
      <Stack spacing={2} sx={{ p: 3 }} alignItems="center" justifyContent="center">
          <Typography variant="subtitle1" noWrap>
            {title}
          </Typography>
        <Box width="60px" height={'60px'} overflow='hidden' borderRadius='100px'>
          <img
            alt="Service"
            src={imageUrl}
            width="100%"
            height="100%"
          />
        </Box>
      </Stack>
      </Link>
    </Card>
  );
}
