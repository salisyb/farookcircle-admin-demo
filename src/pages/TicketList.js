/* eslint-disable jsx-a11y/label-has-associated-control */
/* eslint-disable camelcase */
import React, { useCallback, useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { filter } from 'lodash';
import { sentenceCase } from 'change-case';
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
} from '@mui/material';
import moment from 'moment-timezone';
import { LoadingButton } from '@mui/lab';
import { useFormik } from 'formik';
import { toast } from 'react-toastify';
import { getUsers } from '../store/actions/users';
import { fetchAllTicket } from '../store/actions/system';
import { createTicket, getAllTicket } from '../api/system.api';
import TicketListToolbar from '../sections/@dashboard/user/TicketListToolbar';

// components

import Page from '../components/Page';
import Label from '../components/Label';
import Scrollbar from '../components/Scrollbar';
import Iconify from '../components/Iconify';
import SearchNotFound from '../components/SearchNotFound';
import { UserListHead } from '../sections/@dashboard/user';
// mock
import { TICKETS_LIST, MESSAGE_LIST, top100Films } from '../_mock/tickets';
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
    return filter(array, (_ticket) => _ticket.id.toString().includes(query));
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
    startPolling();
  }, [dispatch, startPolling]);

  useEffect(() => {
    console.log('Cleaning up');
    return () => {
      stopPolling();
    };
  }, [stopPolling]);

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

  const handleApplyFilter = (filter) => {
    if (Object.keys(filter).length < 1) {
      setFilterTickets(tickets);
      return;
    }
    handleFilterTickets(filter);
  };

  const handleRouteToTicketMessage = (ticketId) => {
    navigate(`/dashboard/ticket/message?ticketId=${ticketId}`);
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

    const request = await createTicket(formData);
    if (request.ok) {
      toast.success('You have successfully create new ticket');
      handleRouteToTicketMessage(request.data?.id);
      setCreateTicketLoading(false);
      setToggleCreateTicket(false);
      return;
    }

    setCreateTicketLoading(false);
    toast.error(request.data?.message ? request.data?.message : 'Unable to create your ticket');
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
            <Stack direction="row" alignItems={'center'} spacing={1} sx={{ px: '20px', pb: '20px' }}>
              <Button variant={'contained'} size="medium" onClick={() => setToggleCreateTicket(!toggleCreateTicket)}>
                New Ticket
              </Button>
              <Button variant="contained" onClick={() => dispatch(fetchAllTicket())}>
                Refresh
              </Button>
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
                          onClick={() => handleRouteToTicketMessage(id)}
                          sx={{ cursor: 'pointer' }}
                        >
                          <TableCell padding="checkbox" />
                          <TableCell component="th" scope="row" padding="none">
                            <Stack direction="row" alignItems="flex-start" spacing={2}>
                              <Iconify icon="eva:email-outline" width={30} height={30} />
                              <Stack>
                                <Typography variant="subtitle1">{`# ${id} ${title}`}</Typography>
                                <Typography variant="body2">{descriptions}</Typography>
                                <Stack mt={1} direction={'column'} spacing={1}>
                                  <Stack direction={'row'} alignItems={'center'} spacing={1}>
                                    <Iconify icon="eva:clock-outline" width={18} height={18} />
                                    <Typography>{moment(created_at).calendar()}</Typography>
                                  </Stack>
                                  <Typography color={'salmon'}>
                                    {is_closed ? 'Ticket Closed' : 'Open Ticket'}
                                  </Typography>
                                </Stack>
                              </Stack>
                            </Stack>
                          </TableCell>
                          <TableCell align="left">
                            <Avatar>
                              <Iconify icon="eva:person-outline" width={20} height={20} />
                            </Avatar>
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
