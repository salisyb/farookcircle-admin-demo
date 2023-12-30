/* eslint-disable jsx-a11y/label-has-associated-control */
/* eslint-disable camelcase */
import React, { useCallback, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { filter } from 'lodash';
import { sentenceCase } from 'change-case';
import { Link as RouterLink, useLocation, useNavigate } from 'react-router-dom';
// material
import {
  Card,
  Stack,
  Avatar,
  Button,
  Container,
  Typography,
  TextField,
  Box,
  FormControl,
  CircularProgress,
} from '@mui/material';

import moment from 'moment-timezone';
import { toast } from 'react-toastify';
import { LoadingButton } from '@mui/lab';
import { closeTicket, createTicketMessage, getTicketById, getTicketMessage } from '../api/system.api';
import { fetchAllTicket } from '../store/actions/system';
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
    formData.append('sender', user.username);

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
        sender: user.username,
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
    const request = await closeTicket(selectedTicket?.id);
    if (request.ok) {
      toast.success('Ticket Closed Successfully');
      setCloseLoading(false);
      navigate('/dashboard/ticket');
      return;
    }

    setCloseLoading(false);
    toast.error(request.data?.message ? request.data?.message : 'Unable to close the ticket please try again');
  };

  return (
    <>
      <ModalC isOpen={toggleDescriptions} setOpen={() => setToggleDescriptions(false)}>
        <Box sx={{ display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
          <Typography marginTop={'10px'} fontWeight={'700'}>
            Title:
          </Typography>
          <Typography>{selectedTicket?.title}</Typography>
          <Typography fontWeight={'700'}>Descriptions:</Typography>
          <Typography sx={{ mb: '10px' }}>{selectedTicket?.descriptions}</Typography>

          {selectedTicket?.attachment && <img src={selectedTicket?.attachment} alt={'desc-attachment'} />}
          <Button onClick={() => setToggleDescriptions(false)} variant="contained" sx={{ mt: '10px' }}>
            Close
          </Button>
        </Box>
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
                    sx={{
                      padding: '10px',
                      bgcolor: conversation?.sender === ticketOwner?.username ? '#E5E5E5' : '#D6E4FF',
                      borderRadius: '10px',
                      maxWidth: '80%',
                      display: 'flex',
                      alignSelf: conversation?.sender === ticketOwner?.username ? 'flex-start' : 'flex-end',
                    }}
                  >
                    {conversation.attachment && (
                      <Box onClick={() => setImageOverlay(conversation.attachment)}>
                        <img src={conversation.attachment} alt={'conversation'} />
                      </Box>
                    )}
                    <Typography sx={{ color: 'black' }}>{conversation.message}</Typography>
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
