import React, { useState, useEffect } from 'react';
import {
  Input,
  Box,
  FormControl,
  InputLabel,
  InputAdornment,
  Stack,
  Typography,
  Divider,
  Button,
  CircularProgress,
  MenuItem,
  Select,
  TextField,
  IconButton,
} from '@mui/material';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { LocalizationProvider, DateRangePicker } from '@mui/x-date-pickers-pro';
import { SingleInputDateRangeField } from '@mui/x-date-pickers-pro/SingleInputDateRangeField';
import { useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import moment from 'moment-timezone';
import { useSelector } from 'react-redux';
import Iconify from '../components/Iconify';
import MainCard from './components/MainCard';
import TransactionsCard from './components/TransactionCard';
import ModalC from './components/CModal';
import { getTransactionsHistory, refundUser } from '../api/transactions.api';

export const TextValue = ({ text, value }) => (
  <Stack>
    <Typography>{text}</Typography>
    <Typography fontWeight={'bold'}>{value}</Typography>
  </Stack>
);

const Transactions = () => {
  const navigate = useNavigate();

  const { user } = useSelector((state) => state.auth);

  const [transactions, setTransactions] = useState(null);
  const [selected, setSelected] = useState(null);
  const [showModal, setShowModal] = useState(false);

  const [prevPage, setPrevPage] = useState(null);
  const [nextPage, setNextPage] = useState(null);

  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(false);
  const [filterTransactionType, setFilterTransactionType] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [totalAmount, setTotalAmount] = useState(0);
  const [value, setValue] = React.useState([null, null]);

  const toggleModal = () => setShowModal(!showModal);
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const filterUserId = queryParams.get('user');

  const [refunding, setRefunding] = useState(false);
  const [refundingLoading, setRefundingLoading] = useState(false);
  const [status, setStatus] = useState(false);
  const [statusMessage, setStatusMessage] = useState('');

  useEffect(() => {
    getTransactions({ page: 1 });
  }, [filterTransactionType, searchQuery, value]);

  const getTransactions = async (page) => {
    setLoading(true);

    const filterOptions = {
      ...page,
      filterTransactionType,
      searchQuery,
    };

    if (value[0] && value[1]) {
      filterOptions.startDate = moment(value[0]?.toString()).format('YYYY-MM-DD');
      filterOptions.endDate = moment(value[1]?.toString()).format('YYYY-MM-DD');
    }

    if (filterUserId) {
      filterOptions.username = filterUserId;
    }

    try {
      const response = await getTransactionsHistory(filterOptions);

      if (response.ok && response.data) {
        const { next, previous, results } = response.data;
        const transactions = results?.transactions;
        const totalAmount = results?.total_amount_spent;

        setTransactions(transactions);
        setPrevPage(previous);
        setNextPage(next);

        setTotalAmount(new Intl.NumberFormat().format(totalAmount));
      }
    } catch (error) {
      console.error('Error fetching transactions:', error);
    }

    setLoading(false);
  };

  const parseQueryString = (url) => {
    const queryString = url.split('?')[1];
    if (!queryString) return {};

    const params = {};
    queryString.split('&').forEach((param) => {
      const [key, value] = param.split('=');
      params[key] = decodeURIComponent(value);
    });
    return params;
  };

  const handlePrevPage = () => {
    if (prevPage) {
      const queryParams = parseQueryString(prevPage);
      getTransactions(queryParams);
    }
  };
  const handleNextPage = () => {
    if (nextPage) {
      const queryParams = parseQueryString(nextPage);
      getTransactions(queryParams);
    }
  };

  const handleRefundUser = async () => {
    setRefunding(true);
    setRefundingLoading(true);

    const response = await refundUser(selected?.transaction_ref);

    if (response.ok) {
      setStatusMessage(response.data?.message);
      setStatus(true);
      setRefundingLoading(false);
      return;
    }

    console.log('Refunding Error', response.data?.message);

    setStatusMessage('Error Refunding Transaction');
    setRefundingLoading(false);
    setStatus(false);
  };

  const handleCloseModal = () => {
    setRefunding(false);
    toggleModal();
  };

  console.log(selected);

  return (
    <>
      <ModalC isOpen={showModal} setOpen={toggleModal}>
        <Stack sx={{ cursor: 'pointer' }} direction={'row'} alignItems={'center'} justifyContent="space-between">
          <Typography>Transaction</Typography>
          {user?.isSuperUser &&
            selected?.transaction_type?.includes('PURCHASE') &&
            selected?.status?.toLowerCase() !== 'failed' && (
              <Button onClick={handleRefundUser} disabled={refunding}>
                Refund
              </Button>
            )}
        </Stack>

        {refunding && (
          <Stack direction={'column'} alignItems={'center'} justifyContent={'center'}>
            {refundingLoading ? (
              <>
                <CircularProgress sx={{my: '10px'}} />
                <Typography>Refunding Transaction...</Typography>
              </>
            ) : (
              <>
                <Typography my={"10px"}>{statusMessage}</Typography>
                <Button onClick={handleCloseModal}>OK</Button>
              </>
            )}
          </Stack>
        )}

        {selected && !refunding && (
          <Stack alignItems={'center'}>
            <Box p="15px" backgroundColor="rgb(39, 193,45)" borderRadius="30px" marginTop="20px">
              <Typography>{selected.transaction_type}</Typography>
            </Box>
            <Typography marginTop="10px" fontWeight="bold">
              {moment(selected.created_at).format('MMMM Do YYYY, h:mm:ss a')}
            </Typography>
            <Stack width="100%" marginTop="30px" spacing={'10px'}>
              <TextValue text={'Amount'} value={`₦${selected.amount}`} />
              <Divider />
              <TextValue text={'Description'} value={selected.name} />
              <Divider />
              <TextValue text={'Transaction Status'} value={selected.status} />
              <Divider />
              <TextValue text={'Transaction Ref'} value={selected.transaction_ref} />
              <Divider />

              <TextValue text={'Balance Before'} value={`₦${selected?.balance_before}`} />
              <Divider />
              <TextValue text={'Balance After'} value={`₦${selected?.balance_after}`} />
              <Divider />
            </Stack>
          </Stack>
        )}
      </ModalC>

        <Box sx={{ px: { xs: '0px', sm: '100px', md: '100px', lg: '100px' }, pb: '50px' }} minHeight={400}>
          <Stack spacing={'10px'} minHeight={550}>
            <Stack direction={'row'} spacing={1} alignItems={'center'}>
              <Typography fontSize={'20px'} fontWeight={'bold'}>
                Transactions History
              </Typography>
            </Stack>
            <FormControl variant="standard" sx={{ mb: '20px' }}>
              <InputLabel htmlFor="input-with-icon-adornment">Search...</InputLabel>
              <Input
                id="input-with-icon-adornment"
                endAdornment={<InputAdornment position="end">{/* <IconSearch /> */}</InputAdornment>}
                value={searchQuery}
                onChange={(event) => setSearchQuery(event.target.value)}
              />
            </FormControl>

            <Stack
              direction={{ xs: 'column-reverse', sm: 'row', md: 'row' }}
              spacing={3}
              alignItems={'center'}
              justifyContent={'space-between'}
            >
              <Typography fontSize={'16px'}>Total Amount: ₦ {totalAmount}</Typography>
              <LocalizationProvider dateAdapter={AdapterDayjs} localeText={{ start: 'Start-date', end: 'End-Date' }}>
                <DateRangePicker
                  value={value}
                  slots={{ field: SingleInputDateRangeField }}
                  onChange={(newValue) => {
                    setValue(newValue);
                  }}
                  renderInput={(startProps, endProps) => (
                    <>
                      <TextField {...startProps} />
                      <Box sx={{ mx: 2 }}> to </Box>
                      <TextField {...endProps} />
                    </>
                  )}
                />
              </LocalizationProvider>
            </Stack>
            <Divider />

            {loading ? (
              <Stack
                direction={'column'}
                sx={{ mt: '100px', display: 'flex', alignSelf: 'center', alignItems: 'center' }}
                spacing={3}
              >
                <CircularProgress />
                <Typography>Loading please wait ..</Typography>
              </Stack>
            ) : (
              <Stack overflow={'scroll'} spacing={3}>
                {transactions &&
                  transactions.map((transaction) => (
                    <div key={transaction.id}>
                      <TransactionsCard
                        onClick={() => {
                          setSelected(transaction);
                          toggleModal();
                        }}
                        data={transaction}
                      />
                      <Divider />
                    </div>
                  ))}
              </Stack>
            )}
          </Stack>
          <Box mt={3} display="flex" justifyContent="center">
            <Button disabled={!prevPage} onClick={handlePrevPage} sx={{ marginRight: '10px' }}>
              Previous
            </Button>
            <Button disabled={!nextPage} onClick={handleNextPage}>
              Next
            </Button>
          </Box>
        </Box>
   
    </>
  );
};

export default Transactions;
