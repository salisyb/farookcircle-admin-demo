/* eslint-disable jsx-a11y/label-has-associated-control */
import React, { useState } from 'react';
import { Box, Button, CircularProgress, IconButton, Stack, TextField, Typography, styled } from '@mui/material';
import Iconify from '../../../components/Iconify';

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

  const type = 'Fund';

  const [isLoading, setIsLoading] = React.useState(false);
  const [time, setTime] = React.useState('');
  const [pin, setPin] = React.useState('');

  const [email, setEmail] = useState('');
  const [subject, setSubject] = useState('');
  const [attchment, setAttchment] = useState('');

  const handleToggleShow = () => {
    console.log(status);
    if (status) {
      return;
    }

    setShow(false);
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
                value={time}
                onChange={(event) => setTime(event.target.value)}
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
                  <VisuallyHiddenInput type="file" />
                </IconButton>
                <Typography variant="body2">Attach File</Typography>
              </Stack>
            </Stack>

            <Box sx={{ mt: '20px' }}>
              <>
                <Button variant={'contained'} onClick={closeModal} sx={{ mr: '10px' }} color="error">
                  Cancel
                </Button>
                <Button variant={'contained'}>Send Email</Button>
              </>
            </Box>
          </>
        )}
      </Box>
    </>
  );
}