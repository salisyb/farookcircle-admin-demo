/* eslint-disable arrow-body-style */
/* eslint-disable no-else-return */
/* eslint-disable camelcase */
import React, { useCallback, useEffect } from 'react';
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
} from '@mui/material';

import moment from 'moment-timezone';
import { useNavigate } from 'react-router-dom';
import { SET_USERS_COUNT } from '../store/constants/users';
import { formatNumber } from '../utils/formatNumber';
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
import { getPendingDeductions, getUsersCount } from '../api/system.api';

// ----------------------------------------------------------------------

// mock avatar url

const TABLE_HEAD = [
  { id: 'owner', label: 'Owner', alignRight: false },
  { id: 'amount', label: 'Amount', alignRight: false },
  { id: 'description', label: 'Description', alignRight: false },
  { id: 'date', label: 'Date', alignRight: false },
  { id: 'direction', label: 'Direction', alignRight: false },
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

export default function User() {
  const dispatch = useDispatch();

  const navigate = useNavigate();

  const { history, currentBalance, owner, count } = useSelector((state) => state.users);
  const { deductions } = useSelector((state) => state.system);

  const { user } = useSelector((state) => state.auth);

  const [filterTransaction, setFilterTransaction] = React.useState(history);

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

  const handleGetUsersCount = useCallback(async () => {
    const request = await getUsersCount();
    if (request.ok) {
      dispatch({ type: SET_USERS_COUNT, payload: request.data?.count || 0 });
    }
  }, []);

  useEffect(() => {
    handleGetUsersCount();
  }, [handleGetUsersCount]);

  React.useEffect(() => {
    dispatch(getStaffAccountData());
    dispatch(getTransactionsAgent({ date: new Date().toISOString().split('T')[0] }));
    handleGetUserData();
  }, []);

  const handleFilterTransactions = async (queryFilter) => {
    const filteredTransactions = history.filter((transaction) => {
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
      setFilterTransaction(history);
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
    }
  }, [dispatch]);

  useEffect(() => {
    handleGetPendingDeduction();
  }, [handleGetPendingDeduction]);

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
              Account Information
            </Typography>
            <Stack direction={'row'} spacing={1}>
              <Typography>Account Name:</Typography>
              <Typography sx={{ fontWeight: '700' }} color={'#3366FF'}>
                {owner}
              </Typography>
            </Stack>
          </Stack>
          <Grid container spacing={1} my={4}>
            <Grid lg={3} sm={6} xs={12}>
              <WithdrawalRequest
                sx={{ height: '100%' }}
                label={'Balance'}
                icon={'solar:wallet-bold'}
                value={`₦ ${new Intl.NumberFormat().format(Number(currentBalance)) || '0.00'}`}
              />
            </Grid>
            {user?.isSuperUser && (
              <>
                <Grid lg={3} sm={6} xs={12}>
                  <WithdrawalRequest
                    icon={'icon-park-solid:file-withdrawal'}
                    sx={{ height: '100%' }}
                    label={'Deductions'}
                    value={deductions.length}
                    bottom={
                      <Stack direction={'row'} spacing={1} alignItems={'center'} justifyContent={'space-between'}>
                        <Typography variant="body2" color={'yellowgreen'}>
                          {deductions.filter((item) => item.status === 'PENDING').length} | PENDING
                        </Typography>
                        <Button size={'small'} variant="outlined" onClick={() => navigate('/dashboard/deductions')}>
                          View
                        </Button>
                      </Stack>
                    }
                  />
                </Grid>
                <Grid lg={3} sm={6} xs={12}>
                  <WithdrawalRequest
                    sx={{ height: '100%' }}
                    label={'Number of users'}
                    icon={'solar:users-group-rounded-bold'}
                    value={formatNumber(count)}
                  />
                </Grid>
              </>
            )}
          </Grid>
          <Card style={{ paddingBlock: '10px' }}>
            <UserListToolbar
              numSelected={selected.length}
              filterName={filterName}
              onFilterName={handleFilterByName}
              // totalAmount={Number(currentBalance)}
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
                      const { _id, owner, amount, direction, description, createdAt } = row;

                      return (
                        <TableRow
                          hover
                          key={_id}
                          tabIndex={-1}
                          onClick={() => handleClickUser(_id)}
                          sx={{ cursor: 'pointer' }}
                        >
                          <TableCell padding="checkbox">
                            {/* <Checkbox checked={isItemSelected} onChange={(event) => handleClick(event, id)} /> */}
                          </TableCell>
                          <TableCell component="th" scope="row" padding="none">
                            <Stack direction="row" alignItems="center" spacing={2}>
                              {/* <Avatar alt={agent} src={avatar} /> */}
                              <Typography variant="subtitle2" noWrap>
                                {`${owner}`}
                              </Typography>
                            </Stack>
                          </TableCell>
                          <TableCell align="left">{amount}</TableCell>
                          <TableCell align="left">{description}</TableCell>
                          <TableCell align="left">{moment(createdAt).format('MMM Do YYYY, h:mm:ss')}</TableCell>
                          <TableCell align="left">
                            <Label variant="ghost" color={direction !== 'DEBIT' ? 'success' : 'error'}>
                              {direction}
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
    </Page>
  );
}
