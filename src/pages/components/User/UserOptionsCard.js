/* eslint-disable jsx-a11y/label-has-associated-control */
import React, { useState } from 'react';
import {
  Box,
  Button,
  Checkbox,
  CircularProgress,
  FormControl,
  FormControlLabel,
  IconButton,
  OutlinedInput,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import { useDispatch, useSelector } from 'react-redux';
import { useFormik } from 'formik';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { LoadingButton } from '@mui/lab';

import { DemoContainer } from '@mui/x-date-pickers/internals/demo';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';

import moment from 'moment-timezone';
import Iconify from '../../../components/Iconify';
import { fundUsersWallet, agentFundUserWallet, validateUser } from '../../../api/users.api';
import { createTicket as createUserTicket } from '../../../api/system.api';

export default function UserOptionsCard({ user, handleRefresh, closeModal, onSuccess }) {
  // state
  const [fundUser, setFundUser] = React.useState(false);

  const [amount, setAmount] = React.useState('');
  const [loading, setLoading] = React.useState(false);
  const [status, setStatus] = React.useState(false);
  const [statusMessage, setStatusMessage] = React.useState();
  const [valid, setValid] = React.useState(false);
  const [show, setShow] = React.useState(false);

  const type = 'Fund';

  const [isLoading, setIsLoading] = React.useState(false);
  const [time, setTime] = React.useState('');
  const [pin, setPin] = React.useState('');
  const [fakePin, setFakingPin] = React.useState('');
  const [resolution, setResolution] = useState(false);
  const [ticketRef, setTicketRef] = useState('');

  const handleUserWallet = async () => {
    setShow(true);
    setLoading(true);

    const response = await agentFundUserWallet({
      agent: user?.username,
      amount,
      reference: time,
      pin,
      pending_deposit: resolution,
      payment_date: ticketRef,
    });
    // agent, from, amount, time,
    if (response.ok && response.data?.success) {
      setLoading(false);
      setStatus(true);
      handleRefresh();
      setStatusMessage(response.data.message);
      return;
    }
    setLoading(false);
    setStatus(false);

    setStatusMessage(response.data.message);
  };

  const handleToggleShow = () => {
    console.log(status);
    if (status) {
      onSuccess();
      return;
    }

    setShow(false);
  };

  React.useEffect(() => {
    if (amount !== '' && time && pin) {
      if (resolution && ticketRef === '') {
        setValid(false);
        return;
      }
      setValid(true);
      return;
    }

    setValid(false);
  }, [amount, time, pin, resolution, ticketRef]);

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
              <TextField
                sx={{ my: '20px' }}
                id="outlined-required"
                autoComplete="off"
                label="Amount"
                value={amount}
                onChange={(event) => {
                  if (Number(event.target.value) || event.target.value === '' || event.target.value === '-') {
                    setAmount(event.target.value);
                  }
                }}
              />
              <TextField
                sx={{ my: '20px' }}
                label="Reference"
                inputProps={{
                  autoComplete: 'new-password',
                }}
                value={time}
                autoComplete="chrome-off"
                onChange={(event) => setTime(event.target.value)}
              />
              <FormControlLabel
                required
                control={<Checkbox />}
                label="Is Pending"
                onChange={(event) => setResolution(event.target.checked)}
              />
              {resolution && (
                <LocalizationProvider dateAdapter={AdapterDayjs}>
                  <DemoContainer components={['DatePicker']}>
                    <DatePicker label="Payment Date" onChange={(e) => setTicketRef(e.format('YYYY-MM-DD'))} />
                  </DemoContainer>
                </LocalizationProvider>
              )}
              <TextField
                sx={{ my: '20px' }}
                label="Your PIN"
                value={fakePin}
                type="text"
                autoComplete="off"
                onChange={(event) => {
                  if (event.target.value.length < pin.length) {
                    // remove last character
                    setPin(pin.slice(0, -1));
                  } else {
                    setPin(pin + event.target.value[event.target.value.length - 1]);
                  }
                  setFakingPin(event.target.value.replace(/./g, '*'));
                }}
              />
            </Stack>

            <Box sx={{ mt: '20px' }}>
              <>
                <Button variant={'contained'} onClick={onSuccess} sx={{ mr: '10px' }} color="error">
                  Cancel
                </Button>
                <Button
                  variant={'contained'}
                  color={type === 'Fund' ? 'success' : 'error'}
                  onClick={handleUserWallet}
                  disabled={!valid}
                >
                  Fund Agent Wallet
                </Button>
              </>
            </Box>
          </>
        )}
      </Box>
    </>
  );
}
