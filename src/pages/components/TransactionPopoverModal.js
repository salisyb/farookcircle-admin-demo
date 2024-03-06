import * as React from 'react';
import Popover from '@mui/material/Popover';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import { FormControl, MenuItem, Select, Stack, TextField } from '@mui/material';
import Iconify from '../../components/Iconify';

export default function TransactionPopoverModal({ onApplyFilter }) {
  const [anchorEl, setAnchorEl] = React.useState(null);

  const [formData, setFormData] = React.useState({
    id: '',
    customer: '',
    transaction_ref: '',
    status: '',
    date: '',
  });

  const handleSetFormData = (event) => {
    setFormData({ ...formData, [event.target.name]: event.target.value });
  };

  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const applyFilter = () => {
    let payload = {};
    Object.entries(formData).forEach(([key, value]) => {
      if (value !== '') {
        payload = { ...payload, [key]: value };
      }
    });

    onApplyFilter(payload);
    handleClose();
  };

  const open = Boolean(anchorEl);
  const id = open ? 'simple-popover' : undefined;

  return (
    <div>
      <Button
        startIcon={<Iconify icon={'octicon:filter-16'} />}
        aria-describedby={id}
        variant={'outlined'}
        onClick={handleClick}
      >
        Filter
      </Button>
      <Popover
        id={id}
        open={open}
        anchorEl={anchorEl}
        onClose={handleClose}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'left',
        }}
      >
        <Stack sx={{ padding: '10px', width: '400px' }} spacing={'10px'}>
          <Stack direction={'row'}>
            <Typography sx={{ p: 2 }}>Filter Transactions</Typography>
          </Stack>

          <TextField
            id="outlined-text-input"
            name="id"
            value={formData.id}
            onChange={handleSetFormData}
            label="Transaction ID"
            type="text"
            size="small"
          />

          <TextField
            id="outlined-text-input"
            name="customer"
            value={formData.customer}
            onChange={handleSetFormData}
            label="Customer"
            type="text"
            size="small"
          />
          <TextField
            id="outlined-text-input"
            name="transaction_ref"
            value={formData.transaction_ref}
            onChange={handleSetFormData}
            label="Reference"
            type="text"
            size="small"
          />

          <TextField
            id="outlined-text-input"
            name="date"
            value={formData.date}
            onChange={handleSetFormData}
            label="Date"
            type="date"
            size="small"
          />

          <Button onClick={applyFilter} variant="contained">
            Apply Filter
          </Button>
        </Stack>
      </Popover>
    </div>
  );
}
