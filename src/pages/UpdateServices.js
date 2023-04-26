import React from 'react';
import { toast } from 'react-toastify';
import {
  Box,
  Button,
  CircularProgress,
  FormControl,
  Grid,
  InputLabel,
  MenuItem,
  Select,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import { useParams } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import ProductItem from './components/Services/ProductItem';
import BasicModal from './components/Modal';
import { getProcessors, updateServices } from '../api/services';
import { getServices } from '../store/actions/services';

export default function UpdateService() {
  const dispatch = useDispatch();
  const { category } = useParams();
  const [editedItem, setEditedItem] = React.useState(null);
  const [showEdit, setShowEdit] = React.useState(false);
  const [amount, setAmount] = React.useState('');
  const { services } = useSelector((state) => state.services);
  const [loading, setLoading] = React.useState(false);
  const [serviceProcessors, setServiceProcessors] = React.useState([]);
  const [currentServiceProcessor, setCurrentServiceProcessor] = React.useState('');
  const selectedCategory = services.filter((service) => service.category === category);

  const handleGetProcessors = async () => {
    const response = await getProcessors();

    if (response.ok) {
      setServiceProcessors(response.data.data);
    }
  };

  const handleEditServiceAmount = (service) => {
    setEditedItem(service);
    if (service.service === 'Data') {
      setCurrentServiceProcessor(service.processor.authorization.split('_')[0].toLowerCase());
    }
    setShowEdit(true);
  };

  const handleUpdateAmount = async () => {
    
    const payload = {
      serviceId: editedItem.id,
      amount,
    };

    if(currentServiceProcessor) {
      payload.serviceProcessor = currentServiceProcessor
    }

    const response = await updateServices(payload);
    if (response.ok) {
      setLoading(false);
      setShowEdit(false);
      toast.success(response.data.message);
      dispatch(getServices());
      return;
    }

    setLoading(false);
    toast.error(response.data.message);
  };

  React.useEffect(() => {
    handleGetProcessors();
  }, []);

  return (
    <>
      <BasicModal isOpen={showEdit} toggleOpen={() => setShowEdit(!showEdit)}>
        <Box>
          <Typography>Current Amount: {editedItem && editedItem.details.amount}</Typography>
          {editedItem && editedItem.service === 'Data' && (
            <Grid item xs={8} sm={4} marginTop="20px">
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
          )}
          <TextField
            fullWidth
            sx={{ my: '20px' }}
            id="outlined-required"
            label="Amount"
            value={amount}
            onChange={(event) => {
              if (Number(event.target.value) || event.target.value === '') {
                setAmount(event.target.value);
              }
            }}
          />

          <Stack spacing={'10px'}>
            <Button variant={'contained'} marginLeft="10px" onClick={handleUpdateAmount} disabled={loading}>
              {loading ? <CircularProgress size="20px" /> : 'Update Service'}
            </Button>
            <Button variant={'outlined'} onClick={() => setShowEdit(false)}>
              Cancel
            </Button>
          </Stack>
        </Box>
      </BasicModal>
      <Box padding={'20px'}>
        <Typography variant="h4">Update {category}</Typography>
        <Grid container spacing={'10px'}>
          {selectedCategory.map((item) => (
            <Grid
              key={item.id}
              item
              xs={6}
              sm={2}
              sx={{ cursor: 'pointer' }}
              onClick={() => handleEditServiceAmount(item)}
            >
              <ProductItem
                title={`${category} ${item.details.name}`}
                amount={item.details.amount}
                imageUrl={item.imageUrl}
              />
            </Grid>
          ))}
        </Grid>
      </Box>
    </>
  );
}
