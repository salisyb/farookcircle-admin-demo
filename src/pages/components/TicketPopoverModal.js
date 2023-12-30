import * as React from 'react';
import Popover from '@mui/material/Popover';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import { FormControl, MenuItem, Select, Stack, TextField } from '@mui/material';

export default function TicketPopoverModal({ onApplyFilter }) {
  const [anchorEl, setAnchorEl] = React.useState(null);

  const [formData, setFormData] = React.useState({
    user: '',
    attended_by: '',
    title: '',
    created_by: '',
    created_at: new Date(),
    status: '',
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
            <Typography sx={{ p: 2 }}>Filter Ticket</Typography>
          </Stack>

          <TextField
            id="outlined-text-input"
            name="title"
            value={formData.title}
            onChange={handleSetFormData}
            label="Ticket Subject"
            type="text"
            size="small"
          />

          <TextField
            id="outlined-text-input"
            name="user"
            value={formData.user}
            onChange={handleSetFormData}
            label="User Username"
            type="text"
            size="small"
          />
          <TextField
            id="outlined-text-input"
            name="attended_by"
            value={formData.attended_by}
            onChange={handleSetFormData}
            label="Assign to"
            type="text"
            size="small"
          />

          <TextField
            id="outlined-text-input"
            name="created_at"
            value={formData.created_at}
            onChange={handleSetFormData}
            label="Date Created"
            type="date"
            size="small"
          />

          <TextField
            id="outlined-select-status"
            name="status"
            value={formData.status}
            onChange={handleSetFormData}
            select
            label="Ticket Status"
            defaultValue="completed"
          >
            <MenuItem value={'close'}>Close Ticket</MenuItem>
            <MenuItem value={'active'}>Active Ticket</MenuItem>
          </TextField>

          <Button onClick={applyFilter} variant="contained">
            Apply Filter
          </Button>
        </Stack>
      </Popover>
    </div>
  );
}
