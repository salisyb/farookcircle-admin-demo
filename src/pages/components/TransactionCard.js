import React from 'react';
import { Box, Typography, Stack, Avatar } from '@mui/material';

export default function TransactionsCard({ avatarUrl, name, description, amount, onClick }) {
    return (
        <Stack direction="row" justifyContent="space-between" alignItems={'center'} sx={{ cursor: 'pointer' }} onClick={onClick}>
            <Avatar src={avatarUrl}>...</Avatar>
            <Stack flex={1} sx={{ px: '10px' }}>
                <Typography>{name}</Typography>
                <Typography fontWeight={'bold'}>{description}</Typography>
            </Stack>
            <Typography fontSize="18px" fontWeight={'bold'}>
                ₦{amount}
            </Typography>
        </Stack>
    );
}
