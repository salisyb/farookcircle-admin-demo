/* eslint-disable jsx-a11y/label-has-associated-control */
/* eslint-disable camelcase */
import React, { useState } from 'react';
// material
import {
  Alert,
  Avatar,
  Box,
  Button,
  Card,
  CardContent,
  CircularProgress,
  Collapse,
  Container,
  Divider,
  FormControl,
  FormHelperText,
  Grid,
  IconButton,
  InputAdornment,
  InputBase,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  Stack,
  TextField,
  Tooltip,
  Typography,
} from '@mui/material';
// components

import { toast } from 'react-toastify';
import moment from 'moment-timezone';
import { useNavigate } from 'react-router-dom';
import { v4 as uuidv4 } from 'uuid';
import { useFormik } from 'formik';
import { useSelector } from 'react-redux';
import { LoadingButton } from '@mui/lab';
import { createTicket, getTicketByUser } from '../api/system.api';
import Iconify from '../components/Iconify';
import Page from '../components/Page';
import { createUserBankAccount, getBankList, getUserBankAccount, validateUser } from '../api/users.api';
import BasicModal from './components/Modal';
import UserOptionsCard from './components/User/UserOptionsCard';
import UserOptionsCardMessage from './components/User/UserOptionsCardMessage';
import UserOptionsCardEmail from './components/User/UserOptionsCardEmail';
import UserOptionsCardInfo from './components/User/UserOptionsCardInfo';
import ModalC from './components/CModal';
import UserOptionsCardDeduct from './components/User/UserOptionsCardDeduct';

const BANKS = [
  { id: 'moniepoint', name: 'Moniepoint Micro Finance' },
  { id: '9psb', name: '9PSB' },
  { id: 'palmpay', name: 'PALMPAY' },
];

export default function UsersManagement() {
  const navigate = useNavigate();

  const [loading, setLoading] = React.useState(false);
  const [selectedUser, setSelectedUser] = React.useState(null);
  const [search, setSearch] = React.useState('');
  const [tickets, setTickets] = React.useState([]);
  const [toggleFundUser, setToggleFundUser] = React.useState(false);
  const [toggleDeductUser, setToggleDeductUser] = React.useState(false);

  const [toggleSendUserMessage, setToggleSendUserMessage] = React.useState(false);
  const [toggleSendUserEmail, setToggleSendUserEmail] = React.useState(false);
  const [firstTime, setFirstTime] = useState(true);
  const [ticketLoading, setTicketLoading] = useState(false);
  const [bankLoading, setBankLoading] = useState(false);

  const [banks, setBanks] = useState([]);
  const [bankList, setBankList] = useState([]);

  const [walletActionType, setWalletActionType] = useState('');

  const [selectedFile, setSelectedFile] = React.useState(null);
  const [toggleCreateTicket, setToggleCreateTicket] = useState(false);

  const [toggleCreateBank, setToggleCreateBank] = useState(false);

  const [createTicketLoading, setCreateTicketLoading] = useState(false);

  const [disableAction, setDisableAction] = useState(false);

  const [modifyUser, setModifyUser] = React.useState(false);

  const { user } = useSelector((state) => state.auth);

  const handleSearch = async (e) => {
    e?.preventDefault();
    setSelectedUser(null);
    setTickets([]);
    setBanks([]);
    setLoading(true);

    const response = await validateUser(search);

    if (response.ok && response.data?.success) {
      const user = response.data?.data;

      setSelectedUser(user);
      setLoading(false);
      setDisableAction(false);

      if (bankList.length === 0) {
        handleGetBankList();
      }

      await Promise.all([handleGetTicket(user?.username), handleGetBankAccounts(user?.username)]);

      return;
    }

    toast.error('User not found');
    setLoading(false);
  };

  const getUerData = async () => {
    setDisableAction(true);
    const response = await validateUser(search);

    if (response.ok && response.data?.success) {
      setSelectedUser(response.data?.data);
    }
  };

  const handleGetTicket = async (username) => {
    setTicketLoading(true);
    const response = await getTicketByUser(username);
    if (response.ok) {
      setTickets(response.data?.filter((ticket) => ticket.is_closed === false));
    }
    setTicketLoading(false);
  };

  const handleGetBankAccounts = async (username) => {
    setBankLoading(true);
    const response = await getUserBankAccount(username);
    if (response.ok) {
      setBanks(response.data);
    }
    setBankLoading(false);
  };

  const handleGetBankList = async () => {
    const response = await getBankList();
    if (response.ok) {
      setBankList(response.data);
    }
  };

  const handleViewTicket = (ticketId) => navigate(`/dashboard/tickets/message?ticketId=${ticketId}`);
  const navigateUserTicketScreen = () => navigate(`/dashboard/tickets?user=${selectedUser?.username}`);
  const navigateUserTransactionScreen = () => navigate(`/dashboard/transaction?user=${selectedUser?.username}`);

  const handleCallUser = () => {
    window.open(`tel:${selectedUser?.username}`, '_blank');
  };

  const toggleAddFund = (type) => {
    setWalletActionType(type);
    setToggleFundUser(!toggleFundUser);
  };

  const toggleDeductFund = (type) => {
    setWalletActionType(type);
    setToggleDeductUser(!toggleDeductUser);
  };

  const toggleSendMessage = () => {
    setToggleSendUserMessage(!toggleSendUserMessage);
  };
  const toggleSendEmail = () => {
    setToggleSendUserEmail(!toggleSendUserEmail);
  };

  const toggleModifyUser = () => setModifyUser(!modifyUser);

  const handleUpdateUser = (data) => {
    setSelectedUser({ ...selectedUser, ...data });
    toggleModifyUser();
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
    const reference = uuidv4();
    const user_id = selectedUser?.username;
    formData.append('title', data.title);
    formData.append('descriptions', data.descriptions);
    formData.append('user_id', user_id);
    formData.append('reference', reference);
    formData.append('attended_by', user?.alias);
    formData.append('created_by', user?.alias);

    if (selectedFile) {
      formData.append('attachment', selectedFile);
    }

    setCreateTicketLoading(true);

    const request = await createTicket(formData);
    handleGetTicket();

    if (request.ok) {
      toast.success('You have successfully create new ticket');
      setCreateTicketLoading(false);
      setToggleCreateTicket(false);
      return;
    }

    setCreateTicketLoading(false);
    toast.error(request.data?.message ? request.data?.message : 'Unable to create your ticket');
  };

  const handleRemoveFile = () => {
    setSelectedFile(null);
  };

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    setSelectedFile(file);
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      // Add your search logic here
      console.log('Search initiated for:', search);
      // For example, you can set loading to true and initiate a search request
      setLoading(true);
      // Simulate a search request
      setTimeout(() => {
        setLoading(false);
        // Handle the search result here
        console.log('Search completed');
      }, 2000);
    }
  };

  const [formData, setFormData] = useState({
    bankId: '',
    identity: 'BVN',
    bankCode: '',
    accountNumber: '',
    bvn: '',
    nin: '',
  });

  const [errors, setErrors] = useState({});
  const [showSuccess, setShowSuccess] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    // Clear error when field is edited
    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: '',
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.bankId) {
      newErrors.bankId = 'Please select a bank';
    }

    if (formData.bankId === 'moniepoint' && formData.identity === 'BVN' && !formData.bvn) {
      newErrors.bvn = 'BVN is required for Moniepoint accounts';
    } else if (
      formData.bankId === 'moniepoint' &&
      formData.identity === 'BVN' &&
      formData.bvn &&
      !/^\d{11}$/.test(formData.bvn)
    ) {
      newErrors.bvn = 'BVN must be 11 digits';
    } else if (formData.bankId === 'moniepoint' && formData.identity === 'BVN' && !formData.bankCode) {
      newErrors.bvn = 'Please select a bank';
    } else if (formData.bankId === 'moniepoint' && formData.identity === 'BVN' && !formData.accountNumber) {
      newErrors.bvn = 'Please provider your account number';
    }

    if (formData.bankId === 'moniepoint' && formData.identity === 'NIN' && !formData.nin) {
      newErrors.bvn = 'NIN is required for Moniepoint accounts';
    } else if (
      formData.bankId === 'moniepoint' &&
      formData.identity === 'NIN' &&
      formData.nin &&
      !/^\d{11}$/.test(formData.nin)
    ) {
      newErrors.bvn = 'NIN must be 11 digits';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmitBank = async (e) => {
    e.preventDefault();

    if (validateForm()) {
      // If Moniepoint is not selected, remove BVN and NIN from submission
      const submitData = formData.bankId !== 'moniepoint' ? { ...formData, bvn: undefined, nin: undefined } : formData;
      setBankLoading(true);
      const response = await createUserBankAccount({ ...submitData, username: selectedUser?.username });
      if (response.ok) {
        toast.success('Bank account created successfully');
        setBanks([...banks, ...response.data]);
        setBankLoading(false);

        setToggleCreateBank(false);
      } else {
        const error = response.data?.message;
        toast.error(error);
        setBankLoading(false);
      }
    }
  };

  return (
    <Page title="User">
      {/* add fund modal */}
      <BasicModal isOpen={toggleFundUser} toggleOpen={toggleAddFund}>
        <UserOptionsCard
          user={selectedUser}
          closeModal={toggleAddFund}
          handleRefresh={getUerData}
          onSuccess={toggleAddFund}
          type={walletActionType}
        />
      </BasicModal>

      {/* deduct user modal  */}
      <BasicModal isOpen={toggleDeductUser} toggleOpen={toggleDeductFund}>
        <UserOptionsCardDeduct
          user={selectedUser}
          closeModal={toggleDeductFund}
          handleRefresh={getUerData}
          onSuccess={toggleDeductFund}
          type={walletActionType}
        />
      </BasicModal>

      {/* send message modal  */}
      <BasicModal isOpen={toggleSendUserMessage} toggleOpen={toggleSendMessage}>
        <UserOptionsCardMessage user={selectedUser} closeModal={toggleSendMessage} />
      </BasicModal>

      {/* send email modal  */}
      <BasicModal isOpen={toggleSendUserEmail} toggleOpen={toggleSendEmail}>
        <UserOptionsCardEmail user={selectedUser} closeModal={toggleSendEmail} />
      </BasicModal>

      {/* modify user information  */}
      <BasicModal isOpen={modifyUser} toggleOpen={toggleModifyUser}>
        <UserOptionsCardInfo user={selectedUser} closeModal={toggleModifyUser} onUserUpdate={handleUpdateUser} />
      </BasicModal>

      {/* create user new tickets  */}
      <ModalC
        isOpen={toggleCreateTicket}
        setOpen={() => {
          setToggleCreateTicket(!toggleCreateTicket);
        }}
      >
        <form onSubmit={formik.handleSubmit}>
          <Stack spacing={2}>
            <Stack alignItems={'flex-end'}>
              <IconButton onClick={() => setToggleCreateTicket(!toggleCreateTicket)}>
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
      </ModalC>

      {/* create user new tickets  */}
      <ModalC
        isOpen={toggleCreateBank}
        setOpen={() => {
          setToggleCreateBank(!toggleCreateBank);
        }}
      >
        <>
          <Stack spacing={3}>
            <Stack alignItems={'center'} justifyContent={'space-between'} direction={'row'}>
              <Typography variant="h6">Create Bank Account</Typography>

              <IconButton onClick={() => setToggleCreateBank(!toggleCreateBank)}>
                <Iconify icon={'eva:close-outline'} width={'20px'} height={'20px'} />
              </IconButton>
            </Stack>

            <Collapse in={showSuccess}>
              <Alert severity="success" onClose={() => setShowSuccess(false)} sx={{ mb: 2 }}>
                Bank account created successfully!
              </Alert>
            </Collapse>

            <FormControl fullWidth error={!!errors.bankId}>
              <InputLabel id="bank-select-label">Select Bank</InputLabel>
              <Select
                labelId="bank-select-label"
                id="bank-select"
                name="bankId"
                value={formData.bankId}
                label="Select Bank"
                onChange={handleChange}
              >
                {BANKS.map((bank) => (
                  <MenuItem key={bank.id} value={bank.id}>
                    {bank.name}
                  </MenuItem>
                ))}
              </Select>
              {errors.bankId && <FormHelperText>{errors.bankId}</FormHelperText>}
            </FormControl>

            {formData.bankId === 'moniepoint' && (
              <>
                <FormControl fullWidth error={!!errors.identity}>
                  <InputLabel id="identity-select-label">Select Identity</InputLabel>
                  <Select
                    labelId="identity-select-label"
                    id="identity-select"
                    name="identity"
                    value={formData.identity}
                    label="Select Identity"
                    onChange={handleChange}
                  >
                    {['BVN', 'NIN'].map((identity) => (
                      <MenuItem key={identity} value={identity}>
                        {identity}
                      </MenuItem>
                    ))}
                  </Select>
                  {errors.identity && <FormHelperText>{errors.identity}</FormHelperText>}
                </FormControl>
                {formData.identity === 'NIN' && (
                  <>
                    <TextField
                      fullWidth
                      label="NIN"
                      name="nin"
                      placeholder="Enter 11-digit NIN"
                      value={formData.nin}
                      onChange={handleChange}
                      type="number"
                      error={!!errors.nin}
                      helperText={errors.nin || 'NIN is required for Moniepoint'}
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <Iconify icon="mdi:id-card" width={20} height={20} />
                          </InputAdornment>
                        ),
                      }}
                    />
                  </>
                )}
                {formData.identity === 'BVN' && (
                  <>
                    <FormControl fullWidth error={!!errors.bankCode}>
                      <InputLabel id="identity-bank-select-label">Select Bank</InputLabel>
                      <Select
                        labelId="identity-bank-select-label"
                        id="identity-bank-select"
                        name="bankCode"
                        value={formData.bankCode}
                        label="Select Bank"
                        onChange={handleChange}
                      >
                        {bankList.map((bank) => (
                          <MenuItem key={bank.code} value={bank.code}>
                            {bank.name}
                          </MenuItem>
                        ))}
                      </Select>
                      {errors.bankCode && <FormHelperText>{errors.bankCode}</FormHelperText>}
                    </FormControl>
                    <TextField
                      fullWidth
                      label="Account number"
                      name="accountNumber"
                      placeholder="Your 10-digit Account Number"
                      type="number"
                      value={formData.accountNumber}
                      onChange={handleChange}
                      error={!!errors.accountNumber}
                      helperText={errors.accountNumber || 'Account number is required for Moniepoint'}
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <Iconify icon="mdi:bank-outline" width={20} height={20} />
                          </InputAdornment>
                        ),
                      }}
                    />
                    <TextField
                      fullWidth
                      label="BVN"
                      name="bvn"
                      placeholder="Enter 11-digit BVN"
                      type="number"
                      value={formData.bvn}
                      onChange={handleChange}
                      error={!!errors.bvn}
                      helperText={errors.bvn || 'BVN is required for Moniepoint'}
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <Iconify icon="mdi:id-card" width={20} height={20} />
                          </InputAdornment>
                        ),
                      }}
                    />
                  </>
                )}
              </>
            )}

            <Box sx={{ pt: 1 }}>
              <LoadingButton
                fullWidth
                disabled={bankLoading}
                loading={bankLoading}
                onClick={handleSubmitBank}
                variant="contained"
                size="large"
              >
                Create Bank Account
              </LoadingButton>
            </Box>
          </Stack>
        </>
      </ModalC>

      <Container>
        <Card sx={{ display: 'flex', width: '100%', padding: '20px', minHeight: '80vh' }}>
          {/* user details on the left and ticket list on the right  */}
          <Stack sx={{ flex: 1, height: '100%' }} direction={{ xs: 'column', md: 'row' }} spacing={2}>
            <Stack
              sx={{
                flex: 2,
                padding: '10px',
                height: 'calc(80vh - 20px)',
                overflowY: 'scroll',
                scrollbarWidth: 'none',
              }}
            >
              {/* search for user  */}
              <Stack direction={'row'} justifyContent={'space-between'} alignItems={'center'}>
                {!firstTime && (
                  <Paper
                    component="form"
                    sx={{
                      p: '2px 4px',
                      display: 'flex',
                      alignItems: 'center',
                      border: '1px solid #ADC8FF',
                      width: 400,
                    }}
                  >
                    <InputBase
                      sx={{ ml: 1, flex: 1 }}
                      placeholder="Enter user number"
                      inputProps={{ 'aria-label': 'search for user' }}
                      disabled={loading}
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                    />
                    {!loading && search && (
                      <IconButton
                        onClick={() => setSearch('')}
                        size={'20px'}
                        color="primary"
                        sx={{ p: '10px' }}
                        aria-label="directions"
                      >
                        <Iconify icon="streamline:delete-keyboard-solid" />
                      </IconButton>
                    )}
                    <Divider sx={{ height: 28, m: 0.5 }} orientation="vertical" />
                    <IconButton
                      disabled={loading}
                      onClick={handleSearch}
                      color="primary"
                      sx={{ p: '10px' }}
                      size="20px"
                      aria-label="directions"
                    >
                      {loading ? <CircularProgress size={'25px'} /> : <Iconify icon="mdi:search" />}
                    </IconButton>
                  </Paper>
                )}

                {selectedUser && (
                  <Stack direction={'row'} spacing={1}>
                    {user?.isSuperUser && (
                      <Button
                        size={'small'}
                        variant="text"
                        startIcon={<Iconify icon={'iconoir:edit'} />}
                        onClick={toggleModifyUser}
                      >
                        Modify
                      </Button>
                    )}
                    <Avatar sx={{ width: '40px', height: '40px' }} />
                  </Stack>
                )}
              </Stack>

              <>
                {/* user details and balance */}
                {selectedUser && (
                  <Typography variant="h6" sx={{ mt: '20px' }}>
                    Personal Information
                  </Typography>
                )}
                {selectedUser ? (
                  <Stack
                    mt={'10px'}
                    spacing={2}
                    direction={'row'}
                    alignItems={'flex-start'}
                    sx={{ justifyContent: 'space-between' }}
                  >
                    {/* user details  */}
                    <Stack spacing={0} flex={2}>
                      {/* Label and value */}
                      <Stack direction={'row'} alignItems={'center'} justifyContent={'space-between'}>
                        <Typography variant="body2">User ID</Typography>
                        <Typography variant="body1" fontWeight={'bold'}>
                          {selectedUser?.id ?? ''}
                        </Typography>
                      </Stack>
                      {/* Label and value */}
                      <Stack direction={'row'} alignItems={'center'} justifyContent={'space-between'}>
                        <Typography variant="body2">First Name</Typography>
                        <Typography variant="body1" fontWeight={'bold'}>
                          {selectedUser?.first_name}
                        </Typography>
                      </Stack>
                      {/* Label and value */}
                      <Stack direction={'row'} alignItems={'center'} justifyContent={'space-between'}>
                        <Typography variant="body2">Last Name</Typography>
                        <Typography variant="body1" fontWeight={'bold'}>
                          {selectedUser?.last_name}
                        </Typography>
                      </Stack>
                      {/* Label and value */}
                      <Stack direction={'row'} alignItems={'center'} justifyContent={'space-between'}>
                        <Typography variant="body2">Phone</Typography>
                        <Typography variant="body1" fontWeight={'bold'}>
                          {selectedUser?.username}
                        </Typography>
                      </Stack>
                      {/* Label and value */}
                      <Stack direction={'row'} alignItems={'center'} justifyContent={'space-between'}>
                        <Typography variant="body2">Email</Typography>
                        <Typography variant="body1" fontWeight={'bold'}>
                          {selectedUser?.email}
                        </Typography>
                      </Stack>
                      <Stack mt={'10px'} direction={'row'} alignItems={'center'} justifyContent={'space-between'}>
                        <Typography variant="body2">Date Joined</Typography>
                        <Typography variant="body1" fontWeight={'bold'}>
                          {moment(selectedUser?.date_joined).format('DD/MM/YYYY')}
                        </Typography>
                      </Stack>
                    </Stack>
                    {/* user balance  */}
                    <Stack flex={1} alignItems={'center'} spacing={1}>
                      <Stack
                        // bgcolor={'#3366FF'}
                        sx={{
                          px: '20px',
                          py: '10px',
                          border: '1px solid #3366FF',
                          borderRadius: '10px',
                          width: '100%',
                        }}
                      >
                        <Typography variant="body2">Balance:</Typography>
                        <Typography variant="h4" fontWeight={'bold'} color={'#40C450'}>
                          ₦{selectedUser?.balance}
                        </Typography>
                      </Stack>

                      <Stack
                        // bgcolor={'#3366FF'}
                        sx={{ px: '20px', py: '5px', border: '1px solid #3366FF', borderRadius: '10px', width: '100%' }}
                      >
                        <Typography variant="body2">Locked Balance:</Typography>
                        <Typography variant="h6" fontWeight={'bold'} color={'red'}>
                          ₦{selectedUser?.locked_balance}
                        </Typography>
                      </Stack>
                    </Stack>
                  </Stack>
                ) : (
                  <Box
                    minHeight={150}
                    display={'flex'}
                    flexDirection={'column'}
                    justifyContent={'center'}
                    alignItems={'center'}
                  >
                    {firstTime && (
                      <>
                        <Paper
                          component="form"
                          sx={{
                            p: '2px 4px',
                            display: 'flex',
                            alignItems: 'center',
                            border: '1px solid #ADC8FF',
                            width: 400,
                          }}
                        >
                          <InputBase
                            sx={{ ml: 1, flex: 1 }}
                            placeholder="Enter user number"
                            inputProps={{ 'aria-label': 'search for user' }}
                            disabled={loading}
                            onKeyPress={handleKeyPress}
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                          />
                          {!loading && search && (
                            <IconButton
                              onClick={() => setSearch('')}
                              size={'20px'}
                              color="primary"
                              sx={{ p: '10px' }}
                              aria-label="directions"
                            >
                              <Iconify icon="streamline:delete-keyboard-solid" />
                            </IconButton>
                          )}
                          <Divider sx={{ height: 28, m: 0.5 }} orientation="vertical" />
                          <IconButton
                            disabled={loading}
                            onClick={() => {
                              setFirstTime(false);
                              handleSearch();
                            }}
                            color="primary"
                            sx={{ p: '10px' }}
                            size="20px"
                            aria-label="directions"
                          >
                            {loading ? <CircularProgress size={'25px'} /> : <Iconify icon="mdi:search" />}
                          </IconButton>
                        </Paper>
                        <Typography variant="body2" sx={{ mt: '10px' }}>
                          Search to load profile
                        </Typography>
                      </>
                    )}
                  </Box>
                )}

                <Divider sx={{ mt: '10px' }} />

                {/* user banks  */}
                <Stack direction="row" justifyContent={'space-between'} spacing={2} mt={'20px'} alignItems={'center'}>
                  <Typography variant="h6">Bank Accounts</Typography>
                  <Button
                    startIcon={<Iconify icon="octicon:feed-plus-16" width={10} height={10} />}
                    variant="contained"
                    disabled={!selectedUser}
                    onClick={() => {
                      setToggleCreateBank(!toggleCreateBank);
                      setFormData({
                        bankId: '',
                        identity: 'BVN',
                        bankCode: '',
                        accountNumber: '',
                        bvn: '',
                        nin: '',
                      });
                    }}
                  >
                    Create Account
                  </Button>
                </Stack>

                {bankLoading && !banks.length && (
                  <Stack sx={{ justifyContent: 'center', alignItems: 'center', height: '200px' }}>
                    <CircularProgress />
                    <Typography variant="body2" sx={{ mt: '10px' }}>
                      Loading bank accounts...
                    </Typography>
                  </Stack>
                )}

                {!bankLoading && selectedUser && !banks.length && (
                  <Stack sx={{ justifyContent: 'center', alignItems: 'center', height: '200px' }}>
                    <Typography variant="body2" sx={{ mt: '10px' }}>
                      No bank account found
                    </Typography>
                  </Stack>
                )}

                <Grid container spacing={2} mt={'10px'}>
                  {/* Bank Account Card  */}
                  {banks.map((bank, index) => (
                    <Grid item xs={12} sm={6} key={index}>
                      <Card
                        sx={{
                          borderRadius: '16px',
                          boxShadow: '0 4px 24px rgba(0,0,0,0.06)',
                          background: 'white',
                          overflow: 'hidden',
                          position: 'relative',
                          border: '1px solid rgba(0,0,0,0.06)',
                        }}
                      >
                        <CardContent sx={{ p: 2.5 }}>
                          <Typography
                            variant="subtitle1"
                            component="div"
                            sx={{
                              fontWeight: 600,
                              fontSize: '0.95rem',
                              letterSpacing: '-0.01em',
                              color: 'rgba(0,0,0,0.87)',
                              mb: 2,
                              whiteSpace: 'nowrap',
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                            }}
                          >
                            {bank?.bank_name}
                          </Typography>

                          <Divider
                            sx={{
                              my: 1.5,
                              backgroundColor: 'rgba(0,0,0,0.06)',
                              height: '1px',
                            }}
                          />

                          <Box sx={{ mt: 1.5, mb: 1.5 }}>
                            <Typography
                              variant="caption"
                              component="div"
                              sx={{
                                color: 'rgba(0,0,0,0.6)',
                                fontSize: '0.7rem',
                                fontWeight: 500,
                                letterSpacing: '0.02em',
                                mb: 0.5,
                              }}
                            >
                              ACCOUNT NUMBER
                            </Typography>
                            <Typography
                              variant="body2"
                              component="div"
                              sx={{
                                fontFamily:
                                  '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif',
                                letterSpacing: '0.02em',
                                color: 'rgba(0,0,0,0.87)',
                                fontSize: '0.9rem',
                              }}
                            >
                              {bank.account_number}
                            </Typography>
                          </Box>

                          <Box sx={{ mt: 1.5 }}>
                            <Typography
                              variant="caption"
                              component="div"
                              sx={{
                                color: 'rgba(0,0,0,0.6)',
                                fontSize: '0.7rem',
                                fontWeight: 500,
                                letterSpacing: '0.02em',
                                mb: 0.5,
                              }}
                            >
                              ACCOUNT NAME
                            </Typography>
                            <Typography
                              variant="body2"
                              component="div"
                              sx={{
                                fontFamily:
                                  '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif',
                                color: 'rgba(0,0,0,0.87)',
                                fontSize: '0.9rem',
                              }}
                            >
                              {bank.account_name}
                            </Typography>
                          </Box>
                        </CardContent>
                      </Card>
                    </Grid>
                  ))}
                </Grid>
                <Divider sx={{ mt: '10px' }} />

                {/* user actions  */}
                <Typography variant="h6" sx={{ mt: '20px' }}>
                  Actions
                </Typography>

                <Stack direction="row" spacing={2} mt={'10px'}>
                  <Tooltip title="Fund user wallet">
                    <IconButton
                      disabled={!selectedUser || disableAction}
                      onClick={() => toggleAddFund('Fund')}
                      color="primary"
                      sx={{ p: '10px' }}
                      aria-label="directions"
                    >
                      <Iconify icon="octicon:feed-plus-16" width={40} height={40} />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="Deduct User Wallet">
                    <IconButton
                      disabled={!selectedUser || disableAction}
                      onClick={() => toggleDeductFund('Deduct')}
                      color="primary"
                      sx={{ p: '10px' }}
                      aria-label="directions"
                    >
                      <Iconify icon="zondicons:minus-solid" width={40} height={40} />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="Direct call">
                    <IconButton
                      disabled={!selectedUser || disableAction}
                      onClick={handleCallUser}
                      color="primary"
                      sx={{ p: '10px' }}
                      aria-label="directions"
                    >
                      <Iconify icon="pepicons-print:phone" width={40} height={40} />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="Send direct message to user">
                    <IconButton
                      disabled={!selectedUser || disableAction}
                      onClick={toggleSendMessage}
                      color="primary"
                      sx={{ p: '10px' }}
                      aria-label="directions"
                    >
                      <Iconify icon="ant-design:message-twotone" width={40} height={40} />
                    </IconButton>
                  </Tooltip>

                  <Tooltip title="Send Email to user">
                    <IconButton
                      disabled={!selectedUser || disableAction}
                      onClick={toggleSendEmail}
                      color="primary"
                      sx={{ p: '10px' }}
                      aria-label="directions"
                    >
                      <Iconify icon="ic:twotone-mail" width={40} height={40} />
                    </IconButton>
                  </Tooltip>
                </Stack>

                <Divider sx={{ mt: '10px' }} />

                <Typography variant="h6" sx={{ mt: '20px' }}>
                  History
                </Typography>

                <Stack direction="row" spacing={2} mt={'10px'}>
                  <Button
                    startIcon={<Iconify icon="icon-park-twotone:transaction" />}
                    variant="outlined"
                    fullWidth
                    color="primary"
                    onClick={navigateUserTransactionScreen}
                    disabled={!selectedUser}
                  >
                    Transaction
                  </Button>
                  <Button
                    startIcon={<Iconify icon="ph:ticket-duotone" />}
                    onClick={navigateUserTicketScreen}
                    variant="outlined"
                    fullWidth
                    color="primary"
                    disabled={!selectedUser}
                  >
                    Tickets
                  </Button>
                </Stack>
              </>
            </Stack>

            {/* ticket container  */}
            <Stack
              spacing={2}
              sx={{
                display: { xs: 'none', md: 'flex' },
                flex: 1,
                padding: '10px',

                borderLeftWidth: 1,
                borderLeftColor: '#3366FF',
                borderLeftStyle: 'solid',
              }}
            >
              {/* Ticket title and create button  */}
              <Stack direction="column" spacing={1}>
                <Stack direction="row" justifyContent="space-between">
                  <Typography variant="h6">Tickets</Typography>
                  {selectedUser && (
                    <Button
                      size={'small'}
                      variant="outlined"
                      endIcon={<Iconify icon="mdi:plus" />}
                      onClick={() => setToggleCreateTicket(!toggleCreateTicket)}
                    >
                      New Ticket
                    </Button>
                  )}
                </Stack>
              </Stack>

              {/* ticket list  */}
              <Stack
                direction="column"
                sx={{ overflow: 'scroll', height: 'calc(80vh - 40px)', scrollbarWidth: 'none' }}
              >
                {selectedUser && !ticketLoading && !tickets.length && (
                  <Typography variant="body2" sx={{ mt: '10px', textAlign: 'center' }}>
                    No ticket found
                  </Typography>
                )}
                {ticketLoading && (
                  <Stack
                    sx={{
                      display: 'flex',
                      justifyContent: 'center',
                      alignItems: 'center',
                      height: '100px',
                    }}
                  >
                    <CircularProgress size={32} />
                  </Stack>
                )}
                {tickets.map((ticket) => (
                  <Stack
                    onClick={() => handleViewTicket(ticket.id)}
                    key={ticket.id}
                    direction="row"
                    spacing={1}
                    sx={{
                      paddingX: '10px',
                      paddingY: '10px',
                      borderBottom: '1px solid #ADC8FF',
                      cursor: 'pointer',
                      '&:hover': {
                        backgroundColor: 'action.hover',
                      },
                    }}
                  >
                    <Avatar sx={{ bgcolor: '#ADC8FF' }}>
                      <Avatar sx={{ width: 35, height: 35, bgcolor: 'white', color: '#3366FF' }}>
                        {ticket?.is_closed ? (
                          <Iconify icon="bxs:message-check" />
                        ) : (
                          <Iconify icon="bxs:message-error" />
                        )}
                      </Avatar>
                    </Avatar>
                    <Stack>
                      <Typography variant="subtitle2"># {ticket?.id} Ticket</Typography>
                      <Typography variant="body2">This is a ticket description</Typography>
                    </Stack>
                  </Stack>
                ))}
              </Stack>
            </Stack>
          </Stack>
        </Card>
      </Container>
    </Page>
  );
}
