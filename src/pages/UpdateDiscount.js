import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';

// material
import {
  Container,
  Stack,
  Typography,
  Grid,
  Box,
  TextField,
} from '@mui/material';
import { LoadingButton } from '@mui/lab';

// components
import Page from '../components/Page';
import Modal from '../components/Modal';
import {

  ProductCard,
} from '../sections/@dashboard/products';
// mock
import { getServices } from '../store/actions/services';
import { getCurrentDiscount, updateCurrentServiceDiscount } from '../api/services';

// ----------------------------------------------------------------------

export const groupBy = (key) => (array) =>
  array.reduce((objectsByKeyValue, obj) => {
    const value = obj[key];
    objectsByKeyValue[value] = (objectsByKeyValue[value] || []).concat(obj);
    return objectsByKeyValue;
  }, {});

const servicesDiscount = [
  {
    id: 1,
    title: 'Airtime Discount',
    imageUrl: 'https://lh3.googleusercontent.com/R7EA8raGXzMmBcfQ6DbYpRFYd5CKHCrYFoloncSCtMY-OPDiiv3IQY1KiGpfI6wswQ',
  },
];

export default function UpdateDiscount() {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [openFilter, setOpenFilter] = useState(false);
  const { services } = useSelector((state) => state.services);
  const [serviceProcessors, setServiceProcessors] = React.useState([]);
  const [currentServiceProcessor, setCurrentServiceProcessor] = React.useState('');
  const [loading, setLoading] = React.useState(false);
  const [isOpen, setModalOpen] = React.useState(false);

  const [discount, setDiscount] = React.useState('0');

  const groupByCategory = groupBy('category');

  const handleGetCurrentDiscount = async () => {
    const response = await getCurrentDiscount();
    if (response.ok) {
      setDiscount(response.data.data.processor.discount.airtime);
    }
  };

  const handleUpdateDiscount = async() => {
    if(!discount || discount < 0.1) {
      return;
    }

    const payload = { processor: { discount: { airtime: discount } } };

    console.log(discount);
    const response = await updateCurrentServiceDiscount(payload);
    if(response.ok) {
      setModalOpen(!isOpen);
    }
  };

  React.useEffect(() => {
    dispatch(getServices());
    handleGetCurrentDiscount();
  }, []);

  return (
    <>
      <Modal open={isOpen} toggleModal={() => setModalOpen(!isOpen)}>
        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <Typography>Please Specify The discount in percentage, example 1.5 on 100</Typography>
          <Stack spacing={'5px'}>
            <TextField
              type={'number'}
              placeholder="Discount"
              value={discount}
              onChange={(e) => setDiscount(e.target.value)}
            />
            <LoadingButton variant={'contained'} onClick={handleUpdateDiscount}>
              Update
            </LoadingButton>
          </Stack>
        </Box>
      </Modal>
      <Page title="Dashboard: update services">
        <Container>
          <Typography variant="h4" sx={{ mb: 1 }}>
            Update Services Discount
          </Typography>
          <Typography>Apply Discount to the service for your customers</Typography>
          <Grid container spacing={'10px'} sx={{ mt: '10px' }}>
            {servicesDiscount.map((discount, index) => (
              <Grid key={index} item xs={6} sm={3} onClick={() => setModalOpen(!isOpen)}>
                <ProductCard title={discount.title} imageUrl={discount.imageUrl} />
              </Grid>
            ))}
          </Grid>
        </Container>
      </Page>
    </>
  );
}
