/* eslint-disable no-nested-ternary */
/* eslint-disable arrow-body-style */
/* eslint-disable no-else-return */
/* eslint-disable camelcase */
import React, { useCallback, useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { filter } from 'lodash';
// material
import {
  Card,
  Table,
  Stack,
  Button,
  TableRow,
  TableBody,
  TableCell,
  Container,
  Typography,
  TableContainer,
  TablePagination,
  Box,
  CircularProgress,
  Grid,
  IconButton,
  Select,
  FormControl,
  FormLabel,
  RadioGroup,
  FormControlLabel,
  Radio,
  TextField,
} from '@mui/material';

import moment from 'moment-timezone';
import { toast } from 'react-toastify';
import { LoadingButton } from '@mui/lab';
import { useNavigate } from 'react-router-dom';
import Iconify from '../components/Iconify';
import TransitionsModal from '../components/Modal';
import { USER_UPDATE } from '../store/constants/auth';
import { getUserInfo } from '../api/auth.api';

// components
import { getStaffAccountData, getTransactionsAgent } from '../store/actions/users';
import Page from '../components/Page';
import Label from '../components/Label';
import Scrollbar from '../components/Scrollbar';
import SearchNotFound from '../components/SearchNotFound';
import { UserListHead, UserListToolbar } from '../sections/@dashboard/user';
// mock
// import USERLIST from '../_mock/user';
import { WithdrawalRequest } from './components/dashboard/WithdrawalRequest';
import { GET_DEDUCTIONS } from '../store/constants/system';
import { getPendingDeductions, respondPendingWithdrawal } from '../api/system.api';
import UserListDeduct from '../sections/@dashboard/user/UserListDeduct';

// ----------------------------------------------------------------------

// mock avatar url

const TABLE_HEAD = [
  { id: 'submit_by', label: 'Submit By', alignRight: false },
  { id: 'amount', label: 'Amount', alignRight: false },
  { id: 'reason', label: 'Reason', alignRight: false },
  { id: 'date_created', label: 'Date', alignRight: false },
  { id: 'status', label: 'Status', alignRight: false },
  { id: '' },
];

// ----------------------------------------------------------------------

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

export default function DeductionManagement() {
  const dispatch = useDispatch();

  const navigate = useNavigate();

  const { user } = useSelector((state) => state.auth);

  const { deductions } = useSelector((state) => state.system);

  const [filterTransaction, setFilterTransaction] = React.useState(deductions);

  const [page, setPage] = React.useState(0);

  const [order, setOrder] = React.useState('asc');

  const [selected, setSelected] = React.useState([]);

  const [orderBy, setOrderBy] = React.useState('name');

  const [filterName, setFilterName] = React.useState('');

  const [rowsPerPage, setRowsPerPage] = React.useState(5);

  const handleRequestSort = (event, property) => {
    const isAsc = orderBy === property && order === 'asc';
    setOrder(isAsc ? 'desc' : 'asc');
    setOrderBy(property);
  };

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleFilterByName = (event) => {
    setFilterName(event.target.value);
  };

  const emptyRows = page > 0 ? Math.max(0, (1 + page) * rowsPerPage - filterTransaction.length) : 0;

  const filteredUsers = applySortFilter(filterTransaction, getComparator(order, orderBy), filterName);

  const isUserNotFound = filteredUsers.length === 0;

  // state
  const [userClicked, setUserClicked] = React.useState(false);
  const [userClickId, setUserClickId] = React.useState(null);
  const [isLoading, setIsLoading] = React.useState(false);

  const toggleModal = () => setUserClicked(!userClicked);

  const handleClickUser = (id) => {
    setUserClickId(id);
    toggleModal();
  };

  React.useEffect(() => {
    dispatch(getStaffAccountData());
    dispatch(getTransactionsAgent({ date: new Date().toISOString().split('T')[0] }));
    handleGetUserData();
  }, []);

  const handleFilterTransactions = async (queryFilter) => {
    const filteredTransactions = deductions.filter((transaction) => {
      return Object.entries(queryFilter).every(([key, value]) => {
        if (transaction[key] === undefined || transaction[key] === null) {
          console.log('returning here');
          return false;
        }

        if (key === 'amount' || key === 'balance') {
          // Handle numeric fields with equality check
          return transaction[key] === parseFloat(value);
        } else if (key === 'createdAt' || key === 'updatedAt') {
          // Handle date fields with date comparison (if needed)
          return new Date(transaction[key]).toISOString().startsWith(value);
        } else {
          // Handle string fields with inclusion check
          return transaction[key].toString().includes(value);
        }
      });
    });

    setFilterTransaction(filteredTransactions);
    setPage(0);
  };

  const handleApplyFilter = (filter) => {
    if (Object.keys(filter).length < 1) {
      setFilterTransaction(deductions);
      return;
    }
    handleFilterTransactions(filter);
  };

  const handleGetUserData = async () => {
    const request = await getUserInfo();

    if (request.ok) {
      dispatch({ type: USER_UPDATE, payload: request.data });
    }
  };

  const handleGetPendingDeduction = useCallback(async () => {
    const request = await getPendingDeductions();
    if (request.ok) {
      dispatch({ type: GET_DEDUCTIONS, payload: request.data });
      setFilterTransaction(request.data);
    }
  }, [dispatch]);

  useEffect(() => {
    handleGetPendingDeduction();
  }, [handleGetPendingDeduction]);

  const [deductStatus, setDeductStatus] = useState('PENDING');

  const handleChange = (event) => {
    setDeductStatus(event.target.value);
  };

  const [reason, setReason] = useState('');
  const [loading, setLoading] = useState(false);

  const handleRespondPendingWithdrawal = async () => {
    setLoading(true);
    if (deductStatus === 'DECLINE' && !reason) {
      toast.error('Please specify a reason for decline');
      setLoading(false);
      return;
    }

    const request = await respondPendingWithdrawal(userClickId?.id, { reason, status: deductStatus });
    if (request.ok) {
      await handleGetPendingDeduction();
      toast.success('Request completed successfully');
      setLoading(false);
      toggleModal();
      return;
    }

    toast.error(request.data?.message ? request.data?.message : 'Unable to complete your request');
    toggleModal();
    setLoading(false);
  };

  useEffect(() => {
    if (!user?.isSuperUser) {
      navigate('/dashboard');
    }
  }, [navigate, user]);

  return (
    <Page title="Staff">
      <>
        {isLoading && (
          <Box
            sx={{
              position: 'absolute',
              width: '100vw',
              height: '100vh',
              display: 'flex',
              zIndex: 10,
              justifyContent: 'center',
              alignItems: 'center',
              backgroundColor: 'rgba(0,0,0,0.5)',
            }}
          >
            <CircularProgress />
          </Box>
        )}

        <Container>
          <Stack px={'10px'} mb={2}>
            <Typography variant="h4" gutterBottom>
              Deduction Requests
            </Typography>
          </Stack>

          <Card style={{ paddingBlock: '10px' }}>
            <UserListDeduct
              numSelected={selected.length}
              filterName={filterName}
              onFilterName={handleFilterByName}
              onApplyFilter={handleApplyFilter}
            />

            <Scrollbar>
              <TableContainer sx={{ minWidth: 800 }}>
                <Table>
                  <UserListHead
                    order={order}
                    orderBy={orderBy}
                    headLabel={TABLE_HEAD}
                    rowCount={filterTransaction.length}
                    numSelected={selected.length}
                    onRequestSort={handleRequestSort}
                  />
                  <TableBody>
                    {filteredUsers.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((row) => {
                      const { id, submit_by, amount, status, reason, date_created } = row;

                      return (
                        <TableRow
                          hover
                          key={id}
                          tabIndex={-1}
                          onClick={() => handleClickUser(row)}
                          sx={{ cursor: 'pointer' }}
                        >
                          <TableCell padding="checkbox">
                            {/* <Checkbox checked={isItemSelected} onChange={(event) => handleClick(event, id)} /> */}
                          </TableCell>
                          <TableCell component="th" scope="row" padding="none">
                            <Stack direction="row" alignItems="center" spacing={2}>
                              {/* <Avatar alt={agent} src={avatar} /> */}
                              <Typography variant="subtitle2" noWrap>
                                {`${submit_by}`}
                              </Typography>
                            </Stack>
                          </TableCell>
                          <TableCell align="left">{amount}</TableCell>
                          <TableCell align="left">{reason}</TableCell>
                          <TableCell align="left">{moment(date_created).format('MMM Do YYYY, h:mm:ss')}</TableCell>
                          <TableCell align="left">
                            <Label
                              variant="ghost"
                              color={status === 'GRANTED' ? 'success' : status === 'PENDING' ? 'info' : 'error'}
                            >
                              {status}
                            </Label>
                          </TableCell>

                          <TableCell align="right">{/*  */}</TableCell>
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

            <TablePagination
              rowsPerPageOptions={[5, 10, 25]}
              component="div"
              count={filterTransaction.length}
              rowsPerPage={rowsPerPage}
              page={page}
              onPageChange={handleChangePage}
              onRowsPerPageChange={handleChangeRowsPerPage}
            />
          </Card>
        </Container>
      </>
      <TransitionsModal open={userClicked} toggleModal={toggleModal}>
        <Stack>
          <Stack direction="row" justifyContent={'space-between'} alignItems={'center'}>
            <Typography variant="h4">Deduction Details</Typography>
            <IconButton onClick={toggleModal}>
              <Iconify icon={'carbon:close-filled'} />
            </IconButton>
          </Stack>
          <Grid spacing={1} container>
            <Grid item xs={12} sm={6}>
              <Stack>
                <Typography variant="subtitle2" color={'gray'}>
                  ID
                </Typography>
                <Typography variant="subtitle1">{userClickId?.id}</Typography>
              </Stack>
            </Grid>
            <Grid item xs={12} sm={6}>
              <Stack>
                <Typography variant="subtitle2" color={'gray'}>
                  Ticket ID
                </Typography>
                <Typography variant="subtitle1">{userClickId?.ticket}</Typography>
              </Stack>
            </Grid>
            <Grid item xs={12} sm={6}>
              <Stack>
                <Typography variant="subtitle2" color={'gray'}>
                  Request Status
                </Typography>
                <Typography variant="subtitle1">{userClickId?.status}</Typography>
              </Stack>
            </Grid>
            <Grid item xs={12} sm={6}>
              <Stack>
                <Typography variant="subtitle2" color={'gray'}>
                  Reason
                </Typography>
                <Typography variant="subtitle1">{userClickId?.reason}</Typography>
              </Stack>
            </Grid>
            <Grid item xs={12} sm={6}>
              <Stack>
                <Typography variant="subtitle2" color={'gray'}>
                  Amount
                </Typography>
                <Typography variant="subtitle1">{userClickId?.amount}</Typography>
              </Stack>
            </Grid>
            <Grid item xs={12} sm={6}>
              <Stack>
                <Typography variant="subtitle2" color={'gray'}>
                  Date
                </Typography>
                <Typography variant="subtitle1">
                  {moment(userClickId?.date_created).format('MMMM Do YYYY, h:mm a')}
                </Typography>
              </Stack>
            </Grid>
          </Grid>
          <Grid
            item
            xs={12}
            sm={12}
            mt={2}
            onClick={() => navigate(`/dashboard/tickets/message?ticketId=${userClickId?.ticket_id}`)}
          >
            <Stack direction={'row'}>
              <Button>View Ticket</Button>
            </Stack>
          </Grid>
          {userClickId?.status === 'PENDING' ? (
            <>
              <Grid item xs={12} sm={12}>
                <Stack mt={4}>
                  <FormControl>
                    <FormLabel id="demo-row-radio-buttons-group-label">Status</FormLabel>
                    <RadioGroup
                      row
                      value={deductStatus}
                      onChange={handleChange}
                      aria-labelledby="demo-row-radio-buttons-group-label"
                      name="row-radio-buttons-group"
                    >
                      <FormControlLabel value="PENDING" control={<Radio />} label="PENDING" />
                      <FormControlLabel value="GRANTED" control={<Radio />} label="GRANTED" />
                      <FormControlLabel value="DECLINE" control={<Radio />} label="DECLINE" />
                    </RadioGroup>
                  </FormControl>
                  {deductStatus === 'DECLINE' && (
                    <Stack>
                      <TextField value={reason} onChange={(e) => setReason(e.target.value)} label={'Reason'} />
                    </Stack>
                  )}
                  {deductStatus !== 'PENDING' && (
                    <Stack direction={'row'} mt={2}>
                      <LoadingButton
                        loading={loading}
                        disabled={loading}
                        variant="contained"
                        onClick={handleRespondPendingWithdrawal}
                      >
                        Submit
                      </LoadingButton>
                    </Stack>
                  )}
                </Stack>
              </Grid>
            </>
          ) : (
            <Grid item xs={12} sm={6}>
              <Stack>
                <Typography variant="subtitle2" color={'gray'}>
                  Date
                </Typography>
                <Typography variant="subtitle1">
                  {moment(userClickId?.date_created).format('MMMM Do YYYY, h:mm a')}
                </Typography>
              </Stack>
            </Grid>
          )}
        </Stack>
      </TransitionsModal>
    </Page>
  );
}
