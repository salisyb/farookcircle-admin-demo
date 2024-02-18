/* eslint-disable camelcase */
import React, { useState } from 'react';
// material
import {
  Avatar,
  Box,
  Button,
  Card,
  CircularProgress,
  Container,
  Divider,
  FormControl,
  Grid,
  IconButton,
  InputBase,
  Paper,
  Stack,
  TextField,
  Tooltip,
  Typography,
} from '@mui/material';
// components

import { toast } from 'react-toastify';
import moment from 'moment-timezone';
import { useNavigate } from 'react-router-dom';
import { getTicketByUser } from '../api/system.api';
import Iconify from '../components/Iconify';
import Page from '../components/Page';
import { validateUser } from '../api/users.api';
import BasicModal from './components/Modal';
import UserOptionsCard from './components/User/UserOptionsCard';
import UserOptionsCardMessage from './components/User/UserOptionsCardMessage';
import UserOptionsCardEmail from './components/User/UserOptionsCardEmail';
import UserOptionsCardInfo from './components/User/UserOptionsCardInfo';

export default function UsersManagement() {
  const navigate = useNavigate();

  const [loading, setLoading] = React.useState(false);
  const [selectedUser, setSelectedUser] = React.useState(null);
  const [search, setSearch] = React.useState('');
  const [tickets, setTickets] = React.useState([]);
  const [toggleFundUser, setToggleFundUser] = React.useState(false);
  const [toggleSendUserMessage, setToggleSendUserMessage] = React.useState(false);
  const [toggleSendUserEmail, setToggleSendUserEmail] = React.useState(false);
  const [firstTime, setFirstTime] = useState(true);

  const [modifyUser, setModifyUser] = React.useState(false);

  const handleSearch = async () => {
    setSelectedUser(null);
    setTickets([]);
    setLoading(true);

    const response = await validateUser(search);

    if (response.ok && response.data?.success) {
      setSelectedUser(response.data?.data);
      setLoading(false);
      await handleGetTicket();
      return;
    }

    toast.error('User not found');
    setLoading(false);
  };

  const getUerData = async () => {
    const response = await validateUser(search);

    if (response.ok && response.data?.success) {
      setSelectedUser(response.data?.data);
    }
  };

  const handleGetTicket = async () => {
    const response = await getTicketByUser(search);
    if (response.ok) {
      setTickets(response.data?.filter((ticket) => ticket.is_closed === false));
    }
  };

  const handleViewTicket = (ticketId) => navigate(`/dashboard/tickets/message?ticketId=${ticketId}`);
  const navigateUserTicketScreen = () => navigate(`/dashboard/tickets?user=${selectedUser?.username}`);

  const handleCallUser = () => {
    window.open(`tel:${selectedUser?.username}`, '_blank');
  };

  const toggleAddFund = () => {
    setToggleFundUser(!toggleFundUser);
  };
  const toggleSendMessage = () => {
    setToggleSendUserMessage(!toggleSendUserMessage);
  };
  const toggleSendEmail = () => {
    setToggleSendUserEmail(!toggleSendUserEmail);
  };

  const toggleModifyUser = () => setModifyUser(!modifyUser);

  const handleUpdateUser = (data) => {
    setSelectedUser({ ...selectedUser, ...data });
    toggleModifyUser();
  };

  return (
    <Page title="User">
      {/* add fund modal */}
      <BasicModal isOpen={toggleFundUser} toggleOpen={toggleAddFund}>
        <UserOptionsCard
          user={selectedUser}
          closeModal={toggleAddFund}
          handleRefresh={getUerData}
          onSuccess={toggleAddFund}
        />
      </BasicModal>

      {/* send message modal  */}
      <BasicModal isOpen={toggleSendUserMessage} toggleOpen={toggleSendMessage}>
        <UserOptionsCardMessage user={selectedUser} closeModal={toggleSendMessage} />
      </BasicModal>

      {/* send email modal  */}
      <BasicModal isOpen={toggleSendUserEmail} toggleOpen={toggleSendEmail}>
        <UserOptionsCardEmail user={selectedUser} closeModal={toggleSendEmail} />
      </BasicModal>

      {/* modify user information  */}
      <BasicModal isOpen={modifyUser} toggleOpen={toggleModifyUser}>
        <UserOptionsCardInfo user={selectedUser} closeModal={toggleModifyUser} onUserUpdate={handleUpdateUser} />
      </BasicModal>

      <Container sx={{ flexShrink: 0 }}>
        <Card sx={{ flexGrow: 1, width: '100%', padding: '20px', minHeight: '80vh' }}>
          {/* user details on the left and ticket list on the right  */}
          <Stack sx={{ flex: 1, height: '100%' }} direction={{ xs: 'column', md: 'row' }} spacing={2}>
            <Stack sx={{ flex: 2, padding: '10px', height: 'calc(80vh - 20px)' }}>
              {/* search for user  */}
              <Stack direction={'row'} justifyContent={'space-between'} alignItems={'center'}>
                {!firstTime && (
                  <Paper
                    component="form"
                    sx={{
                      p: '2px 4px',
                      display: 'flex',
                      alignItems: 'center',
                      border: '1px solid #ADC8FF',
                      width: 400,
                    }}
                  >
                    <InputBase
                      sx={{ ml: 1, flex: 1 }}
                      placeholder="Enter user number"
                      inputProps={{ 'aria-label': 'search for user' }}
                      disabled={loading}
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                    />
                    {!loading && search && (
                      <IconButton
                        onClick={() => setSearch('')}
                        size={'20px'}
                        color="primary"
                        sx={{ p: '10px' }}
                        aria-label="directions"
                      >
                        <Iconify icon="streamline:delete-keyboard-solid" />
                      </IconButton>
                    )}
                    <Divider sx={{ height: 28, m: 0.5 }} orientation="vertical" />
                    <IconButton
                      disabled={loading}
                      onClick={handleSearch}
                      color="primary"
                      sx={{ p: '10px' }}
                      size="20px"
                      aria-label="directions"
                    >
                      {loading ? <CircularProgress size={'25px'} /> : <Iconify icon="mdi:search" />}
                    </IconButton>
                  </Paper>
                )}

                {selectedUser && (
                  <Stack direction={'row'} spacing={1}>
                    <Button size={'small'} variant="outlined" onClick={toggleModifyUser}>
                      Modify
                    </Button>
                    <Avatar sx={{ width: '40px', height: '40px' }} />
                  </Stack>
                )}
              </Stack>

              <>
                {/* user details and balance */}
                {selectedUser && (
                  <Typography variant="h6" sx={{ mt: '20px' }}>
                    Personal Information
                  </Typography>
                )}
                {selectedUser ? (
                  <Stack
                    mt={'10px'}
                    spacing={2}
                    direction={'row'}
                    alignItems={'flex-start'}
                    sx={{ justifyContent: 'space-between' }}
                  >
                    {/* user details  */}
                    <Stack spacing={0} flex={2}>
                      {/* Label and value */}
                      <Stack direction={'row'} alignItems={'center'} justifyContent={'space-between'}>
                        <Typography variant="body2">First Name</Typography>
                        <Typography variant="body1" fontWeight={'bold'}>
                          {selectedUser?.first_name}
                        </Typography>
                      </Stack>
                      {/* Label and value */}
                      <Stack direction={'row'} alignItems={'center'} justifyContent={'space-between'}>
                        <Typography variant="body2">Last Name</Typography>
                        <Typography variant="body1" fontWeight={'bold'}>
                          {selectedUser?.last_name}
                        </Typography>
                      </Stack>
                      {/* Label and value */}
                      <Stack direction={'row'} alignItems={'center'} justifyContent={'space-between'}>
                        <Typography variant="body2">Phone</Typography>
                        <Typography variant="body1" fontWeight={'bold'}>
                          {selectedUser?.username}
                        </Typography>
                      </Stack>
                      {/* Label and value */}
                      <Stack direction={'row'} alignItems={'center'} justifyContent={'space-between'}>
                        <Typography variant="body2">Email</Typography>
                        <Typography variant="body1" fontWeight={'bold'}>
                          {selectedUser?.email}
                        </Typography>
                      </Stack>
                      <Stack mt={'10px'} direction={'row'} alignItems={'center'} justifyContent={'space-between'}>
                        <Typography variant="body2">Date Joined</Typography>
                        <Typography variant="body1" fontWeight={'bold'}>
                          {moment(selectedUser?.date_joined).format('DD/MM/YYYY')}
                        </Typography>
                      </Stack>
                    </Stack>
                    {/* user balance  */}
                    <Stack flex={1} alignItems={'center'}>
                      <Stack
                        // bgcolor={'#3366FF'}
                        sx={{ px: '20px', py: '10px', border: '1px solid #3366FF', borderRadius: '10px' }}
                      >
                        <Typography variant="body2">Balance:</Typography>
                        <Typography variant="h4" fontWeight={'bold'} color={'#40C450'}>
                          ₦{selectedUser?.balance}
                        </Typography>
                      </Stack>
                    </Stack>
                  </Stack>
                ) : (
                  <Box
                    minHeight={150}
                    display={'flex'}
                    flexDirection={'column'}
                    justifyContent={'center'}
                    alignItems={'center'}
                  >
                    {firstTime && (
                      <>
                        <Paper
                          component="form"
                          sx={{
                            p: '2px 4px',
                            display: 'flex',
                            alignItems: 'center',
                            border: '1px solid #ADC8FF',
                            width: 400,
                          }}
                        >
                          <InputBase
                            sx={{ ml: 1, flex: 1 }}
                            placeholder="Enter user number"
                            inputProps={{ 'aria-label': 'search for user' }}
                            disabled={loading}
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                          />
                          {!loading && search && (
                            <IconButton
                              onClick={() => setSearch('')}
                              size={'20px'}
                              color="primary"
                              sx={{ p: '10px' }}
                              aria-label="directions"
                            >
                              <Iconify icon="streamline:delete-keyboard-solid" />
                            </IconButton>
                          )}
                          <Divider sx={{ height: 28, m: 0.5 }} orientation="vertical" />
                          <IconButton
                            disabled={loading}
                            onClick={() => {
                              setFirstTime(false);
                              handleSearch();
                            }}
                            color="primary"
                            sx={{ p: '10px' }}
                            size="20px"
                            aria-label="directions"
                          >
                            {loading ? <CircularProgress size={'25px'} /> : <Iconify icon="mdi:search" />}
                          </IconButton>
                        </Paper>
                        <Typography variant="body2" sx={{ mt: '10px' }}>
                          Search to load profile
                        </Typography>
                      </>
                    )}
                  </Box>
                )}
                <Divider sx={{ mt: '10px' }} />

                {/* user actions  */}
                <Typography variant="h6" sx={{ mt: '20px' }}>
                  Actions
                </Typography>

                <Stack direction="row" spacing={2} mt={'10px'}>
                  <Tooltip title="Fund user wallet">
                    <IconButton
                      disabled={!selectedUser}
                      onClick={toggleAddFund}
                      color="primary"
                      sx={{ p: '10px' }}
                      aria-label="directions"
                    >
                      <Iconify icon="typcn:plus-outline" width={40} height={40} />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="Direct call">
                    <IconButton
                      disabled={!selectedUser}
                      onClick={handleCallUser}
                      color="primary"
                      sx={{ p: '10px' }}
                      aria-label="directions"
                    >
                      <Iconify icon="pepicons-print:phone" width={40} height={40} />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="Send direct message to user">
                    <IconButton
                      disabled={!selectedUser}
                      onClick={toggleSendMessage}
                      color="primary"
                      sx={{ p: '10px' }}
                      aria-label="directions"
                    >
                      <Iconify icon="ant-design:message-twotone" width={40} height={40} />
                    </IconButton>
                  </Tooltip>

                  <Tooltip title="Send Email to user">
                    <IconButton
                      disabled={!selectedUser}
                      onClick={toggleSendEmail}
                      color="primary"
                      sx={{ p: '10px' }}
                      aria-label="directions"
                    >
                      <Iconify icon="ic:twotone-mail" width={40} height={40} />
                    </IconButton>
                  </Tooltip>
                </Stack>

                <Divider sx={{ mt: '10px' }} />

                <Typography variant="h6" sx={{ mt: '20px' }}>
                  History
                </Typography>

                <Stack direction="row" spacing={2} mt={'10px'}>
                  <Button
                    startIcon={<Iconify icon="icon-park-twotone:transaction" />}
                    variant="outlined"
                    fullWidth
                    color="primary"
                    disabled
                  >
                    Transaction
                  </Button>
                  <Button
                    startIcon={<Iconify icon="ph:ticket-duotone" />}
                    onClick={navigateUserTicketScreen}
                    variant="outlined"
                    fullWidth
                    color="primary"
                    disabled={!selectedUser}
                  >
                    Tickets
                  </Button>
                </Stack>
              </>
            </Stack>

            {/* ticket container  */}
            <Stack
              spacing={2}
              sx={{
                display: { xs: 'none', md: 'flex' },
                flex: 1,
                padding: '10px',

                borderLeftWidth: 1,
                borderLeftColor: '#3366FF',
                borderLeftStyle: 'solid',
              }}
            >
              {/* Ticket title and create button  */}
              <Stack direction="column" spacing={1}>
                <Stack direction="row" justifyContent="space-between">
                  <Typography variant="h6">Tickets</Typography>
                  <Button disabled size={'small'} variant="outlined" endIcon={<Iconify icon="mdi:plus" />}>
                    New Ticket
                  </Button>
                </Stack>
                {/* <Paper
                  component="form"
                  sx={{
                    p: '2px 4px',
                    display: 'flex',
                    alignItems: 'center',
                    border: '1px solid #ADC8FF',
                    width: '100%',
                  }}
                >
                  <InputBase
                    sx={{ ml: 1, flex: 1 }}
                    placeholder="Search For Tickets"
                    inputProps={{ 'aria-label': 'search for tickets' }}
                  />
                  <Divider sx={{ height: 28, m: 0.5 }} orientation="vertical" />
                  <IconButton color="primary" sx={{ p: '10px' }} aria-label="directions">
                    <Iconify icon="mdi:search" />
                  </IconButton>
                </Paper> */}
              </Stack>

              {/* ticket list  */}
              <Stack direction="column" sx={{ overflow: 'scroll', height: 'calc(80vh - 40px)' }}>
                {tickets.map((ticket) => (
                  <Stack
                    onClick={() => handleViewTicket(ticket.id)}
                    key={ticket.id}
                    direction="row"
                    spacing={1}
                    sx={{
                      paddingX: '10px',
                      paddingY: '10px',
                      borderBottom: '1px solid #ADC8FF',
                      cursor: 'pointer',
                      '&:hover': {
                        backgroundColor: 'action.hover',
                      },
                    }}
                  >
                    <Avatar sx={{ bgcolor: '#ADC8FF' }}>
                      <Avatar sx={{ width: 35, height: 35, bgcolor: 'white', color: '#3366FF' }}>
                        {ticket?.is_closed ? (
                          <Iconify icon="bxs:message-check" />
                        ) : (
                          <Iconify icon="bxs:message-error" />
                        )}
                      </Avatar>
                    </Avatar>
                    <Stack>
                      <Typography variant="subtitle2"># {ticket?.id} Ticket</Typography>
                      <Typography variant="body2">This is a ticket description</Typography>
                    </Stack>
                  </Stack>
                ))}
              </Stack>
            </Stack>
          </Stack>
        </Card>
      </Container>
    </Page>
  );
}
