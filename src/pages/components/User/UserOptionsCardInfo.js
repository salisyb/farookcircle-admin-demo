/* eslint-disable jsx-a11y/label-has-associated-control */
import React, { useState } from 'react';
import { Box, Button, CircularProgress, IconButton, Stack, TextField, Typography, styled } from '@mui/material';
import Iconify from '../../../components/Iconify';
import { updateUserInfo } from '../../../api/users.api';

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

export default function UserOptionsCardInfo({ user, closeModal, onUserUpdate }) {
  const [loading, setLoading] = React.useState(false);
  const [status, setStatus] = React.useState(false);
  const [statusMessage, setStatusMessage] = React.useState();
  const [valid, setValid] = React.useState(false);
  const [show, setShow] = React.useState(false);

  const [isLoading, setIsLoading] = React.useState(false);

  const [email, setEmail] = useState(user?.email);
  const [firstName, setFirstName] = useState(user?.first_name);
  const [lastName, setLastName] = useState(user?.last_name);

  const handleToggleShow = () => {
   
    if (status) {
      setShow(false);
      onUserUpdate({ email, first_name: firstName, last_name: lastName});
      return;
    }

    setShow(false);
  };

  const handleSubmit = async () => {
    setIsLoading(true);
    const data = {
      username: user?.username,
      email,
      first_name: firstName,
      last_name: lastName,
    };


    const response = await updateUserInfo(data);

    if (response.ok) {
      setStatus(true);
      setStatusMessage('User information updated successfully');
      setShow(true);
    } else {
      setStatus(false);
      setStatusMessage('User information failed to update');
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

            <Stack spacing={3}>
              <Stack mb={'10px'}>
                <Typography variant={'h6'}>User Information</Typography>
                <Typography variant={'caption'}>Modify user information</Typography>
              </Stack>
              <TextField id="outlined-required" label="Username" value={user?.username} disabled />
              <TextField
                id="outlined-required"
                label="First name"
                value={firstName}
                type="text"
                required
                onChange={(event) => setFirstName(event.target.value)}
              />
              <TextField
                id="outlined-required"
                label="Last name"
                type="text"
                required
                value={lastName}
                onChange={(event) => setLastName(event.target.value)}
              />
              <TextField
                id="outlined-required"
                label="Email Address"
                type="email"
                required
                value={email}
                onChange={(event) => setEmail(event.target.value)}
              />
            </Stack>

            <Box sx={{ mt: '20px' }}>
              <>
                <Button variant={'contained'} onClick={closeModal} sx={{ mr: '10px' }} color="error">
                  Cancel
                </Button>
                <Button onClick={handleSubmit} variant={'contained'}>
                  Modify
                </Button>
              </>
            </Box>
          </>
        )}
      </Box>
    </>
  );
}
