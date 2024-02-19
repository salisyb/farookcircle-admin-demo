/* eslint-disable jsx-a11y/label-has-associated-control */
import React, { useEffect, useState } from 'react';
import { Box, Button, CircularProgress, IconButton, Stack, TextField, Typography, styled } from '@mui/material';
import Iconify from '../../../components/Iconify';
import { sendUserEmail } from '../../../api/users.api';

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

export default function UserOptionsCardEmail({ user, closeModal }) {
  const [loading, setLoading] = React.useState(false);
  const [status, setStatus] = React.useState(false);
  const [statusMessage, setStatusMessage] = React.useState();
  const [valid, setValid] = React.useState(false);
  const [show, setShow] = React.useState(false);

  const [isLoading, setIsLoading] = React.useState(false);
  const [email, setEmail] = useState('');
  const [subject, setSubject] = useState('');
  const [attachment, setAttachment] = useState(null);

  useEffect(() => {
    if (email && subject) {
      setValid(true);
    } else {
      setValid(false);
    }
  }, [email, subject]);

  const handleToggleShow = () => {
    if (status) {
      closeModal();
      return;
    }

    setShow(false);
  };

  const handleSendUserEmail = async () => {
    setIsLoading(true);
    const response = await sendUserEmail({ username: user?.username, subject, email, attachment });
    if (response.ok) {
      setStatus(true);
      setStatusMessage('Email sent successfully');
      setShow(true);
    } else {
      setStatus(false);
      setStatusMessage('Email not sent');
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
              <TextField id="outlined-required" label="To" value={user?.email} disabled />
              <TextField
                id="outlined-required"
                label="Subject"
                value={subject}
                onChange={(event) => setSubject(event.target.value)}
              />
              <TextField
                id="outlined-required"
                label="Compose Email"
                value={email}
                multiline
                rows={6}
                onChange={(event) => setEmail(event.target.value)}
              />
              <Stack direction={'row'} alignItems={'center'}>
                <IconButton color="primary" aria-label="upload picture" component="label">
                  <Iconify icon="mdi:attachment" />
                  {/* accept only pdf or image  */}
                  <VisuallyHiddenInput
                    type="file"
                    accept=".pdf, .jpg, .jpeg, .png, .gif, .doc, .docx, .xls, .xlsx .txt, .csv"
                    onChange={(event) => setAttachment(event.target.files[0])}
                  />
                </IconButton>
                <Typography variant="body2">Attach File</Typography>
              </Stack>
            </Stack>

            <Box sx={{ mt: '20px' }}>
              <>
                <Button variant={'contained'} onClick={closeModal} sx={{ mr: '10px' }} color="error">
                  Cancel
                </Button>
                <Button disabled={!valid} variant={'contained'} onClick={handleSendUserEmail}>
                  Send Email
                </Button>
              </>
            </Box>
          </>
        )}
      </Box>
    </>
  );
}
