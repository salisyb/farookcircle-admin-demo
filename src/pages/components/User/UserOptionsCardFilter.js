import React from 'react';
import {
  Box,
  Button,
  CircularProgress,
  FormControl,
  FormControlLabel,
  OutlinedInput,
  TextField,
  Typography,
} from '@mui/material';
import { useDispatch, useSelector } from 'react-redux';
import { fundUsersWallet } from '../../../api/users.api';
import { getUsersWallet } from '../../../store/actions/users';

export default function ({ userId, closeModal }) {
  const dispatch = useDispatch();
  const { users, usersWallet } = useSelector((state) => state.users);

  const wallet = usersWallet.find((wallet) => wallet.entityTypeId === userId);
  const user = users.find((user) => user.id === userId);

  // state
  const [fundUser, setFundUser] = React.useState(false);
  const [amount, setAmount] = React.useState('');
  const [loading, setLoading] = React.useState(false);
  const [status, setStatus] = React.useState(false);
  const [statusMessage, setStatusMessage] = React.useState();
  const [valid, setValid] = React.useState(false);
  const [show, setShow] = React.useState(false);
  const [type, setType] = React.useState('');

  const handleUserWallet = async () => {
    setShow(true);
    setLoading(true);

    const response = await fundUsersWallet(userId, { amount, type: type.toLowerCase() });

    if (response.ok) {
      setLoading(false);
      setStatus(true);
      setStatusMessage(response.data.message);
      
      return;
    }

    setLoading(false);
    setStatus(false);
    setStatusMessage(response.data.message);
  };

  React.useEffect(() => {
    if (Number(amount) > 5) {
      setValid(true);
      return;
    }

    setValid(false);
  }, [amount]);

  return (
    <>
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

                <Button variant="outlined" onClick={status ? closeModal : () => setShow(false)}>
                  Ok
                </Button>
              </>
            )}
          </Box>
        )}
        <Typography>Available Balance is: {wallet.availableBalance}</Typography>

        {fundUser && (
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

              <Button
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
              </Button>
            </>
          )}
        </Box>
      </Box>
    </>
  );
}
