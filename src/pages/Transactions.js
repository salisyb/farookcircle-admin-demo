/* eslint-disable no-restricted-syntax */
/* eslint-disable no-nested-ternary */
/* eslint-disable camelcase */
import React, { useState, useEffect, useCallback } from 'react';
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
  Card,
  Table,
  Avatar,
  Checkbox,
  TableRow,
  TableBody,
  TableCell,
  Container,
  TableContainer,
  TablePagination,
  Link,
  PaginationItem,
} from '@mui/material';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import isAfter from 'date-fns/isAfter';
import subDays from 'date-fns/subDays';
import startOfWeek from 'date-fns/startOfWeek';
import endOfWeek from 'date-fns/endOfWeek';
import addDays from 'date-fns/addDays';

// import { LocalizationProvider, DateRangePicker } from '@mui/x-date-pickers-pro';
import { SingleInputDateRangeField } from '@mui/x-date-pickers-pro/SingleInputDateRangeField';
import { useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import moment from 'moment-timezone';
import { useSelector } from 'react-redux';
import { DateRangePicker } from 'rsuite';
import { filter } from 'lodash';
import { sentenceCase } from 'change-case';
import { formatMoney } from '../utils/formatNumber';
import Scrollbar from '../components/Scrollbar';
import FundingListHead from '../sections/@dashboard/user/FundingListHead';
import SearchNotFound from '../components/SearchNotFound';
import Label from '../components/Label';
import { getTransactionsHistory, refundUser } from '../api/transactions.api';
import ModalC from './components/CModal';
import TransactionsCard from './components/TransactionCard';
import MainCard from './components/MainCard';
import Iconify from '../components/Iconify';
import TransactionPopoverModal from './components/TransactionPopoverModal';

const TABLE_HEAD = [
  { id: 'name', label: 'Descriptions', alignRight: false },
  { id: 'amount', label: 'Amount', alignRight: false },
  { id: 'status', label: 'Status', alignRight: false },
  { id: 'transaction_ref', label: 'Reference', alignRight: false },
  { id: 'transaction_type', label: 'Type', alignRight: false },
  { id: 'balance_before', label: 'Bal Before', alignRight: false },
  { id: 'balance_after', label: 'Balance After', alignRight: false },
  { id: 'created_at', label: 'Date', alignRight: false },
];

function descendingComparator(a, b, orderBy) {
  if (b[orderBy] < a[orderBy]) {
    return -1;
  }
  if (b[orderBy] > a[orderBy]) {
    return 1;
  }
  return 0;
}

function getComparator(order, orderBy) {
  return order === 'desc'
    ? (a, b) => descendingComparator(a, b, orderBy)
    : (a, b) => -descendingComparator(a, b, orderBy);
}

function applySortFilter(array, comparator, query) {
  const stabilizedThis = array.map((el, index) => [el, index]);
  stabilizedThis.sort((a, b) => {
    const order = comparator(a[0], b[0]);
    if (order !== 0) return order;
    return a[1] - b[1];
  });
  if (query) {
    return filter(array, (_user) => _user.username.toLowerCase().indexOf(query.toLowerCase()) !== -1);
  }
  return stabilizedThis.map((el) => el[0]);
}

export const TextValue = ({ text, value }) => (
  <Stack>
    <Typography>{text}</Typography>
    <Typography fontWeight={'bold'}>{value}</Typography>
  </Stack>
);

const predefinedBottomRanges = [
  {
    label: 'Today',
    value: [new Date(), new Date()],
  },
  {
    label: 'Yesterday',
    value: [addDays(new Date(), -1), addDays(new Date(), -1)],
  },
  {
    label: 'Last 7 days',
    value: [subDays(new Date(), 6), new Date()],
  },
  {
    label: 'Last 30 days',
    value: [subDays(new Date(), 29), new Date()],
  },
];

const Transactions = () => {
  const navigate = useNavigate();

  const { user } = useSelector((state) => state.auth);

  const [transactions, setTransactions] = React.useState([]);

  const [filterTransaction, setFilterTransaction] = React.useState(transactions);

  const [page, setPage] = React.useState(0);

  const [order, setOrder] = React.useState('asc');

  const [count, setCount] = React.useState(0);

  const [selected, setSelected] = React.useState([]);

  const [selectedTransaction, setSelectedTransaction] = React.useState(null);

  const [orderBy, setOrderBy] = React.useState('name');

  const [filterName, setFilterName] = React.useState('');

  const [paginationPage, setPaginationPage] = React.useState(1);

  const [rowsPerPage, setRowsPerPage] = React.useState(10);

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

  const [query, setQuery] = useState('');

  console.log(query);

  const getTransactions = useCallback(async () => {
    if (!query) {
      return;
    }
    setLoading(true);

    const filterOptions = {
      page: paginationPage,
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

    if (query) {
      filterOptions.query = query;
    }

    try {
      const response = await getTransactionsHistory(filterOptions);

      if (response.ok && response.data) {
        const { next, previous, results, count } = response.data;
        const transaction = results?.transactions;
        const totalAmount = results?.total_amount_spent;
        setCount(count);
        setFilterTransaction(transaction);
        setTransactions(transaction);
        setPrevPage(previous);
        setNextPage(next);

        setTotalAmount(new Intl.NumberFormat().format(totalAmount));
      }
    } catch (error) {
      console.error('Error fetching transactions:', error);
    }

    setLoading(false);
  }, [query, paginationPage, filterTransactionType, searchQuery, value, filterUserId]);

  // useEffect(() => {
  //   getTransactions();
  // }, [filterTransactionType, searchQuery, value, paginationPage, getTransactions]);

  const emptyRows = page > 0 ? Math.max(0, (1 + page) * rowsPerPage - filterTransaction.length) : 0;

  const filteredUsers = applySortFilter(filterTransaction, getComparator(order, orderBy), filterName);

  const isUserNotFound = filteredUsers.length === 0;

  const handleRequestSort = (event, property) => {
    const isAsc = orderBy === property && order === 'asc';
    setOrder(isAsc ? 'desc' : 'asc');
    setOrderBy(property);
  };

  const handlePrevPage = () => {
    if (prevPage) {
      setPaginationPage(paginationPage - 1);
    }
  };
  const handleNextPage = async () => {
    if (nextPage) {
      setPaginationPage(paginationPage + 1);
    }
  };

  const handleRefundUser = async () => {
    setRefunding(true);
    setRefundingLoading(true);

    const response = await refundUser(selectedTransaction?.transaction_ref);

    if (response.ok) {
      setStatusMessage(response.data?.message);
      setStatus(true);
      setRefundingLoading(false);
      return;
    }

    setStatusMessage('Error Refunding Transaction');
    setRefundingLoading(false);
    setStatus(false);
  };

  const handleCloseModal = () => {
    setRefunding(false);
    toggleModal();
  };

  const handleExportTransactionToCsv = () => {
    const csv = filterTransaction.map((transaction) => {
      const {
        id,
        name,
        amount,
        transaction_ref,
        transaction_type,
        status,
        created_at,
        type,
        balance_before,
        balance_after,
      } = transaction;
      return {
        id,
        name,
        amount,
        transaction_ref,
        transaction_type: transaction_type?.split('_').join(' ') || type?.split('_').join(' '),
        status,
        created_at: moment(created_at).format('MMM Do YYYY, h:mm a'),
        balance_before,
        balance_after,
      };
    });

    const csvData = csv.map((row) => Object.values(row).join(',')).join('\n');

    const blob = new Blob([csvData], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.setAttribute('hidden', '');
    a.setAttribute('href', url);
    a.setAttribute('download', 'transactions.csv');
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const handleApplyFilter = useCallback(
    (filter) => {
      if (Object.keys(filter).length < 1) {
        setFilterTransaction(transactions);
        return;
      }

      const filteredList = transactions.filter((transact) => {
        for (const key in filter) {
          if (transact[key] !== filter[key] && key !== 'created_at') {
            return false;
          }
        }

        if (filter.created_at) {
          if (filter.created_at !== moment(transact.created_at).format('YYYY-MM-DD')) {
            return false;
          }
        }

        return true;
      });

      // setPage(1);
      setFilterTransaction(filteredList);
    },
    [transactions]
  );

  return (
    <>
      <ModalC isOpen={showModal} setOpen={toggleModal}>
        <Stack sx={{ cursor: 'pointer' }} direction={'row'} alignItems={'center'} justifyContent="space-between">
          <Typography>Transaction</Typography>
          {user?.isSuperUser &&
            selectedTransaction?.transaction_type?.includes('PURCHASE') &&
            selectedTransaction?.status?.toLowerCase() !== 'failed' && (
              <Button onClick={handleRefundUser} disabled={refunding}>
                Refund
              </Button>
            )}
        </Stack>

        {refunding && (
          <Stack direction={'column'} alignItems={'center'} justifyContent={'center'}>
            {refundingLoading ? (
              <>
                <CircularProgress sx={{ my: '10px' }} />
                <Typography>Refunding Transaction...</Typography>
              </>
            ) : (
              <>
                <Typography my={'10px'}>{statusMessage}</Typography>
                <Button onClick={handleCloseModal}>OK</Button>
              </>
            )}
          </Stack>
        )}

        {selectedTransaction && !refunding && (
          <Stack alignItems={'center'}>
            <Box p="15px" backgroundColor="rgb(39, 193,45)" borderRadius="30px" marginTop="20px">
              <Typography>{selectedTransaction.transaction_type || selectedTransaction.type}</Typography>
            </Box>
            <Typography marginTop="10px" fontWeight="bold">
              {moment(selectedTransaction.created_at).format('MMMM Do YYYY, h:mm:ss a')}
            </Typography>
            <Stack width="100%" marginTop="30px" spacing={'10px'}>
              <TextValue text={'Amount'} value={`₦${selectedTransaction.amount}`} />
              <Divider />
              <TextValue text={'Description'} value={selectedTransaction.name || 'N/A'} />
              <Divider />
              <TextValue text={'Transaction Status'} value={selectedTransaction.status} />
              <Divider />
              <TextValue text={'Transaction Ref'} value={selectedTransaction.transaction_ref} />
              <Divider />

              <TextValue text={'Balance Before'} value={`₦${selectedTransaction?.balance_before}`} />
              <Divider />
              <TextValue text={'Balance After'} value={`₦${selectedTransaction?.balance_after}`} />
              <Divider />
            </Stack>
          </Stack>
        )}
      </ModalC>

      <Box sx={{ px: { xs: '0px', sm: '100px', md: '50px', lg: '50px' }, pb: '50px' }} minHeight={400}>
        <Stack minHeight={550}>
          {/* Page header  */}
          <Stack direction={'column'} spacing={'5px'}>
            <Typography fontSize={'20px'} fontWeight={'bold'}>
              Transactions History
            </Typography>
          </Stack>

          {/* page header end  */}

          {/* Filter  */}
          <Stack direction={'row'} spacing={2} alignItems={'flex-start'} justifyContent={'space-between'} mt={'20px'}>
            <Stack spacing={2}>
              <TextField
                size={'small'}
                placeholder={'Search transactions...'}
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton onClick={getTransactions}>
                        <Iconify icon={'weui:search-outlined'} />
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
              />
              <Typography>
                Total Amount <span style={{ color: '#3366FF' }}>₦{totalAmount}</span>
              </Typography>
            </Stack>
            {/* date filter  */}

            <Stack direction={'row'} spacing={2} alignItems={'center'}>
              <DateRangePicker
                ranges={predefinedBottomRanges}
                shouldDisableDate={(date) => isAfter(date, new Date())}
                placeholder={'Start Date   ~   End Date'}
                onChange={(value) => setValue(value)}
              />
              {/* date filter end */}

              <Button
                onClick={handleExportTransactionToCsv}
                startIcon={<Iconify icon={'iwwa:file-csv'} />}
                variant="outlined"
              >
                Export CSV
              </Button>

              <Stack alignItems={'center'} spacing={1} direction={'row'}>
                <TransactionPopoverModal onApplyFilter={handleApplyFilter} />
              </Stack>
            </Stack>
          </Stack>
          {/* Filter end  */}

          {/* Transaction not found  */}

          {(filterTransaction.length < 1 || loading) && (
            <Stack
              width={'100%'}
              bgcolor={'white'}
              flex={1}
              mt={'20px'}
              direction={'column'}
              alignItems={'center'}
              justifyContent={'center'}
              sx={{
                shadow: '0px 4px 4px rgba(0, 0, 0, 0.05)',
              }}
            >
              {loading ? (
                <>
                  <CircularProgress />
                  <Typography mt={'20px'} variant={'h6'}>
                    Loading please wait...
                  </Typography>
                </>
              ) : (
                <>
                  <Iconify icon={'bx:bxs-error'} width={'70px'} height={'70px'} color={'#3366FF'} />
                  <Typography variant={'h6'}>No Transaction Found</Typography>
                </>
              )}
            </Stack>
          )}
          {/* Transaction not found end  */}
          {filterTransaction.length > 0 && (
            <Card sx={{ mt: '20px' }}>
              <Scrollbar>
                <TableContainer sx={{ width: '130%' }}>
                  <Table>
                    <FundingListHead
                      order={order}
                      orderBy={orderBy}
                      headLabel={TABLE_HEAD}
                      rowCount={count}
                      numSelected={selected.length}
                      onRequestSort={handleRequestSort}
                    />
                    <TableBody>
                      {filteredUsers.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((row) => {
                        const {
                          id,
                          name,
                          amount,
                          transaction_ref,
                          transaction_type,
                          status,
                          balance_before,
                          balance_after,
                          created_at,
                          type,
                        } = row;

                        return (
                          <TableRow
                            hover
                            key={''}
                            tabIndex={-1}
                            onClick={() => navigate(`/dashboard/transaction/data?id=${id}`)}
                            sx={{ cursor: 'pointer' }}
                          >
                            <TableCell padding="checkbox">
                              {/* <Checkbox checked={isItemSelected} onChange={(event) => handleClick(event, id)} /> */}
                            </TableCell>
                            <TableCell component="th" scope="row" padding="none">
                              <Stack direction="row" alignItems="center" spacing={2}>
                                {/* <Avatar alt={agent} src={avatar} /> */}
                                <Typography variant="subtitle2" noWrap>
                                  {`${name || 'N/A'}`}
                                </Typography>
                              </Stack>
                            </TableCell>
                            <TableCell align="left">{formatMoney(amount)}</TableCell>
                            <TableCell align="left">
                              <Label
                                variant="ghost"
                                color={
                                  status?.toLowerCase() === 'successful'
                                    ? 'success'
                                    : status?.toLowerCase() === 'failed'
                                    ? 'error'
                                    : 'warning'
                                }
                              >
                                {sentenceCase(status)}
                              </Label>
                            </TableCell>
                            <TableCell align="left">{transaction_ref}</TableCell>
                            <TableCell align="left">
                              <Label variant="ghost" color={'info'}>
                                {transaction_type?.split('_').join(' ') || type?.split('_').join(' ').toUpperCase()}
                              </Label>
                            </TableCell>
                            <TableCell align="left">{formatMoney(balance_before)}</TableCell>
                            <TableCell align="left">{formatMoney(balance_after)}</TableCell>
                            <TableCell align="left">{moment(created_at).format('MMM Do YYYY, h:mm a')}</TableCell>
                          </TableRow>
                        );
                      })}
                      {emptyRows > 0 && (
                        <TableRow style={{ height: 53 * emptyRows }}>
                          <TableCell colSpan={6} />
                        </TableRow>
                      )}
                    </TableBody>

                    {isUserNotFound && (
                      <TableBody>
                        <TableRow>
                          <TableCell align="center" colSpan={6} sx={{ py: 3 }}>
                            <SearchNotFound searchQuery={filterName} />
                          </TableCell>
                        </TableRow>
                      </TableBody>
                    )}
                  </Table>
                </TableContainer>
              </Scrollbar>

              {/* custom pagination  */}

              <Stack direction={'row'} justifyContent={'center'} alignItems={'center'} my={'20px'}>
                <Stack direction={'row'} spacing={2} alignItems={'center'}>
                  <IconButton
                    onClick={handlePrevPage}
                    disabled={!prevPage}
                    sx={{ color: prevPage ? '#3366FF' : 'gray' }}
                  >
                    <Iconify icon={'bx:bx-chevron-left'} />
                  </IconButton>
                  {/* Render page numbers */}
                  <Stack direction={'row'} spacing={2} alignItems={'center'}>
                    {Array.from({ length: Math.ceil(count / 10) }, (_, i) => (
                      <Typography
                        key={i}
                        variant={'body2'}
                        sx={{
                          cursor: 'pointer',
                          color: i + 1 === paginationPage ? '#3366FF' : 'black',
                          fontWeight: i + 1 === paginationPage ? 'bold' : 'normal',
                        }}
                        onClick={() => setPaginationPage(i + 1)}
                      >
                        {i + 1}
                      </Typography>
                    ))}
                  </Stack>
                  <IconButton
                    onClick={handleNextPage}
                    disabled={!nextPage}
                    sx={{ color: nextPage ? '#3366FF' : 'gray' }}
                  >
                    <Iconify icon={'bx:bx-chevron-right'} />
                  </IconButton>
                </Stack>
              </Stack>

              {/* custom pagination end  */}
            </Card>
          )}
          {/* Transaction Card  */}
        </Stack>
      </Box>
    </>
  );
};

export default Transactions;
