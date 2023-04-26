import React from 'react';
import { Box, Typography, Card } from '@mui/material';

export default function ProductItem({ title, imageUrl, amount }) {
  return (
    <Card
      sx={{ height: '140px', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center' }}
    >
      <Box height="40%" borderRadius={'100%'} overflow={'hidden'}>
        <img src={imageUrl} width={'100%'} height={'100%'} alt={'logo'} />
      </Box>
      <Typography fontSize={'14px'} textAlign={'center'}>{title}</Typography>
      <Typography>₦{amount}</Typography>
      <Typography fontSize={'10px'}>Click to edit Amount</Typography>
    </Card>
  );
}
