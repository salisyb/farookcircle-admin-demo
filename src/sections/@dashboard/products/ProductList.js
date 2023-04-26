import PropTypes from 'prop-types';
// material
import { Grid } from '@mui/material';
import ShopProductCard from './ProductCard';

// ----------------------------------------------------------------------

ProductList.propTypes = {
  products: PropTypes.array.isRequired,
};

export default function ProductList({ products, materials, onMaterialClick, ...other }) {
  return (
    <Grid container spacing={3} {...other}>
      {materials.map((material) => (
        <Grid key={material.id} item xs={12} sm={6} md={3}>
          <ShopProductCard product={material} onMaterialClick={() => onMaterialClick(material)} />
        </Grid>
      ))}
    </Grid>
  );
}
