/* eslint-disable no-nested-ternary */
/* eslint-disable react/jsx-boolean-value */
/* eslint-disable no-restricted-syntax */
/* eslint-disable jsx-a11y/label-has-associated-control */
/* eslint-disable camelcase */
import React, { useCallback, useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import _, { filter } from 'lodash';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
// material
import {
  Card,
  Table,
  Stack,
  Avatar,
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
  FormControl,
  TextField,
  Autocomplete,
  IconButton,
  Select,
  ListItem,
  InputLabel,
  MenuItem,
  Badge,
} from '@mui/material';
import moment from 'moment-timezone';
import { LoadingButton } from '@mui/lab';
import { useFormik } from 'formik';
import { toast } from 'react-toastify';
import { formatMessageTime } from '../utils/formatTime';
import { getUsers } from '../store/actions/users';
import { fetchAllTicket } from '../store/actions/system';
import { createTicket, getAllTicket } from '../api/system.api';
import TicketListToolbar from '../sections/@dashboard/user/TicketListToolbar';

// components

import Page from '../components/Page';
import Scrollbar from '../components/Scrollbar';
import Iconify from '../components/Iconify';
import SearchNotFound from '../components/SearchNotFound';
// mock
import ModalC from './components/CModal';

// ----------------------------------------------------------------------

// mock avatar url

const POLLING_INTERVAL = 5000;

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
    return filter(array, (_ticket) => _ticket.id.toString().includes(query) || _ticket.reference.includes(query));
  }
  return stabilizedThis.map((el) => el[0]);
}

export default function TicketList() {
  const dispatch = useDispatch();

  const navigate = useNavigate();

  const { tickets } = useSelector((state) => state.system);

  const [filterTickets, setFilterTickets] = React.useState(tickets);

  const [page, setPage] = React.useState(0);

  const [order, setOrder] = React.useState('asc');

  const [selected, setSelected] = React.useState([]);

  const [orderBy, setOrderBy] = React.useState('name');

  const [filterName, setFilterName] = React.useState('');

  const [rowsPerPage, setRowsPerPage] = React.useState(5);

  const [createTicketLoading, setCreateTicketLoading] = useState(false);

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

  const emptyRows = page > 0 ? Math.max(0, (1 + page) * rowsPerPage - filterTickets.length) : 0;

  const filteredUsers = applySortFilter(filterTickets, getComparator(order, orderBy), filterName);

  const isUserNotFound = filteredUsers.length === 0;

  // state
  const [userClicked, setUserClicked] = React.useState(false);
  const [userClickId, setUserClickId] = React.useState(null);
  const [isLoading, setIsLoading] = React.useState(false);
  const [pollingId, setPollingId] = React.useState();
  const [selectedFile, setSelectedFile] = React.useState(null);

  const [toggleCreateTicket, setToggleCreateTicket] = useState(false);

  const { users } = useSelector((state) => state.users);
  const { user } = useSelector((state) => state.auth);

  const [ticketUsers, setTicketUsers] = useState([]);

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    setSelectedFile(file);
  };

  const handleRemoveFile = () => {
    setSelectedFile(null);
  };

  const toggleModal = () => setUserClicked(!userClicked);

  const startPolling = useCallback(() => {
    const pollingId = setInterval(() => {
      dispatch(fetchAllTicket());
    }, POLLING_INTERVAL);

    // Store the pollingId in state for later cleanup
    setPollingId(pollingId);
  }, [dispatch]);

  const stopPolling = useCallback(() => {
    // Clear the interval when the component unmounts or when not needed
    clearInterval(pollingId);
  }, [pollingId]);

  const handleClickUser = (id) => {
    setUserClickId(id);
    toggleModal();
  };

  const generateUsersTicket = useCallback(() => {
    const data = users.map((item) => ({ label: item.username, value: item.username }));

    setTicketUsers(data);
  }, [users]);

  React.useEffect(() => {
    dispatch(fetchAllTicket());
    dispatch(getUsers());
  }, [dispatch]);

  useEffect(() => {
    generateUsersTicket();
  }, [generateUsersTicket, users]);

  React.useEffect(() => {
    setFilterTickets(tickets);
  }, [tickets]);

  const handleFilterTickets = async (queryFilter) => {
    setIsLoading(true);
    const request = await getAllTicket(queryFilter);
    if (request.ok) {
      setFilterTickets(request.data);
      setIsLoading(false);
      return;
    }

    setFilterTickets([]);
    setIsLoading(false);
  };

  const handleApplyFilter = useCallback(
    (filter) => {
      if (Object.keys(filter).length < 1) {
        setFilterTickets(tickets);
        return;
      }

      const filteredList = tickets.filter((ticket) => {
        for (const key in filter) {
          if (ticket[key] !== filter[key] && key !== 'created_at') {
            return false;
          }
        }

        if (filter.created_at) {
          if (filter.created_at !== moment(ticket.created_at).format('YYYY-MM-DD')) {
            return false;
          }
        }

        return true;
      });

      setPage(0);
      setFilterTickets(filteredList);
    },
    [tickets]
  );

  const handleRouteToTicketMessage = (ticket) => {
    const filteredViewTicket = lastViewTicket.filter((item) => item.id !== ticket.id);

    const newViewTicket = [...filteredViewTicket, { id: ticket.id, last_message: ticket.last_message }];

    setLastViewTicket(newViewTicket);
    // save it on local storage
    localStorage.setItem('ticketListView', JSON.stringify(newViewTicket));

    navigate(`/dashboard/ticket/message?ticketId=${ticket.id}`);
  };

  const formik = useFormik({
    initialValues: {
      user: null,
      title: '',
      descriptions: '',
    },
    onSubmit: (values) => {
      handleCreateUserTicket(values);
    },
    validate: (values) => {
      const errors = {};
      if (!values.user) {
        errors.user = 'User is required';
      }
      if (!values.title.trim()) {
        errors.title = 'Title is required';
      }
      if (!values.descriptions.trim()) {
        errors.descriptions = 'Descriptions are required';
      }
      return errors;
    },
  });

  const handleCreateUserTicket = async (data) => {
    const formData = new FormData();

    formData.append('title', data.title);
    formData.append('descriptions', data.descriptions);
    formData.append('user_id', data.user.value);
    formData.append('attended_by', user?.username);
    formData.append('created_by', user.username);

    if (selectedFile) {
      formData.append('attachment', selectedFile);
    }

    setCreateTicketLoading(true);

    const request = await createTicket(formData);
    if (request.ok) {
      toast.success('You have successfully create new ticket');
      handleRouteToTicketMessage(request.data);
      setCreateTicketLoading(false);
      setToggleCreateTicket(false);
      return;
    }

    setCreateTicketLoading(false);
    toast.error(request.data?.message ? request.data?.message : 'Unable to create your ticket');
  };

  const clipTitleOrDescription = (text) => {
    if (text.length > 20) {
      return `${text.slice(0, 20)}...`;
    }

    return text;
  };

  const [activeTab, setActiveTab] = React.useState('active');
  const [lastViewTicket, setLastViewTicket] = React.useState([]);

  useEffect(() => {
    if (activeTab === 'active') {
      handleApplyFilter({ is_closed: false });
    } else {
      handleApplyFilter({ is_closed: true });
    }
  }, [activeTab, handleApplyFilter]);

  useEffect(() => {
    handleGetSavedTicketList();
  }, []);

  const handleGetSavedTicketList = async () => {
    const savedTicketList = await localStorage.getItem('ticketListView');

    console.log({ savedTicketList });

    if (savedTicketList) {
      setLastViewTicket(JSON.parse(savedTicketList));
    }
  };

  const handleTicketStatus = (ticketId, ticketClosed, lastMessage) => {
    if (ticketClosed) {
      return false;
    }

    const lastViewTicketItem = lastViewTicket.find((item) => item.id === ticketId);

    if (lastViewTicketItem && lastViewTicketItem.last_message === lastMessage) {
      return false;
    }

    return true;
  };

  return (
    <Page title="Staff">
      <>
        <ModalC isOpen={toggleCreateTicket} setOpen={() => setToggleCreateTicket(!toggleCreateTicket)}>
          <form onSubmit={formik.handleSubmit}>
            <Stack spacing={2}>
              <Stack alignItems={'flex-end'}>
                <IconButton onClick={() => setToggleCreateTicket(!toggleCreateTicket)}>
                  <Iconify icon={'eva:close-outline'} width={'20px'} height={'20px'} />
                </IconButton>
              </Stack>
              <Autocomplete
                disablePortal
                id="combo-box-demo"
                options={ticketUsers}
                value={formik.values.user}
                onChange={(event, newValue) => formik.setFieldValue('user', newValue)}
                renderInput={(params) => (
                  <TextField {...params} label="User" error={formik.touched.user && Boolean(formik.errors.user)} />
                )}
              />

              <FormControl>
                <TextField
                  id="outlined-basic"
                  label="Ticket Title"
                  variant="outlined"
                  name={'title'}
                  value={formik.values.title}
                  onChange={formik.handleChange}
                  error={formik.touched.title && Boolean(formik.errors.title)}
                  helperText={formik.touched.title && formik.errors.title}
                />
              </FormControl>

              <FormControl>
                <TextField
                  id="outlined-multiline-static"
                  label="Ticket Descriptions"
                  multiline
                  rows={4}
                  name={'descriptions'}
                  value={formik.values.descriptions}
                  onChange={formik.handleChange}
                  error={formik.touched.descriptions && Boolean(formik.errors.descriptions)}
                  helperText={formik.touched.descriptions && formik.errors.descriptions}
                />
              </FormControl>

              {/* File Input for Attachment */}
              <input
                type="file"
                accept="image/*, application/pdf"
                style={{ display: 'none' }}
                id="attachmentInput"
                onChange={handleFileChange}
              />
              <label htmlFor="attachmentInput">
                <LoadingButton variant="contained" component="span">
                  Attach File
                </LoadingButton>
              </label>

              {/* Display Attachment Preview */}
              {selectedFile && (
                <Stack alignItems={'flex-start'}>
                  <Typography variant="subtitle1" fontWeight="bold">
                    Attachment Preview:
                  </Typography>
                  {selectedFile.type.startsWith('image/') ? (
                    <>
                      <IconButton onClick={handleRemoveFile} size="small">
                        <Iconify icon={'eva:close-outline'} width={'30px'} height={'30px'} />
                      </IconButton>
                      <img
                        src={URL.createObjectURL(selectedFile)}
                        alt="Attachment Preview"
                        style={{ width: '100px', height: '100px' }}
                      />
                    </>
                  ) : (
                    <Typography>Attachment type: {selectedFile.type}</Typography>
                  )}
                </Stack>
              )}

              <LoadingButton loading={createTicketLoading} type="submit" variant="contained">
                Create Ticket
              </LoadingButton>
            </Stack>
          </form>
        </ModalC>
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
              Tickets
            </Typography>
            <Stack direction="row" spacing={1} alignItems="center">
              <Button
                variant="contained"
                component={RouterLink}
                to="/dashboard/app"
                startIcon={<Iconify icon="eva:browser-outline" />}
              >
                Dashboard
              </Button>
            </Stack>
          </Stack>
          <Card>
            <TicketListToolbar
              numSelected={selected.length}
              filterName={filterName}
              onFilterName={handleFilterByName}
              totalAmount={'100'}
              onApplyFilter={handleApplyFilter}
            />
            <Stack
              sx={{ px: '20px', pb: '20px' }}
              direction={'row'}
              justifyContent={'space-between'}
              alignItems={'center'}
            >
              {/* filter for active and close tickets */}

              <FormControl sx={{ m: 1, minWidth: 120 }} size="small">
                {/* <InputLabel id="demo-select-small-label"></InputLabel> */}
                <Select
                  defaultValue={'active'}
                  labelId="demo-select-small-label"
                  id="demo-select-small"
                  onChange={(e) => setActiveTab(e.target.value)}
                >
                  <MenuItem value={'active'}>Active</MenuItem>
                  <MenuItem value={'closed'}>Closed</MenuItem>
                </Select>
              </FormControl>

              <Stack direction="row" alignItems={'center'} spacing={1}>
                <Button variant={'contained'} size="medium" onClick={() => setToggleCreateTicket(!toggleCreateTicket)}>
                  New Ticket
                </Button>
                <Button variant="contained" onClick={() => dispatch(fetchAllTicket())}>
                  Refresh
                </Button>
              </Stack>
            </Stack>

            <Scrollbar>
              <TableContainer sx={{ maxWidth: '100%' }}>
                <Table>
                  <TableBody>
                    {filteredUsers.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((row) => {
                      const { id, title, descriptions, created_at, is_closed } = row;
                      return (
                        <TableRow
                          hover
                          key={id}
                          tabIndex={-1}
                          onClick={() => handleRouteToTicketMessage(row)}
                          sx={{ cursor: 'pointer' }}
                        >
                          <TableCell padding="checkbox" />
                          <TableCell component="th" scope="row" padding="none">
                            <Stack direction="row" alignItems="center" spacing={2}>
                              <Box
                                width={'50px'}
                                height={'50px'}
                                sx={{
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  border: '1px solid black',
                                  borderColor: '#666666',
                                  borderRadius: '100%',
                                }}
                              >
                                <Badge
                                  color="secondary"
                                  variant={
                                    
                                      handleTicketStatus(id, is_closed,  row?.last_message)
                                      ? 'dot'
                                      : 'standard'
                                  }
                                >
                                  <Iconify icon="ic:twotone-email" width={20} height={20} />
                                </Badge>
                              </Box>
                              <Stack direction={'column'}>
                                <Typography variant="subtitle1">{`# ${id} ${title}`}</Typography>
                                <Stack mt={1} direction={'row'} spacing={2}>
                                  <Typography variant="body2">
                                    {clipTitleOrDescription(row?.last_message || descriptions)}
                                  </Typography>
                                  <Stack direction={'row'} alignItems={'center'} spacing={1}>
                                    <Iconify icon="eva:clock-outline" width={18} height={18} />
                                    <Typography>{formatMessageTime(row?.updated_at)}</Typography>
                                  </Stack>
                                </Stack>
                              </Stack>
                            </Stack>
                          </TableCell>
                          <TableCell>
                            <Stack direction={'row'} alignItems={'center'} spacing={1} justifyContent={'flex-end'}>
                              <Box
                                sx={{
                                  display: 'flex',
                                  bgcolor: is_closed ? '#D7FCD4' : '#E5E5E5',
                                  width: '70px',
                                  borderRadius: '5px',
                                  height: '20px',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  border: '1px solid black',
                                }}
                              >
                                <Typography fontSize={'12px'} color={is_closed ? 'green' : 'black'}>
                                  {is_closed ? 'Closed' : 'Open'}
                                </Typography>
                              </Box>
                              <Avatar>
                                <Iconify icon="eva:person-outline" width={20} height={20} />
                              </Avatar>
                            </Stack>
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
              count={filterTickets.length}
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
