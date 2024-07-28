/* eslint-disable jsx-a11y/label-has-associated-control */
import React, { useCallback, useEffect, useState } from 'react';
import {
  Alert,
  Box,
  Button,
  CircularProgress,
  FormControl,
  IconButton,
  InputAdornment,
  InputLabel,
  MenuItem,
  Select,
  Stack,
  TextField,
  Typography,
} from '@mui/material';

import { useSelector } from 'react-redux';
import Iconify from '../../../components/Iconify';
import { agentDeductUser, checkDeductionDetail } from '../../../api/users.api';

export default function UserOptionsCardDeduct({ user, handleRefresh, type, onSuccess }) {
  // state

  const loggedUser = useSelector((state) => state.auth.user);

  const [amount, setAmount] = React.useState('');
  const [loading, setLoading] = React.useState(false);
  const [status, setStatus] = React.useState(false);
  const [statusMessage, setStatusMessage] = React.useState();
  const [valid, setValid] = React.useState(false);
  const [show, setShow] = React.useState(false);

  const [isLoading, setIsLoading] = React.useState(false);
  const [time, setTime] = React.useState('');
  const [other, setOther] = React.useState('');

  const [details, setDetails] = useState(null);

  const [reference, setReference] = useState('');

  const handleUserWallet = async () => {
    setShow(true);
    setLoading(true);

    const response = await agentDeductUser({
      agent: user?.username,
      amount,
      reason: time,
      transaction_ref: reference,
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

  const handleGetTransactionDetail = useCallback(async () => {
    setIsLoading(true);
    const request = await checkDeductionDetail({ reference, username: user?.username });
    if (request.ok) {
      setDetails(request.data);
    }
    setIsLoading(false);
  }, [reference, user?.username]);

  return (
    <Box sx={{ position: 'relative', width: '100%', height: '100%' }}>
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

        <Stack direction={'row'} spacing={1} sx={{ my: '20px', bgcolor: 'whitesmoke', padding: 1, borderRadius: 1 }}>
          <Typography color={'black'}>User Balance:</Typography>
          <Typography color={Number(user?.balance) - Number(amount) < 1 ? 'red' : 'green'}>
            {Number(user?.balance) - Number(amount)}
          </Typography>
        </Stack>

        <FormControl fullWidth sx={{ mt: '20px' }}>
          <InputLabel id="demo-simple-select-label">Reason</InputLabel>
          <Select
            value={time}
            onChange={(e) => {
              setTime(e.target.value);
              setReference('');
              setDetails(null);

              if (e.target.value === 'WRONG_OWNER' && details?.history?.amount) {
                setAmount(Number(details?.history?.amount));
              } else {
                setAmount('');
              }
            }}
            labelId="demo-simple-select-label"
            id="demo-simple-select"
            label="Reason"
          >
            <MenuItem value={'OVERFUNDING'}>Overfunding</MenuItem>
            <MenuItem value={'WRONG_OWNER'}>Wrong Owner</MenuItem>
            {loggedUser?.isSuperUser && <MenuItem value={'OTHER'}>Other</MenuItem>}
          </Select>
        </FormControl>

        {time && (
          <>
            {time !== 'OTHER' && (
              <TextField
                sx={{ mt: '20px' }}
                id="outlined-required"
                autoComplete="off"
                label="Reference"
                value={reference}
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="start">
                      {isLoading ? (
                        <CircularProgress size={'20px'} />
                      ) : (
                        <IconButton onClick={handleGetTransactionDetail}>
                          <Iconify icon={'icons8:chevron-right-round'} />
                        </IconButton>
                      )}
                    </InputAdornment>
                  ),
                }}
                onChange={(event) => setReference(event.target.value)}
                helperText={'Please provide reference for the transaction'}
              />
            )}

            {time === 'OTHER' && (
              <TextField
                sx={{ mt: '20px' }}
                label="Reason"
                inputProps={{
                  autoComplete: 'new-password',
                }}
                value={other}
                autoComplete="chrome-off"
                onChange={(event) => setOther(event.target.value)}
              />
            )}

            {time !== 'WRONG_OWNER' && (
              <>
                <TextField
                  sx={{ mt: '20px' }}
                  id="outlined-required"
                  autoComplete="off"
                  disabled={time === 'OVERFUNDING' && !details?.history}
                  label="Amount"
                  value={amount}
                  onChange={(event) => {
                    if (Number(event.target.value) || event.target.value === '') {
                      setAmount(event.target.value);
                    }
                  }}
                  helperText={
                    Number(amount) > Number(user.balance) && 'Amount to deduct cannot be greater than user balance'
                  }
                />
                {details && !details?.history && (
                  <Typography variant="caption" color={'red'}>
                    Unable to resolve the transaction using this reference
                  </Typography>
                )}
              </>
            )}

            {time === 'WRONG_OWNER' && details?.history && (
              <Alert sx={{ mt: '20px' }} severity="error">
                Note: transaction amount {details?.history?.amount} will be deducted from user wallet
              </Alert>
            )}

            {time === 'OVERFUNDING' && details?.history && (
              <Alert sx={{ mt: '20px' }} severity="error">
                Note: You can only deduct less than the transaction amount {details?.history?.amount}
              </Alert>
            )}
          </>
        )}
      </Stack>

      <Stack direction={'row'} sx={{ mt: '20px' }}>
        <Button fullWidth variant={'outlined'} onClick={onSuccess} sx={{ mr: '10px' }}>
          Cancel
        </Button>
        <Button variant={'contained'} onClick={handleUserWallet} disabled={!!(time !== 'OTHER' && !details)} fullWidth>
          Submit
        </Button>
      </Stack>
    </Box>
  );
}
