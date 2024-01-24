/* eslint-disable no-restricted-globals */
/* eslint-disable jsx-a11y/label-has-associated-control */
/* eslint-disable camelcase */
import React, { useCallback, useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Link as RouterLink, useLocation, useNavigate } from 'react-router-dom';
// material
import {
  Card,
  Stack,
  Button,
  Container,
  Typography,
  TextField,
  Box,
  CircularProgress,
  IconButton,
  Avatar,
} from '@mui/material';

import { toast } from 'react-toastify';
import { LoadingButton } from '@mui/lab';
import moment from 'moment-timezone';
import { closeTicket, createTicketMessage, getTicketMessage } from '../api/system.api';
// components

import Page from '../components/Page';
import Iconify from '../components/Iconify';
import ModalC from './components/CModal';

const POLLING_INTERVAL = 5000;

export default function TicketMessages() {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const location = useLocation();

  // Accessing query parameters from location object
  const queryParams = new URLSearchParams(location.search);
  const ticketId = queryParams.get('ticketId');
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [ticketOwner, setTicketOwner] = useState(null);
  const navigate = useNavigate();
  const [ticketMessages, setTicketMessages] = useState([]);
  const [isLoading, setIsLoading] = React.useState(false);
  const [imageOverlay, setImageOverlay] = useState('');
  const [message, setMessage] = useState('');

  const [toggleDescriptions, setToggleDescriptions] = useState(false);

  const [closeLoading, setCloseLoading] = useState(false);
  const [attachment, setAttachment] = useState(null);
  const [attachmentPreview, setAttachmentPreview] = useState(null);
  const [pollingId, setPollingId] = useState();

  const handleGetTicketMessages = useCallback(async () => {
    const request = await getTicketMessage(ticketId);
    if (request.ok) {
      const { conversations, user, ticket } = request.data;
      setTicketMessages(conversations);
      setSelectedTicket(ticket);
      setTicketOwner(user);
    }
  }, [ticketId]);

  const startPolling = useCallback(() => {
    const pollingId = setInterval(() => {
      handleGetTicketMessages();
    }, POLLING_INTERVAL);

    // Store the pollingId in state for later cleanup
    setPollingId(pollingId);
  }, [handleGetTicketMessages]);

  const handleInitiateTicket = useCallback(async () => {
    setIsLoading(true);

    await handleGetTicketMessages();
    setIsLoading(false);
    startPolling();
  }, [handleGetTicketMessages, startPolling]);

  // Function to handle attachment selection
  const handleAttachmentChange = (event) => {
    const file = event.target.files[0];
    setAttachment(file);

    setAttachmentPreview(URL.createObjectURL(file));
  };

  React.useEffect(() => {
    handleInitiateTicket();
  }, [handleInitiateTicket, ticketId]);

  React.useEffect(() => {
    console.log('Clean up');
    return () => {
      clearInterval(pollingId);
    };
  }, [pollingId]);

  const handleSendTicketMessage = async () => {
    const formData = new FormData();

    formData.append('ticket', selectedTicket.id);
    formData.append('message', message);
    formData.append('sender', user?.alias);

    if (attachment) {
      formData.append('attachment', attachment);
    }

    const oldMessages = ticketMessages;

    setTicketMessages([
      ...ticketMessages,
      {
        id: -1,
        ticket: selectedTicket?.id,
        message,
        sender: user.alias,
        attachment: attachment ? attachmentPreview : null,
      },
    ]);

    setMessage('');
    setAttachment(null);
    setAttachmentPreview('');

    const request = await createTicketMessage(selectedTicket?.id, formData);

    if (request.ok) {
      handleGetTicketMessages();
      return;
    }

    setTicketMessages(oldMessages);
    toast.error('Send Error', request.data?.message ? request.data?.message : 'Unable to send your ticket message');
  };

  const handleCloseTicket = async () => {
    setCloseLoading(true);
    const request = await closeTicket(selectedTicket?.id, { closed_by: user?.alias });
    if (request.ok) {
      toast.success('Ticket Closed Successfully');
      setCloseLoading(false);
      navigate('/dashboard/ticket');
      return;
    }

    setCloseLoading(false);
    toast.error(request.data?.message ? request.data?.message : 'Unable to close the ticket please try again');
  };

  const handleCopyClick = () => {
    navigator.clipboard.writeText(selectedTicket?.reference);
    toast.success('Copied to clipboard');
  };

  const [lastViewTicket, setLastViewTicket] = useState([]);

  const handleGetSavedTicketList = useCallback(async () => {
    const savedTicketList = await localStorage.getItem('ticketListView');

    if (savedTicketList) {
      // save but remove the one we have
      const parseData = JSON.parse(savedTicketList);
      setLastViewTicket(parseData.filter((item) => item.id !== ticketId));
    }
  }, [ticketId]);

  const handleUpdateLastViewTicket = useCallback(async () => {
    const lastMessage = ticketMessages[ticketMessages.length - 1];

    if (lastMessage) {
      await localStorage.setItem(
        'ticketListView',
        JSON.stringify([...lastViewTicket, { id: ticketId, last_message: lastMessage.message }])
      );
    }
  }, [lastViewTicket, ticketId, ticketMessages]);

  useEffect(() => {
    handleGetSavedTicketList();
  }, [handleGetSavedTicketList]);

  useEffect(() => {
    handleUpdateLastViewTicket();
  }, [handleUpdateLastViewTicket, ticketMessages.length]);

  return (
    <>
      <ModalC isOpen={toggleDescriptions} setOpen={() => setToggleDescriptions(false)}>
        <Stack spacing={1}>
          <Stack>
            <Typography color={'#666666'} marginTop={'10px'} fontWeight={'300'} fontSize={'14px'}>
              Title
            </Typography>
            <Typography fontWeight={'600'}>{selectedTicket?.title}</Typography>
          </Stack>
          <Stack>
            <Typography color={'#666666'} fontWeight={'300'} fontSize={'14px'}>
              Descriptions
            </Typography>
            <Typography fontWeight={'600'}>{selectedTicket?.descriptions}</Typography>
          </Stack>

          <Stack>
            <Typography color={'#666666'} fontWeight={'300'} fontSize={'14px'}>
              Ticket Owner
            </Typography>
            <Stack direction={'row'} alignItems={'center'} spacing={1}>
              <Avatar sx={{ width: 30, height: 30 }} />
              <Stack>
                <Typography fontWeight={'600'} fontSize={'14px'}>
                  {ticketOwner?.first_name} {ticketOwner?.last_name}
                </Typography>
                <Typography>{ticketOwner?.username}</Typography>
              </Stack>
            </Stack>
          </Stack>

          <Stack>
            <Typography color={'#666666'} fontWeight={'300'} fontSize={'14px'}>
              Reference
            </Typography>
            <Typography fontWeight={'600'}>{selectedTicket?.reference}</Typography>
          </Stack>

          <Stack>
            <Typography color={'#666666'} fontWeight={'300'} fontSize={'14px'}>
              Created at
            </Typography>
            <Typography fontWeight={'600'}>{moment(selectedTicket?.created_at).format('MMM D YYYY LT')}</Typography>
          </Stack>

          <Stack>
            <Typography color={'#666666'} fontWeight={'300'} fontSize={'14px'}>
              Created By
            </Typography>
            <Typography fontWeight={'600'}>{selectedTicket?.created_by}</Typography>
          </Stack>

          <Stack>
            <Typography color={'#666666'} fontWeight={'300'} fontSize={'14px'}>
              Status
            </Typography>
            <Box
              sx={{
                display: 'flex',
                bgcolor: selectedTicket?.is_closed ? '#D7FCD4' : '#E5E5E5',
                width: '70px',
                borderRadius: '5px',
                height: '20px',
                alignItems: 'center',
                justifyContent: 'center',
                border: '1px solid black',
              }}
            >
              <Typography fontSize={'12px'} color={selectedTicket?.is_closed ? 'green' : 'black'}>
                {selectedTicket?.is_closed ? 'Closed' : 'Open'}
              </Typography>
            </Box>
          </Stack>

          {selectedTicket?.is_closed && (
            <Stack>
              <Typography color={'#666666'} fontWeight={'300'} fontSize={'14px'}>
                Ticket Close By
              </Typography>
              <Typography fontWeight={'600'}>{selectedTicket?.closed_by}</Typography>
            </Stack>
          )}

          <Stack>
            <Typography color={'#666666'} fontWeight={'300'} fontSize={'14px'}>
              Attended By
            </Typography>
            <Typography fontWeight={'600'}>{selectedTicket?.attended_by}</Typography>
          </Stack>

          {selectedTicket?.attachment && (
            <Button onClick={() => open(selectedTicket?.attachment, '_blank')}>View Attachment</Button>
          )}
          <Button onClick={() => setToggleDescriptions(false)} variant="contained" sx={{ mt: '10px' }}>
            Close
          </Button>
        </Stack>
      </ModalC>
      <ModalC isOpen={isLoading}>
        <Box sx={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center' }}>
          <CircularProgress />
          <Typography marginTop={'10px'}>Loading Conversation please wait...</Typography>
        </Box>
      </ModalC>
      <ModalC isOpen={closeLoading}>
        <Box sx={{ display: 'flex', direction: 'column', justifyContent: 'center', alignItems: 'center' }}>
          <CircularProgress />
          <Typography mt={'10px'}>Closing ticket please wait...</Typography>
        </Box>
      </ModalC>
      {imageOverlay && (
        <Box
          sx={{
            position: 'absolute',
            width: '100vw',
            height: '100vh',
            bgcolor: 'black',
            zIndex: '100',
            paddingTop: 5,
          }}
        >
          <Button onClick={() => setImageOverlay('')} variant="contained" sx={{ marginInline: 4 }}>
            Close
          </Button>
          <Box
            sx={{
              width: '100%',
              height: '100%',
              bgcolor: 'black',
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
            }}
          >
            <img src={imageOverlay} alt={'overlay'} />
          </Box>
        </Box>
      )}
      <Page title="Staff">
        <>
          <Container sx={{ overflow: 'hidden' }}>
            <Stack direction="row" alignItems="center" justifyContent="space-between">
              <Stack direction={'row'} alignItems={'center'} spacing={1}>
                <Button onClick={() => navigate('/dashboard/ticket')} variant={'contained'}>
                  <Iconify icon="eva:arrow-back-outline" width={20} height={20} />
                </Button>
                <Typography variant="h4" gutterBottom>
                  Ticket # {ticketId}
                </Typography>
              </Stack>

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
            <Stack mt={'5px'}>
              <Typography>Ticket reference</Typography>
              <Stack direction={'row'} alignItems={'center'}>
                <Typography variant="body2" gutterBottom>
                  {selectedTicket?.reference}
                </Typography>
                <IconButton onClick={handleCopyClick}>
                  <Iconify icon={'eva:copy-outline'} width={20} height={20} />
                </IconButton>
              </Stack>
            </Stack>
            <Stack my={2} direction={'row'} justifyContent={'space-between'} spacing={1}>
              <Button onClick={() => setToggleDescriptions(true)}>View Ticket Descriptions</Button>
              {!selectedTicket?.is_closed && (
                <LoadingButton onClick={() => handleCloseTicket()} loading={closeLoading} variant={'outlined'}>
                  Close Ticket
                </LoadingButton>
              )}
            </Stack>
            <Card sx={{ minHeight: '65vh', maxHeight: '65vh', padding: '20px', overflow: 'scroll' }}>
              <Stack width={'100%'} direction={'column'} spacing={1} overflow={'scroll'}>
                {ticketMessages.map((conversation, index) => (
                  <Stack
                    key={index}
                    spacing={1}
                    sx={{
                      padding: '10px',
                      bgcolor: conversation?.sender === ticketOwner?.username ? '#FFE9D2' : '#D6E4FF',
                      borderRadius: '5px',
                      minWidth: '100%',
                      display: 'flex',
                      borderLeftWidth: '5px',
                      borderLeftStyle: 'solid',
                      borderLeftColor: conversation?.sender === ticketOwner?.username ? '#FF4D2D' : '#3366FF',
                      // alignSelf: conversation?.sender === ticketOwner?.username ? 'flex-start' : 'flex-end',
                    }}
                  >
                    <Stack direction={'row'} spacing={1} sx={{ alignItems: 'center' }}>
                      <Avatar sx={{ width: 30, height: 30 }} />
                      <Typography sx={{ color: 'black' }} variant={'body1'}>
                        {conversation.sender}
                      </Typography>
                      <Typography
                        sx={{
                          color: 'gray',
                          fontSize: '12px',
                        }}
                      >
                        {moment(conversation.created_at).format('D MMM hh:mm a')}
                      </Typography>
                    </Stack>
                    {conversation.attachment && (
                      <Box onClick={() => setImageOverlay(conversation.attachment)}>
                        <img src={conversation.attachment} alt={'conversation'} />
                      </Box>
                    )}
                    <Typography sx={{ color: 'black' }} variant="body2">
                      {conversation.message}
                    </Typography>
                  </Stack>
                ))}
              </Stack>
            </Card>
            <Stack>
              {attachmentPreview && (
                <Box
                  sx={{ mt: '10px' }}
                  onClick={() => {
                    setAttachmentPreview('');
                    setAttachment('');
                  }}
                >
                  <img
                    src={attachmentPreview}
                    alt="Attachment Preview"
                    style={{ maxWidth: '50px', maxHeight: '50px' }}
                  />
                </Box>
              )}
            </Stack>
            {selectedTicket?.is_closed ? (
              <Button disabled sx={{ mt: '10px' }} fullWidth>
                Ticket is Closed
              </Button>
            ) : (
              <Stack direction="row" alignItems="center" spacing={1} mt={2}>
                {/* Add Attachment Button */}
                <input
                  type="file"
                  accept="image/*, application/pdf"
                  style={{ display: 'none' }}
                  id="attachmentInput"
                  onChange={handleAttachmentChange}
                />

                <label htmlFor="attachmentInput">
                  <Button variant="outlined" color="primary" component="span">
                    <Iconify icon={'eva:attach-2-outline'} width={25} height={25} />
                  </Button>
                </label>

                {/* Input Field */}
                <TextField
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  onKeyDown={(event) => {
                    if (event.key === 'Enter' && !event.shiftKey) {
                      // Prevent the default behavior of the Enter key (e.g., new line in text area)
                      event.preventDefault();

                      // Send the message
                      handleSendTicketMessage();
                    }
                  }}
                  placeholder="Type a message..."
                  fullWidth
                  variant="outlined"
                  size="small"
                  style={{ marginRight: '8px' }}
                />

                {/* Send Button */}
                <Button
                  disabled={message.length < 1}
                  onClick={handleSendTicketMessage}
                  variant="contained"
                  color="primary"
                >
                  Send
                </Button>
              </Stack>
            )}
          </Container>
        </>
      </Page>
    </>
  );
}
