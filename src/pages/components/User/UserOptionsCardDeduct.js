/* eslint-disable jsx-a11y/label-has-associated-control */
import React, { useState } from 'react';
import {
  Alert,
  Box,
  Button,
  Checkbox,
  CircularProgress,
  FormControlLabel,
  Stack,
  TextField,
  Typography,
} from '@mui/material';

import { DemoContainer } from '@mui/x-date-pickers/internals/demo';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';

import { agentDeductUser, agentFundUserWallet } from '../../../api/users.api';

export default function UserOptionsCardDeduct({ user, handleRefresh, type, onSuccess }) {
  // state

  const [amount, setAmount] = React.useState('');
  const [loading, setLoading] = React.useState(false);
  const [status, setStatus] = React.useState(false);
  const [statusMessage, setStatusMessage] = React.useState();
  const [valid, setValid] = React.useState(false);
  const [show, setShow] = React.useState(false);

  const [isLoading, setIsLoading] = React.useState(false);
  const [time, setTime] = React.useState('');
  const [pin, setPin] = React.useState('');
  const [fakePin, setFakingPin] = React.useState('');

  const handleUserWallet = async () => {
    setShow(true);
    setLoading(true);

    const response = await agentDeductUser({
      agent: user?.username,
      amount,
      reason: time,
    });
    // agent, from, amount, time,
    if (response.ok) {
      setLoading(false);
      setStatus(true);
      handleRefresh();
      setStatusMessage(response.data?.message);
      return;
    }
    setLoading(false);
    setStatus(false);

    setStatusMessage(response.data?.message);
  };

  const handleToggleShow = () => {
    if (status) {
      onSuccess();
      return;
    }

    setShow(false);
  };

  React.useEffect(() => {
    if (amount !== '' && time) {
      setValid(true);
      return;
    }

    setValid(false);
  }, [amount, time]);

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

            <Stack>
              <Typography variant={'h4'}>{type} Wallet</Typography>
              <Typography mt={1} variant="p" color={'GrayText'}>
                To {type} please fill in the form below and Submit
              </Typography>
              {type === 'Deduct' && (
                <Alert sx={{ mt: '20px' }} severity="info">
                  Note: Wallet Deduction will be submitted to admin for approval.
                </Alert>
              )}

              <Stack
                direction={'row'}
                spacing={1}
                sx={{ my: '20px', bgcolor: 'whitesmoke', padding: 1, borderRadius: 1 }}
              >
                <Typography color={'black'}>User Balance:</Typography>
                <Typography color={Number(user?.balance) - Number(amount) < 1 ? 'red' : 'green'}>
                  {Number(user?.balance) - Number(amount)}
                </Typography>
              </Stack>
              <TextField
                id="outlined-required"
                autoComplete="off"
                label="Amount"
                value={amount}
                onChange={(event) => {
                  if (Number(event.target.value) || event.target.value === '') {
                    setAmount(event.target.value);
                  }
                }}
                helperText={Number(amount) > Number(user.balance) && 'Amount to deduct cannot be greater than user balance'}
              />
              <TextField
                sx={{ my: '20px' }}
                label="Reason"
                inputProps={{
                  autoComplete: 'new-password',
                }}
                value={time}
                autoComplete="chrome-off"
                onChange={(event) => setTime(event.target.value)}
              />
            </Stack>

            <Stack direction={'row'} sx={{ mt: '20px' }}>
              <Button fullWidth variant={'outlined'} onClick={onSuccess} sx={{ mr: '10px' }}>
                Cancel
              </Button>
              <Button
                variant={'contained'}
                onClick={handleUserWallet}
                // disabled={!valid || amount > user.balance}
                fullWidth
              >
                Submit
              </Button>
            </Stack>
          </>
        )}
      </Box>
    </>
  );
}
