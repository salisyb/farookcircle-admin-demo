import * as React from 'react';
import Avatar from '@mui/material/Avatar';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { Box } from '@mui/material';
import Iconify from '../../../components/Iconify';

export function WithdrawalRequest({ label, icon, sx, value, bottom }) {
  return (
    <Box sx={{height: '100%', padding: 1}}>
      <Card sx={{ ...sx }}>
        <CardContent>
          <Stack spacing={3}>
            <Stack direction="row" sx={{ alignItems: 'flex-start', justifyContent: 'space-between' }} spacing={3}>
              <Stack spacing={1}>
                <Typography color="text.secondary" variant="overline">
                  {label}
                </Typography>
                <Typography variant="h4">{value}</Typography>
              </Stack>
              <Avatar sx={{ backgroundColor: 'blue', height: '46px', width: '46px' }}>
                <Iconify icon={icon} />
              </Avatar>
            </Stack>
            {bottom}
          </Stack>
        </CardContent>
      </Card>
    </Box>
  );
}
