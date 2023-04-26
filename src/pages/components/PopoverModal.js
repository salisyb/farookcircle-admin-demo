import * as React from 'react';
import Popover from '@mui/material/Popover';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import { FormControl, MenuItem, Select, Stack, TextField } from '@mui/material';

export default function BasicPopover({ onApplyFilter }) {
  const [anchorEl, setAnchorEl] = React.useState(null);

  const [formData, setFormData] = React.useState({
    agent: '',
    amount: '',
    date: '',
    funded_by: '',
    status: '',
    transaction_ref: '',
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
    // setFormData({
    //   agent: '',
    //   amount: '',
    //   date: '',
    //   funded_by: '',
    //   status: '',
    //   transaction_ref: '',
    // });
    handleClose();
  };

  const open = Boolean(anchorEl);
  const id = open ? 'simple-popover' : undefined;

  return (
    <div>
      <Button aria-describedby={id} variant="contained" onClick={handleClick}>
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
            <Typography sx={{ p: 2 }}>Filter.</Typography>
          </Stack>

          <TextField
            id="outlined-text-input"
            name="agent"
            value={formData.agent}
            onChange={handleSetFormData}
            label="Agent"
            type="text"
            size="small"
          />
          <TextField
            id="outlined-text-input"
            name="amount"
            value={formData.amount}
            onChange={handleSetFormData}
            label="Amount"
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
          <TextField
            id="outlined-text-input"
            name="funded_by"
            value={formData.funded_by}
            onChange={handleSetFormData}
            label="Funded by"
            type="text"
            size="small"
          />
          <TextField
            id="outlined-select-status"
            name="status"
            value={formData.status}
            onChange={handleSetFormData}
            select
            label="Status"
            defaultValue="completed"
          >
            <MenuItem value={'completed'}>completed</MenuItem>
            <MenuItem value={'pending'}>pending</MenuItem>
            <MenuItem value={'failed'}>failed</MenuItem>
            <MenuItem value={'successful'}>successful</MenuItem>
          </TextField>
          <TextField
            value={formData.transaction_ref}
            name="transaction_ref"
            onChange={handleSetFormData}
            id="outlined-text-input"
            label="Reference"
            type="text"
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
