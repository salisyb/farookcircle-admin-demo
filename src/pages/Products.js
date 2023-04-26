import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { toast } from 'react-toastify';

// material
import {
  Container,
  ListItem,
  Select,
  Stack,
  Button,
  Typography,
  FormControl,
  InputLabel,
  MenuItem,
  Grid,
  CircularProgress,
} from '@mui/material';
// components
import Page from '../components/Page';
import Modal from '../components/Modal';
import {
  ProductSort,
  ProductList,
  ProductCartWidget,
  ProductFilterSidebar,
  ProductCard,
} from '../sections/@dashboard/products';
// mock
import PRODUCTS from '../_mock/products';
import { getServices } from '../store/actions/services';
import { getCurrentProcessor, getProcessors, updateCurrentServiceProcessor } from '../api/services';

// ----------------------------------------------------------------------

export const groupBy = key => array =>
  array.reduce((objectsByKeyValue, obj) => {
    const value = obj[key];
    objectsByKeyValue[value] = (objectsByKeyValue[value] || []).concat(obj);
    return objectsByKeyValue;
  }, {});

export default function EcommerceShop() {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [openFilter, setOpenFilter] = useState(false);
  const { services } = useSelector((state) => state.services);
  const [serviceProcessors, setServiceProcessors] = React.useState([]);
  const [currentServiceProcessor, setCurrentServiceProcessor] = React.useState('');
  const [loading, setLoading] = React.useState(false);

  const data = services.filter(data => data.service === 'Data');
  const cable = services.filter(data => data.service === 'Cable');
  const exam = services.filter(data => data.service === 'ResultCheck');

  const groupByCategory = groupBy('category');

  const dataService = groupByCategory(data);
  const cableService = groupByCategory(cable);
  const examService = groupByCategory(exam);


  const handleGetCurrentProcessor = async () => {
    const response = await getCurrentProcessor();
    if(response.ok) {
      setCurrentServiceProcessor(response.data.data ? response.data.data.processor.name : "gladtidingsdata")
    }
  };

  const handleGetProcessors = async () => {
    const response = await getProcessors();
    
    if (response.ok) {
      setServiceProcessors(response.data.data);
    }
  };

  const handleUpdateServiceProvider = async () => {
    setLoading(true);
    const response = await updateCurrentServiceProcessor(currentServiceProcessor);
    if (response.ok) {
      toast.success(response.data.message);
      setLoading(false);
      return;
    }

    toast.error(response.data.message);
    setLoading(false);
  };

  const navigateToServiceCategory = (path) => {
    navigate(path);
  }

  React.useEffect(() => {
    dispatch(getServices());
    handleGetProcessors();
    handleGetCurrentProcessor();

  }, []);

  return (
    <Page title="Dashboard: update services">
      <Container>
        <Typography variant="h4" sx={{ mb: 1 }}>
          Update Services
        </Typography>
        <Typography>Update service amount or services processor</Typography>
        <Grid container alignItems="center" mt="20px">
          <Grid item xs={8} sm={4}>
            <FormControl fullWidth size="small">
              <InputLabel id="demo-simple-select-label">Service Processors</InputLabel>
              <Select
                labelId="demo-simple-select-label"
                id="demo-simple-select"
                value={currentServiceProcessor}
                label="Service Processor"
                onChange={(event) => setCurrentServiceProcessor(event.target.value)}
              >
                {serviceProcessors.map((item) => (
                  <MenuItem key={item} value={item}>
                    {item}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={3} sm={6} ml="10px">
            <Button
              variant="contained"
              onClick={handleUpdateServiceProvider}
              disabled={!currentServiceProcessor || loading}
            >
              {loading ? <CircularProgress size={'20px'} /> : 'Update'}
            </Button>
          </Grid>
        </Grid>
        <Typography variant="h6" sx={{ my: 2 }}>
          Update Data Amount
        </Typography>
        <Grid container spacing={'10px'}>
          {Object.entries(dataService).map(([key, value]) => (
            <Grid key={key} item xs={6} sm={3}  onClick={() => navigateToServiceCategory(key)}>
              <ProductCard  title={key} imageUrl={value[0].imageUrl} />
            </Grid>
          ))}
        </Grid>
        <Typography variant="h6" sx={{ my: 2 }}>
          Update Cable Sub Amount
        </Typography>
        <Grid container spacing={'10px'}>
        {Object.entries(cableService).map(([key, value]) => (
            <Grid key={key} item xs={6} sm={3}  onClick={() => navigateToServiceCategory(key)}>
              <ProductCard  title={key} imageUrl={value[0].imageUrl} />
            </Grid>
          ))}
        </Grid>
        <Typography variant="h6" sx={{ my: 2 }}>
          Update Result Checker Amount
        </Typography>
        <Grid container spacing={'10px'}>
        {Object.entries(examService).map(([key, value]) => (
            <Grid key={key} item xs={6} sm={3}  onClick={() => navigateToServiceCategory(key)}>
              <ProductCard  title={key} imageUrl={value[0].imageUrl} />
            </Grid>
          ))}
        </Grid>
      </Container>
    </Page>
  );
}
