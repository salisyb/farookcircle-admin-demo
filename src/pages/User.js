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

import { USER_UPDATE } from '../store/constants/auth';
import { getUserInfo } from '../api/auth.api';
import { getListOfTransactins } from '../api/users.api';

// components
import { getTransactionsAgent, getUsers, getUsersWallet, removeUser } from '../store/actions/users';
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
  { id: 'agent', label: 'Agent', alignRight: false },
  { id: 'amount', label: 'Amount', alignRight: false },
  { id: 'transaction_ref', label: 'Reference', alignRight: false },
  { id: 'date', label: 'Date', alignRight: false },
  { id: 'status', label: 'Status', alignRight: false },
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

  const { transactions } = useSelector((state) => state.users);

  const [filterTransaction, setFilterTransaction] = React.useState(transactions);

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

  const totalAmount = calculateAmount();

  function calculateAmount() {
    let amount = 0;
    filterTransaction.forEach((transaction) => {
      amount += Number(transaction.amount);
    });
    return amount;
  }
  const toggleModal = () => setUserClicked(!userClicked);

  const handleClickUser = (id) => {
    setUserClickId(id);
    toggleModal();
  };

  React.useEffect(() => {
    dispatch(getTransactionsAgent({ date: new Date().toISOString().split('T')[0] }));
    dispatch(getUsers());
    handleGetUserData();
  }, []);

  React.useEffect(() => {
    setFilterTransaction(transactions);
  }, [transactions]);

  const handleFilterTransactions = async (queryFilter) => {
    setIsLoading(true);
    const request = await getListOfTransactins(queryFilter);
    if (request.ok) {
      setFilterTransaction(request.data);
      setIsLoading(false);
      return;
    }

    setFilterTransaction([]);
    setIsLoading(false);
  };

  const handleApplyFilter = (filter) => {
    if (Object.keys(filter).length < 1) {
      setFilterTransaction(transactions);
      return;
    }
    handleFilterTransactions(filter);
  };

  const handleGetUserData = async () => {
    const request = await getUserInfo();

    if (request.ok) {
      console.log(request.data)
      dispatch({ type: USER_UPDATE, payload: request.data });
    }
  };

  return (
    <Page title="Staff">
      {/* <BasicModal isOpen={userClicked} toggleOpen={toggleModal}>
        <UserOptionsCard userId={userClickId} closeModal={toggleModal} />
      </BasicModal> */}
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
          <Stack direction="row" alignItems="center" justifyContent="space-between" mb={5}>
            <Typography variant="h4" gutterBottom>
              Staff
            </Typography>
            <Stack direction="row" spacing={1} alignItems="center">
              <Button
                variant="contained"
                component={RouterLink}
                to="/dashboard/tickets"
                startIcon={<Iconify icon="eva:archive-outline" />}
              >
                Tickets
              </Button>
              <Button
                variant="contained"
                component={RouterLink}
                to="/dashboard/users"
                startIcon={<Iconify icon="eva:people-outline" />}
              >
                Users
              </Button>
            </Stack>
          </Stack>
          <Card>
            <UserListToolbar
              numSelected={selected.length}
              filterName={filterName}
              onFilterName={handleFilterByName}
              totalAmount={totalAmount}
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
                    // onSelectAllClick={handleSelectAllClick}
                  />
                  <TableBody>
                    {filteredUsers.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((row) => {
                      const { id, agent, amount, transaction_ref, date, status } = row;
                      const isItemSelected = selected.indexOf(id) !== -1;
                      // date: '2023-04-25T18:33:05.615Z',
                      // agent: '07064245859',
                      // amount: '3500',
                      // status: 'completed',
                      // transaction_ref: 'admin|2304251833|05',
                      // funded_by: 'admin',
                      // bal_before: '172',
                      // bal_after: '3672',
                      return (
                        <TableRow
                          hover
                          key={id}
                          tabIndex={-1}
                          // role="checkbox"
                          // selected={isItemSelected}
                          // aria-checked={isItemSelected}
                          onClick={() => handleClickUser(id)}
                          sx={{ cursor: 'pointer' }}
                        >
                          <TableCell padding="checkbox">
                            {/* <Checkbox checked={isItemSelected} onChange={(event) => handleClick(event, id)} /> */}
                          </TableCell>
                          <TableCell component="th" scope="row" padding="none">
                            <Stack direction="row" alignItems="center" spacing={2}>
                              {/* <Avatar alt={agent} src={avatar} /> */}
                              <Typography variant="subtitle2" noWrap>
                                {`${agent}`}
                              </Typography>
                            </Stack>
                          </TableCell>
                          <TableCell align="left">{amount}</TableCell>
                          <TableCell align="left">{transaction_ref}</TableCell>
                          <TableCell align="left">{new Date(date).toISOString().split('T')[0]}</TableCell>
                          <TableCell align="left">
                            <Label
                              variant="ghost"
                              color={
                                status.toLowerCase() === 'completed' || status.toLowerCase() === 'successful'
                                  ? 'success'
                                  : 'error'
                              }
                            >
                              {sentenceCase(status)}
                            </Label>
                          </TableCell>

                          <TableCell align="right">
                            {/* <UserMoreMenu
                            onOption={(option) => (option === 'remove' ? handleRemoveUser(id) : handleEditUser(id))}
                          /> */}
                          </TableCell>
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
