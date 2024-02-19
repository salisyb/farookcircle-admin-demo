/* eslint-disable jsx-a11y/label-has-associated-control */
import React, { useEffect, useState } from 'react';
import { Box, Button, CircularProgress, IconButton, Stack, TextField, Typography, styled } from '@mui/material';
import Iconify from '../../../components/Iconify';
import { sendUserMessage } from '../../../api/users.api';

const VisuallyHiddenInput = styled('input')({
  clip: 'rect(0 0 0 0)',
  clipPath: 'inset(50%)',
  height: 1,
  overflow: 'hidden',
  position: 'absolute',
  bottom: 0,
  left: 0,
  whiteSpace: 'nowrap',
  width: 1,
});

export default function UserOptionsCardMessage({ user, closeModal }) {
  const [loading, setLoading] = React.useState(false);
  const [status, setStatus] = React.useState(false);
  const [statusMessage, setStatusMessage] = React.useState();
  const [valid, setValid] = React.useState(false);
  const [show, setShow] = React.useState(false);

  const [isLoading, setIsLoading] = React.useState(false);
  const [title, setTitle] = React.useState('');
  const [message, setMessage] = React.useState('');

  useEffect(() => {
    if (title && message) {
      setValid(true);
    } else {
      setValid(false);
    }
  }, [title, message]);

  const handleToggleShow = () => {
    if (status) {
      closeModal();
      return;
    }

    setShow(false);
  };

  const handleSendDirectMessage = async () => {
    setIsLoading(true);
    const response = await sendUserMessage({ username: user?.username, title, message });
    if (response.ok) {
      setStatus(true);
      setStatusMessage('Message sent successfully');
      setShow(true);
    } else {
      setStatus(false);
      setStatusMessage('Message not sent');
      setShow(true);
    }

    setIsLoading(false);
  };

  return (
    <>
      <Box sx={{ position: 'relative', width: '100%', height: '100%' }}>
        {isLoading ? (
          <Box
            sx={{
              width: '100%',
              height: '100%',
              position: 'absolute',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              backgroundColor: 'white',
              zIndex: 7,
            }}
          >
            <CircularProgress />
            <Typography>Please wait...</Typography>
          </Box>
        ) : (
          <>
            {show && (
              <Box
                sx={{
                  width: '100%',
                  height: '100%',
                  position: 'absolute',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  backgroundColor: 'white',
                  zIndex: 7,
                }}
              >
                {loading ? (
                  <CircularProgress />
                ) : (
                  <>
                    <Typography textAlign={'center'}>{statusMessage}</Typography>

                    <Button variant="outlined" onClick={handleToggleShow}>
                      Ok
                    </Button>
                  </>
                )}
              </Box>
            )}

            <Stack spacing={1}>
              <TextField id="outlined-required" label="To" disabled value={user?.username} />
              <TextField
                id="outlined-required"
                label="Subject"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />

              <TextField
                id="outlined-required"
                label="Send direct message to user"
                value={message}
                multiline
                rows={6}
                onChange={(event) => setMessage(event.target.value)}
              />
            </Stack>

            <Box sx={{ mt: '20px' }}>
              <>
                <Button variant={'contained'} onClick={closeModal} sx={{ mr: '10px' }} color="error">
                  Cancel
                </Button>
                <Button disabled={!valid} onClick={handleSendDirectMessage} variant={'contained'}>
                  Send Direct Message
                </Button>
              </>
            </Box>
          </>
        )}
      </Box>
    </>
  );
}
