/* eslint-disable arrow-body-style */
/* eslint-disable no-else-return */
/* eslint-disable camelcase */
import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { filter } from 'lodash';
import { sentenceCase } from 'change-case';
import { Link as RouterLink } from 'react-router-dom';
// material
import {
  Card,
  Table,
  Stack,
  Avatar,
  Button,
  Checkbox,
  TableRow,
  TableBody,
  TableCell,
  Container,
  Typography,
  TableContainer,
  TablePagination,
  Box,
  CircularProgress,
} from '@mui/material';

import moment from 'moment-timezone';
import { USER_UPDATE } from '../store/constants/auth';
import { getUserInfo } from '../api/auth.api';
import { getListOfTransactions } from '../api/users.api';

// components
import {
  getStaffAccountData,
  getTransactionsAgent,
  getUsers,
  getUsersWallet,
  removeUser,
} from '../store/actions/users';
import Page from '../components/Page';
import Label from '../components/Label';
import Scrollbar from '../components/Scrollbar';
import Iconify from '../components/Iconify';
import SearchNotFound from '../components/SearchNotFound';
import { UserListHead, UserListToolbar, UserMoreMenu } from '../sections/@dashboard/user';
// mock
// import USERLIST from '../_mock/user';
import BasicModal from './components/Modal';
import UserOptionsCard from './components/User/UserOptionsCard';
import BasicPopover from './components/PopoverModal';

// ----------------------------------------------------------------------

// mock avatar url
const avatar = '/static/mock-images/avatars/avatar_default.jpg';

const TABLE_HEAD = [
  { id: 'owner', label: 'Owner', alignRight: false },
  { id: 'amount', label: 'Amount', alignRight: false },
  { id: 'description', label: 'Description', alignRight: false },
  { id: 'date', label: 'Date', alignRight: false },
  { id: 'direction', label: 'Direction', alignRight: false },
  { id: '' },
];
// date: '2023-04-25T18:33:05.615Z',
// agent: '07064245859',
// amount: '3500',
// status: 'completed',
// transaction_ref: 'admin|2304251833|05',
// funded_by: 'admin',
// bal_before: '172',
// bal_after: '3672',

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

  const { transactions, history, currentBalance, owner } = useSelector((state) => state.users);

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

  const handleSelectAllClick = (event) => {
    if (event.target.checked) {
      const newSelecteds = filterTransaction.map((n) => n.agent);
      setSelected(newSelecteds);
      return;
    }
    setSelected([]);
  };

  const handleClick = (event, name) => {
    const selectedIndex = selected.indexOf(name);
    let newSelected = [];
    if (selectedIndex === -1) {
      newSelected = newSelected.concat(selected, name);
    } else if (selectedIndex === 0) {
      newSelected = newSelected.concat(selected.slice(1));
    } else if (selectedIndex === selected.length - 1) {
      newSelected = newSelected.concat(selected.slice(0, -1));
    } else if (selectedIndex > 0) {
      newSelected = newSelected.concat(selected.slice(0, selectedIndex), selected.slice(selectedIndex + 1));
    }
    setSelected(newSelected);
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
          <Card style={{ paddingBlock: '10px' }}>
            <UserListToolbar
              numSelected={selected.length}
              filterName={filterName}
              onFilterName={handleFilterByName}
              totalAmount={Number(currentBalance)}
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
                      const { _id, owner, amount, direction, description, createdAt, updatedAt } = row;
                      const isItemSelected = selected.indexOf(_id) !== -1;

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
