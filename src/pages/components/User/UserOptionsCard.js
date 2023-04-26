import React from 'react';
import {
  Box,
  Button,
  CircularProgress,
  FormControl,
  FormControlLabel,
  OutlinedInput,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import { useDispatch, useSelector } from 'react-redux';
import { fundUsersWallet, agentFundUserWallet, validateUser } from '../../../api/users.api';
import { getUsersWallet } from '../../../store/actions/users';

export default function ({ userId, closeModal }) {
  const dispatch = useDispatch();
  const { users } = useSelector((state) => state.users);

  const user = users.find((user) => user.username === userId);

  // state
  const [fundUser, setFundUser] = React.useState(false);
  const [amount, setAmount] = React.useState('');
  const [loading, setLoading] = React.useState(false);
  const [status, setStatus] = React.useState(false);
  const [statusMessage, setStatusMessage] = React.useState();
  const [valid, setValid] = React.useState(false);
  const [show, setShow] = React.useState(false);
  const [type, setType] = React.useState('');
  const [balance, setBalance] = React.useState('');
  const [isLoading, setIsLoading] = React.useState(false);
  const [time, setTime] = React.useState('');
  const [from, setFrom] = React.useState('');

  const handleUserWallet = async () => {
    setShow(true);
    setLoading(true);

    const response = await agentFundUserWallet({ agent: userId, amount, from, time });

    // agent, from, amount, time,

    if (response.ok) {
      setLoading(false);
      setStatus(true);
      setStatusMessage(response.data.message);
      dispatch(getUsersWallet());
      return;
    }

    setLoading(false);
    setStatus(false);
    setStatusMessage(response.data.message);
  };

  const handleValidateUser = async () => {
    setIsLoading(true);
    const request = await validateUser(userId);
    if (request.ok) {
      setBalance(request.data.data.balance);
      setIsLoading(false);
    }
  };

  React.useEffect(() => {
    handleValidateUser();
  }, [userId]);

  React.useEffect(() => {
    if (Number(amount) > 5 && from && time) {
      setValid(true);
      return;
    }

    setValid(false);
  }, [amount, from, time]);

  return (
    <>
      <Box sx={{ position: 'relative', width: '100%', height: '100%' }}>
        <>
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

                      <Button variant="outlined" onClick={status ? closeModal : () => setShow(false)}>
                        Ok
                      </Button>
                    </>
                  )}
                </Box>
              )}
              <Typography>Available Balance is: {balance}</Typography>

              {fundUser && (
                <Stack>
                  <TextField
                    sx={{ my: '20px' }}
                    id="outlined-required"
                    label="Amount"
                    value={amount}
                    onChange={(event) => {
                      if (Number(event.target.value) || event.target.value === '') {
                        setAmount(event.target.value);
                      }
                    }}
                  />
                  <TextField
                    sx={{ my: '20px' }}
                    id="outlined-required"
                    label="From Account"
                    value={from}
                    onChange={(event) => setFrom(event.target.value)}
                  />
                  <TextField
                    sx={{ my: '20px' }}
                    id="outlined-required"
                    label="Time Reference"
                    value={time}
                    onChange={(event) => setTime(event.target.value)}
                  />
                </Stack>
              )}
              <Box sx={{ mt: '20px' }}>
                {fundUser && (
                  <>
                    <Button
                      variant={'contained'}
                      onClick={() => {
                        setFundUser(false);
                        setAmount('');
                      }}
                      sx={{ mr: '10px' }}
                      color="error"
                    >
                      Cancel
                    </Button>
                    <Button
                      variant={'contained'}
                      color={type === 'Fund' ? 'success' : 'error'}
                      onClick={handleUserWallet}
                      disabled={!valid}
                    >
                      {type} Agent Wallet
                    </Button>
                  </>
                )}
                {!fundUser && (
                  <>
                    <Button
                      variant={'contained'}
                      onClick={() => {
                        setFundUser(true);
                        setType('Fund');
                      }}
                      color="success"
                    >
                      Fund Agent Wallet
                    </Button>

                    {/* <Button
                variant={'contained'}
                onClick={() => {
                  setFundUser(true);
                  setType('Deduct');
                }}
                disabled={fundUser && !valid}
                sx={{ ml: '5px' }}
                color="error"
              >
                Deduct Agent Wallet
              </Button> */}
                  </>
                )}
              </Box>
            </>
          )}
        </>
      </Box>
    </>
  );
}
