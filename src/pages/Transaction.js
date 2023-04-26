import React from 'react';
import {
  Input,
  Box,
  FormControl,
  InputLabel,
  InputAdornment,
  Stack,
  Typography,
  Divider,
  CircularProgress,
  Select,
  MenuItem,
} from '@mui/material';

// project imports
import MainCard from './components/MainCard';

import TransactionsCard from './components/TransactionCard';

import ModalC from './components/CModal';
import { getTransactionsHistory, getUsernameTransaction } from '../api/transactions.api';

// ==============================|| TYPOGRAPHY ||============================== //

export const TextValue = ({ text, value }) => (
  <Stack>
    <Typography>{text}</Typography>
    <Typography fontWeight={'bold'}>{value}</Typography>
  </Stack>
);

const Transactions = () => {
  const [transactions, setTransactions] = React.useState([]);
  const [selected, setSelected] = React.useState(null);
  const [showModal, setShowModal] = React.useState(false);
  const [loading, setLoading] = React.useState(false);
  const [filteredTransaction, setFilteredTransaction] = React.useState([]);
  const [transactionTypeFilter, setTransactionTypeFilter] = React.useState({});
  const [user, setUser] = React.useState('');

  const [filter, setFilter] = React.useState('');

  const handleChange = (event) => {
    if (event.target.value === '') {
      setFilteredTransaction(transactions);
      setFilter(event.target.value);
      return;
    }
    setFilteredTransaction(transactions.filter((item) => item.transactionType === event.target.value));
    setFilter(event.target.value);
  };

  const handleGetSelectedAgentUsername = async (userId) => {
    const request = await getUsernameTransaction(userId);
    if (request.ok) {
      setUser(request.data.data);
    }
  };

  const toggleModal = () => setShowModal(!showModal);

  React.useEffect(() => {
    getTransactions();
  }, []);

  React.useEffect(() => {
    if (selected) {
      handleGetSelectedAgentUsername(selected.entityTypeId);
    }
  }, [selected]);

  const getTransactions = async () => {
    setLoading(true);
    const response = await getTransactionsHistory();

    const transactionType = {};

    if (response.ok) {
      setTransactions(response.data.data);
      setFilteredTransaction(response.data.data);

      response.data.data.map((transaction) => {
        transactionType[transaction.transactionType] = transaction.transactionType;
        return 'nothing';
      });

      setTransactionTypeFilter(transactionType);
    }

    setLoading(false);
  };

  if (loading) {
    return (
      <Box
        sx={{
          w: '100vw',

          marginTop: '100px',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
        }}
      >
        <CircularProgress size={'sm'} />
      </Box>
    );
  }

  return (
    <>
      <ModalC isOpen={showModal} setOpen={toggleModal}>
        <Stack sx={{ cursor: 'pointer' }} direction={'row'} justifyContent="space-between">
          <Typography>Transaction</Typography>
          {/* <IconX onClick={toggleModal} /> */}
        </Stack>
        {selected && (
          <Stack alignItems={'center'}>
            <Box p="15px" backgroundColor="rgb(39, 193,45)" borderRadius="30px" marginTop="20px">
              <Typography>{selected.transactionType}</Typography>
            </Box>
            <Typography marginTop="10px" fontWeight="bold">
              {selected.createdAt}
            </Typography>
            <Stack width="100%" marginTop="30px" spacing={'10px'}>
              <Divider />
              <TextValue text={'Agent ID'} value={`${selected.entityTypeId}`} />
              <Divider />
              <TextValue text={'Agent Username'} value={`${user.username ?? '-------'}`} />
              <Divider />
              <TextValue text={'Amount'} value={`₦${selected.amount}`} />
              <Divider />
              <TextValue text={'Description'} value={selected.description} />
              <Divider />
              <TextValue text={'Transaction Status'} value={selected.status} />
              <Divider />
              <TextValue text={'Transaction Ref'} value={selected.ref} />
              <Divider />
              {selected.details && selected.details.balance && (
                <>
                  <TextValue text={'Balance Before'} value={`₦${selected.details.balance.before}`} />
                  <Divider />
                  <TextValue text={'Balance After'} value={`₦${selected.details.balance.after}`} />
                  <Divider />
                </>
              )}
            </Stack>
          </Stack>
        )}
      </ModalC>

      <MainCard title="Transactions History">
        <Box sx={{ px: { xs: '0px', sm: '100px', md: '140px', lg: '180px' }, pb: '50px' }}>
          {/* <SubCard> */}
          <Stack spacing={'10px'}>
            <Stack sx={{ flexDirection: 'row', alignItems: 'center' }}>
              <FormControl sx={{ m: 1, minWidth: 120 }} size="small">
                <InputLabel id="demo-select-small">Transaction Type</InputLabel>
                <Select
                  labelId="demo-select-small"
                  id="demo-select-small"
                  value={filter}
                  label="Transaction Type"
                  onChange={handleChange}
                >
                  <MenuItem value={''}>All</MenuItem>
                  {Object.keys(transactionTypeFilter).map((filterType, index) => (
                    <MenuItem key={filterType} value={filterType}>
                      {filterType}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Stack>

            <FormControl variant="standard" sx={{ mb: '20px' }}>
              <InputLabel htmlFor="input-with-icon-adornment">Search...</InputLabel>
              <Input
                id="input-with-icon-adornment"
                endAdornment={<InputAdornment position="end">{/* <IconSearch /> */}</InputAdornment>}
              />
              <Stack sx={{ my: '20px' }}>
                <FormControl>
                  <InputLabel id="demo-select-small">Search By</InputLabel>
                  <Select labelId="demo-select-small" id="demo-select-small" label="Transaction Type">
                    <MenuItem value={'ref'}>Transaction ref</MenuItem>
                  </Select>
                </FormControl>
              </Stack>
            </FormControl>
            {filteredTransaction.reverse().map((transaction) => (
              <>
                <TransactionsCard
                  onClick={() => {
                    setSelected(transaction);
                    toggleModal();
                  }}
                  key={transaction.id}
                  avatarUrl={transaction.imageUrl}
                  name={transaction.name}
                  amount={transaction.amount}
                />
                <Divider />
              </>
            ))}
          </Stack>
          {/* </SubCard> */}
        </Box>
      </MainCard>
    </>
  );
};

export default Transactions;
