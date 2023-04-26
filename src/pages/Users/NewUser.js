import { filter } from 'lodash';
import { sentenceCase } from 'change-case';
import { useEffect, useState } from 'react';
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
  Grid,
  TextareaAutosize,
  TextField,
  IconButton,
} from '@mui/material';
import { LoadingButton } from '@mui/lab';

// components
import Page from '../../components/Page';
import Label from '../../components/Label';
import Scrollbar from '../../components/Scrollbar';
import Iconify from '../../components/Iconify';
import SearchNotFound from '../../components/SearchNotFound';
import { UserListHead, UserListToolbar, UserMoreMenu } from '../../sections/@dashboard/user';
// mock
import USERLIST from '../../_mock/user';
import UserForm from '../../sections/users/NewUserForm';
import { createNotification, deleteNotification, getNotification } from '../../api/users.api';

// ----------------------------------------------------------------------

const TABLE_HEAD = [
  { id: 'name', label: 'Name', alignRight: false },
  { id: 'company', label: 'Company', alignRight: false },
  { id: 'role', label: 'Role', alignRight: false },
  { id: 'isVerified', label: 'Verified', alignRight: false },
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
    return filter(array, (_user) => _user.name.toLowerCase().indexOf(query.toLowerCase()) !== -1);
  }
  return stabilizedThis.map((el) => el[0]);
}

export default function User() {
  const [page, setPage] = useState(0);

  const [order, setOrder] = useState('asc');

  const [selected, setSelected] = useState([]);

  const [orderBy, setOrderBy] = useState('name');

  const [filterName, setFilterName] = useState('');

  const [rowsPerPage, setRowsPerPage] = useState(5);

  const handleRequestSort = (event, property) => {
    const isAsc = orderBy === property && order === 'asc';
    setOrder(isAsc ? 'desc' : 'asc');
    setOrderBy(property);
  };

  const handleSelectAllClick = (event) => {
    if (event.target.checked) {
      const newSelecteds = USERLIST.map((n) => n.name);
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

  const emptyRows = page > 0 ? Math.max(0, (1 + page) * rowsPerPage - USERLIST.length) : 0;

  const filteredUsers = applySortFilter(USERLIST, getComparator(order, orderBy), filterName);

  const isUserNotFound = filteredUsers.length === 0;

  const [notify, setNotify] = useState([]);
  const [title, setTitle] = useState("");
  const [subtitle, setSubtitle] = useState("");

  useEffect(() => {
    handleGetNotification()
  },[])


  const handleGetNotification = async () => {
    const notify = await getNotification()
    if(notify.ok) {
      setNotify(notify.data.data);
    }
  }

  const handleRemoveNotification = async (notifyId) => {
      await deleteNotification(notifyId);
      setNotify(notify.filter(item => item.id !== notifyId));
   
  }

  const handleAddNotification = async () => {

    if(title.length < 1 || subtitle.length < 1) {
      return;
    }

    const payload = {
      title,
      subtitle,
      priority: 'medium',
      type: 'Announcement'

    }
    const notification = await createNotification(payload);
    if(notification.ok) {
      setNotify([...notify, notification.data.data]);
      setTitle("");
      setSubtitle("");
    }
  }

  return (
    <Page title="Add">
      <Container>
        <Stack direction="row" alignItems="center" justifyContent="space-between" mb={5}>
          <Typography variant="h4" gutterBottom>
            Send Notifications to users
          </Typography>
        </Stack>

        <Card>
          <Box p="20px">
            <Grid container spacing={'10px'}>
              {notify.map((notifications) => (
                <Grid key={notifications.id} item xs={12} md={4} lg={6}>
                  <Card sx={{ padding: '20px' }}>
                    <Stack
                      sx={{ fontWeight: '700', mb: '20px' }}
                      direction={'row'}
                      alignItems={'center'}
                      justifyContent={'space-between'}
                    >
                      <Typography>{notifications.title}</Typography>
                      <Iconify
                        icon="eva:trash-2-outline"
                        color={'red'}
                        onClick={() => handleRemoveNotification(notifications.id)}
                      />
                    </Stack>
                    <Typography sx={{ fontSize: '13px' }}>{notifications.subtitle}</Typography>
                  </Card>
                </Grid>
              ))}
            </Grid>
            <Stack marginTop="10px" direction={'column'} spacing={'10px'}>
              <TextField
                id="outlined-multiline-static"
                label="Title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
              <TextField
                id="outlined-multiline-static"
                label="Notifications"
                multiline
                value={subtitle}
                onChange={(e) => setSubtitle(e.target.value)}
                rows={4}
              />
              <LoadingButton variant={'contained'} onClick={handleAddNotification}>
                Notify
              </LoadingButton>
            </Stack>
          </Box>
        </Card>
      </Container>
    </Page>
  );
}
