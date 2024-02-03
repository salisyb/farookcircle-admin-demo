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
} from '@mui/material';
// components
import { getUsers, getUsersWallet, removeUser } from '../store/actions/users';
import Page from '../components/Page';
import Label from '../components/Label';
import Scrollbar from '../components/Scrollbar';
import Iconify from '../components/Iconify';
import SearchNotFound from '../components/SearchNotFound';
import { UserListHead, UserListToolbarFilter, UserMoreMenu } from '../sections/@dashboard/user';

// mock
// import USERLIST from '../_mock/user';
import BasicModal from './components/Modal';
import UserOptionsCard from './components/User/UserOptionsCard';

// ----------------------------------------------------------------------

// mock avatar url
const avatar = '/static/mock-images/avatars/avatar_default.jpg';

const TABLE_HEAD = [
  { id: 'username', label: 'Username', alignRight: false },
  { id: 'first_name', label: 'First name', alignRight: false },
  { id: 'last_name', label: 'Last Name', alignRight: false },
  { id: 'date_joined', label: 'Date Join', alignRight: false },
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

export default function FundUserWallet() {
  const dispatch = useDispatch();

  const { users } = useSelector((state) => state.users);

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
      const newSelecteds = users.map((n) => n.username);
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

  const emptyRows = page > 0 ? Math.max(0, (1 + page) * rowsPerPage - users.length) : 0;

  const filteredUsers = applySortFilter(users, getComparator(order, orderBy), filterName);

  const isUserNotFound = filteredUsers.length === 0;

  // state
  const [userClicked, setUserClicked] = React.useState(false);
  const [userClickId, setUserClickId] = React.useState(null);

  const toggleModal = () => setUserClicked(!userClicked);

  const handleClickUser = (username) => {
    setUserClickId(username);

    toggleModal();
  };

  React.useEffect(() => {
    dispatch(getUsers());
  }, [dispatch]);

  const handleEditUser = (id) => {};

  const handleRemoveUser = (id) => {
    dispatch(removeUser(id));
  };

  const onSuccess = () => {
    setFilterName('');
    toggleModal();
  };

  return (
    <Page title="User">
      <BasicModal isOpen={userClicked} toggleOpen={toggleModal}>
        <UserOptionsCard userId={userClickId} closeModal={toggleModal} onSuccess={onSuccess} />
      </BasicModal>
      <Container>
        <Stack direction="row" alignItems="center" justifyContent="space-between" mb={5}>
          <Typography variant="h4" gutterBottom>
            Users Management
          </Typography>
          <Button
            variant="contained"
            component={RouterLink}
            to="/dashboard/app"
            startIcon={<Iconify icon="eva:browser-outline" />}
          >
            Dashboard
          </Button>
        </Stack>

        <Card>
          <UserListToolbarFilter
            numSelected={selected.length}
            filterName={filterName}
            onFilterName={handleFilterByName}
          />

          <Scrollbar>
            <TableContainer sx={{ minWidth: 800 }}>
              <Table>
                <UserListHead
                  order={order}
                  orderBy={orderBy}
                  headLabel={TABLE_HEAD}
                  rowCount={users.length}
                  numSelected={selected.length}
                  onRequestSort={handleRequestSort}
                  // onSelectAllClick={handleSelectAllClick}
                />
                <TableBody>
                  {filteredUsers.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((row) => {
                    const { id, username, first_name, last_name, date_joined } = row;

                    return (
                      <TableRow
                        hover
                        key={username}
                        tabIndex={-1}
                        onClick={() => handleClickUser(username)}
                        sx={{ cursor: 'pointer' }}
                      >
                        <TableCell padding="checkbox">
                          {/* <Checkbox checked={isItemSelected} onChange={(event) => handleClick(event, id)} /> */}
                        </TableCell>
                        <TableCell component="th" scope="row" padding="none">
                          <Stack direction="row" alignItems="center" spacing={2}>
                            <Avatar alt={first_name} src={avatar} />
                            <Typography variant="subtitle2" noWrap>
                              {`${username}`}
                            </Typography>
                          </Stack>
                        </TableCell>
                        <TableCell align="left">{first_name}</TableCell>
                        <TableCell align="left">{last_name}</TableCell>
                        <TableCell align="left">{new Date(date_joined).toLocaleDateString()}</TableCell>
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
            count={users.length}
            rowsPerPage={rowsPerPage}
            page={page}
            onPageChange={handleChangePage}
            onRowsPerPageChange={handleChangeRowsPerPage}
          />
        </Card>
      </Container>
    </Page>
  );
}
