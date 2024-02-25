/* eslint-disable no-nested-ternary */
import React from 'react';
import { Box, Typography, Stack, Avatar } from '@mui/material';
import moment from 'moment';
import Iconify from '../../components/Iconify';

export default function TransactionsCard({ data, onClick }) {
  const date = new Date(data.created_at);

  const getStatus = (status) => {
    switch (status) {
      case 'completed':
        return 'green';
      case 'pending':
        return 'orange';
      case 'failed':
        return 'red';
      default:
        return 'green';
    }
  };

  return (
    <Stack
      direction="row"
      justifyContent="space-between"
      alignItems={'center'}
      onClick={onClick}
      sx={{
        cursor: 'pointer',
        borderRightWidth: '3px',
        borderRightStyle: 'solid',
        borderRightColor: getStatus(data.status?.toLowerCase()),
        // borderLeftWidth: '3px',
        // borderLeftStyle: 'solid',
        // borderLeftColor: color,
        px: '10px',
      }}
    >
      <Avatar src={data.image} sx={{ bgcolor: '#3366FF' }}>
        {/* transaction icon  */}
        <Iconify icon={'icon-park-outline:transaction-order'} />
      </Avatar>
      <Stack flex={1} sx={{ px: '10px' }}>
        <Typography fontWeight={'bold'}>{data.name}</Typography>
        <Typography fontWeight={'light'}>{moment(date).format('MMMM d, YYYY')}</Typography>
      </Stack>
      <Stack>
        <Typography fontSize="18px" fontWeight={'bold'} textAlign={'right'}>
          ₦{data.amount}
        </Typography>
        <Typography fontSize="18px" fontWeight={'light'} textAlign={'right'}>
          {moment(date).format('h:mma')}
        </Typography>
      </Stack>
    </Stack>
  );
}
