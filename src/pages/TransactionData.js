/* eslint-disable no-restricted-syntax */
/* eslint-disable no-nested-ternary */
/* eslint-disable camelcase */
import React, { useState, useCallback, useEffect } from 'react';
import { Box, Stack, Typography, CircularProgress, Card, Button, Divider, ButtonBase } from '@mui/material';

// import { LocalizationProvider, DateRangePicker } from '@mui/x-date-pickers-pro';
import { useLocation, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import moment from 'moment-timezone';
import { toast } from 'react-toastify';
import { getTransaction, refundUser } from '../api/transactions.api';
import { toWordUpperCase } from '../utils/helper';
import { ConfirmationAlert } from '../components/ConfirmationAlert';

const PaymentDetails = ({ data }) => (
  <Stack spacing={'15px'}>
    {Object.entries(data).map(([key, value]) => (
      <Stack key={key} direction={'row'} justifyContent={'space-between'} alignItems={'center'}>
        <Stack flex={1}>
          <Typography variant="body1" fontSize={16}>
            {toWordUpperCase(key)}
          </Typography>
        </Stack>
        <Stack flex={1}>
          <Typography variant="subtitle1" fontSize={16}>
            {toWordUpperCase(value)}
          </Typography>
        </Stack>
      </Stack>
    ))}
  </Stack>
);

const TransactionData = () => {
  const navigate = useNavigate();

  const { user } = useSelector((state) => state.auth);

  const [loading, setLoading] = useState(false);

  const [transaction, setTransaction] = useState(false);

  const [isAlertOpen, setIsAlertOpen] = useState(false);

  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const transactionId = queryParams.get('id');

  const handleRefundTransaction = async () => {
    setIsAlertOpen(false);
    setLoading(true);

    const request = await refundUser(transaction?.transaction_ref);
    if (request.ok) {
      handleGetTransaction();
      setLoading(false);
      return;
    }

    const error = request.data?.message ? request.data?.message : 'Unable to complete transaction refunding';
    toast.error(error);
    setLoading(false);
  };

  const handleGetTransaction = useCallback(async () => {
    setLoading(true);
    const request = await getTransaction(transactionId);
    if (request.ok) {
      setTransaction(request.data);
    }
    setLoading(false);
  }, [transactionId]);

  useEffect(() => {
    handleGetTransaction();
  }, [handleGetTransaction]);

  return (
    <>
      <Box sx={{ px: { xs: '0px', sm: '100px', md: '50px', lg: '50px' }, pb: '50px' }} minHeight={400}>
        <Stack minHeight={550}>
          {/* Page header  */}
          <Stack direction={'column'} spacing={'5px'}>
            <Typography fontSize={'20px'} fontWeight={'bold'}>
              Transaction Details
            </Typography>
            <Stack direction={'row'} spacing={1}>
              <Typography
                onClick={() => navigate(-1)}
                variant={'body2'}
                sx={{ cursor: 'pointer', ':hover': { color: '#3366FF' } }}
              >
                Transactions
              </Typography>
              <Typography color={'gray'}>{'>'}</Typography>
              <Typography variant={'body2'} color={'#3366FF'}>
                Transaction Data
              </Typography>
            </Stack>
          </Stack>

          <Card sx={{ mt: 2 }}>
            <Stack minHeight={550}>
              {loading ? (
                <Stack sx={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                  <CircularProgress size={'30px'} />
                  <Typography mt={3} variant={'subtitle1'}>
                    Please wait...
                  </Typography>
                </Stack>
              ) : (
                <Stack sx={{ flex: 1 }}>
                  {/* transaction header */}
                  <Stack
                    direction={'row'}
                    bgcolor={'lightblue'}
                    sx={{ width: '100%', padding: 3, justifyContent: 'space-between' }}
                  >
                    <Stack>
                      <Typography variant="body2" color={'gray'}>
                        Amount Paid
                      </Typography>
                      <Typography variant="h4">₦{transaction?.amount}</Typography>
                    </Stack>
                    {user?.isSuperUser &&
                      transaction?.transaction_type?.includes('PURCHASE') &&
                      transaction?.status?.toLowerCase() !== 'failed' && (
                        <Button sx={{ px: '40px' }} variant="contained" onClick={() => setIsAlertOpen(true)}>
                          Refund
                        </Button>
                      )}
                  </Stack>

                  {/* payment data  */}
                  <Stack flex={1} direction={{ xs: 'column', md: 'row' }}>
                    {/* left */}
                    <Stack sx={{ flex: 1, padding: 2, pb: 4 }}>
                      <Typography sx={{ mb: 2, mt: 2 }} variant={'h5'}>
                        Details
                      </Typography>
                      <PaymentDetails
                        data={{
                          'transaction ID': transaction?.id,
                          date: moment(transaction?.created_at).format('MMMM Do YYYY, h:mm:ss a'),
                          reference: transaction?.transaction_ref,
                          'transaction Type': transaction?.transaction_type,
                          amount: `₦${transaction?.amount}`,
                          status: transaction?.status,
                          'balance Before': `₦${transaction?.balance_before}`,
                          'balance After': `₦${transaction?.balance_after}`,
                          customer: transaction?.customer,
                        }}
                      />
                    </Stack>

                    {/* right */}
                    <Stack
                      sx={{
                        flex: 1,
                        padding: 2,
                        borderLeftWidth: 1,
                        borderLeftStyle: 'solid',
                        borderLeftColor: 'lightgray',
                        pb: 4,
                      }}
                    >
                      <Typography sx={{ mb: 2, mt: 2 }} variant={'h5'}>
                        Processor Details
                      </Typography>
                      <PaymentDetails
                        data={{
                          'transaction ID': transaction?.meta?.id,
                          date: moment(transaction?.meta?.created_date).format('MMMM Do YYYY, h:mm:ss a'),
                          reference: transaction?.meta?.Status,
                          'transaction Type': transaction?.transaction_type,
                          status: transaction?.meta?.Status,
                          amount: `₦${transaction?.meta?.amount}`,
                        }}
                      />
                      <Stack direction={'row'} mt={4}>
                        <Button variant="outlined">Refresh Processor Data</Button>
                      </Stack>
                    </Stack>
                  </Stack>
                </Stack>
              )}
            </Stack>
          </Card>
        </Stack>
        <ConfirmationAlert
          open={isAlertOpen}
          onClose={() => setIsAlertOpen(false)}
          onContinue={handleRefundTransaction}
          title={'Transaction Refunding'}
          description={'You are about to submit a transaction refund do you wish to continue?'}
        />
      </Box>
    </>
  );
};

export default TransactionData;
