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
import Iconify from '../../../components/Iconify';
import { fundUsersWallet, agentFundUserWallet, validateUser } from '../../../api/users.api';
import { createTicket as createUserTicket } from '../../../api/system.api';

export default function ({ userId, closeModal }) {
  const dispatch = useDispatch();
  const { users } = useSelector((state) => state.users);
  const staff = useSelector((state) => state.auth.user);

  const user = users.find((user) => user.username === userId);
  const navigate = useNavigate();

  // state
  const [fundUser, setFundUser] = React.useState(false);
  const [createTicket, setCreateTicket] = React.useState(false);
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
  const [pin, setPin] = React.useState('');
  const [resolution, setResolution] = useState(false);
  const [ticketRef, setTicketRef] = useState('');
  const [selectedFile, setSelectedFile] = React.useState(null);
  const [createTicketLoading, setCreateTicketLoading] = useState(false);

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    setSelectedFile(file);
  };

  const handleRemoveFile = () => {
    setSelectedFile(null);
  };

  const handleUserWallet = async () => {
    setShow(true);
    setLoading(true);
    const response = await agentFundUserWallet({ agent: userId, amount, time, pin, resolution, ticket_ref: ticketRef });
    // agent, from, amount, time,
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

  const handleRouteToTicketMessage = (ticketId) => {
    navigate(`/dashboard/ticket/message?ticketId=${ticketId}`);
  };

  const formik = useFormik({
    initialValues: {
      title: '',
      descriptions: '',
    },
    onSubmit: (values) => {
      handleCreateUserTicket(values);
    },
    validate: (values) => {
      const errors = {};
      if (!values.title.trim()) {
        errors.title = 'Title is required';
      }
      if (!values.descriptions.trim()) {
        errors.descriptions = 'Descriptions are required';
      }
      return errors;
    },
  });

  const handleCreateUserTicket = async (data) => {
    const formData = new FormData();

    formData.append('title', data.title);
    formData.append('descriptions', data.descriptions);
    formData.append('user_id', user?.username);
    formData.append('attended_by', staff?.username);
    formData.append('created_by', staff?.username);

    if (selectedFile) {
      formData.append('attachment', selectedFile);
    }

    const request = await createUserTicket(formData);
    if (request.ok) {
      toast.success('You have successfully create new ticket');
      handleRouteToTicketMessage(request.data?.id);
      setCreateTicketLoading(false);
      closeModal();
      return;
    }

    setCreateTicketLoading(false);
    toast.error(request.data?.message ? request.data?.message : 'Unable to create your ticket');
  };

  const handleViewUserTicket = () => {
    navigate(`/dashboard/ticket?userId=${user?.username}`);
  };

  return (
    <>
      <Box sx={{ position: 'relative', width: '100%', height: '100%' }}>
        {createTicket ? (
          <>
            <form onSubmit={formik.handleSubmit}>
              <Stack spacing={2}>
                <Stack direction={'row'} alignItems={'center'} justifyContent={'space-between'}>
                  <Typography>Create Ticket for user</Typography>
                  <IconButton onClick={() => setCreateTicket(false)}>
                    <Iconify icon={'eva:close-outline'} width={'20px'} height={'20px'} />
                  </IconButton>
                </Stack>

                <FormControl>
                  <TextField
                    id="outlined-basic"
                    label="Ticket Title"
                    variant="outlined"
                    name={'title'}
                    value={formik.values.title}
                    onChange={formik.handleChange}
                    error={formik.touched.title && Boolean(formik.errors.title)}
                    helperText={formik.touched.title && formik.errors.title}
                  />
                </FormControl>

                <FormControl>
                  <TextField
                    id="outlined-multiline-static"
                    label="Ticket Descriptions"
                    multiline
                    rows={4}
                    name={'descriptions'}
                    value={formik.values.descriptions}
                    onChange={formik.handleChange}
                    error={formik.touched.descriptions && Boolean(formik.errors.descriptions)}
                    helperText={formik.touched.descriptions && formik.errors.descriptions}
                  />
                </FormControl>

                {/* File Input for Attachment */}
                <input
                  type="file"
                  accept="image/*, application/pdf"
                  style={{ display: 'none' }}
                  id="attachmentInput"
                  onChange={handleFileChange}
                />
                <label htmlFor="attachmentInput">
                  <LoadingButton variant="contained" component="span">
                    Attach File
                  </LoadingButton>
                </label>

                {/* Display Attachment Preview */}
                {selectedFile && (
                  <Stack alignItems={'flex-start'}>
                    <Typography variant="subtitle1" fontWeight="bold">
                      Attachment Preview:
                    </Typography>
                    {selectedFile.type.startsWith('image/') ? (
                      <>
                        <IconButton onClick={handleRemoveFile} size="small">
                          <Iconify icon={'eva:close-outline'} width={'30px'} height={'30px'} />
                        </IconButton>
                        <img
                          src={URL.createObjectURL(selectedFile)}
                          alt="Attachment Preview"
                          style={{ width: '100px', height: '100px' }}
                        />
                      </>
                    ) : (
                      <Typography>Attachment type: {selectedFile.type}</Typography>
                    )}
                  </Stack>
                )}

                <LoadingButton
                  disabled={createTicketLoading}
                  loading={createTicketLoading}
                  type="submit"
                  variant="contained"
                >
                  Create Ticket
                </LoadingButton>
              </Stack>
            </form>
          </>
        ) : (
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
                        if (Number(event.target.value) || event.target.value === '' || event.target.value === '-') {
                          setAmount(event.target.value);
                        }
                      }}
                    />
                    <TextField
                      sx={{ my: '20px' }}
                      id="outlined-required"
                      label="Reference"
                      value={time}
                      onChange={(event) => setTime(event.target.value)}
                    />
                    <FormControlLabel
                      required
                      control={<Checkbox />}
                      label="Is Resolution"
                      onChange={(event) => setResolution(event.target.checked)}
                    />
                    {resolution && (
                      <TextField
                        sx={{ my: '20px' }}
                        id="outlined-required"
                        label="Ticket Reference"
                        value={ticketRef}
                        onChange={(event) => setTicketRef(event.target.value)}
                      />
                    )}
                    <TextField
                      sx={{ my: '20px' }}
                      id="outlined-required"
                      label="Your PIN"
                      value={pin}
                      onChange={(event) => setPin(event.target.value)}
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
                    <Stack spacing={1}>
                      <Button
                        variant={'contained'}
                        onClick={() => {
                          setFundUser(true);
                          setType('Fund');
                        }}
                        color="success"
                      >
                        Fund Agent Wallet
                      </Button>{' '}
                      <Button
                        variant={'contained'}
                        onClick={() => {
                          setCreateTicket(true);
                        }}
                      >
                        Create Ticket for user
                      </Button>
                      {/* <Button variant={'contained'} onClick={handleViewUserTicket}>
                        View User Ticket
                      </Button> */}
                    </Stack>
                  )}
                </Box>
              </>
            )}
          </>
        )}
      </Box>
    </>
  );
}
