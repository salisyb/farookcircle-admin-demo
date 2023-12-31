import * as React from 'react';
import Popover from '@mui/material/Popover';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import { FormControl, MenuItem, Select, Stack, TextField } from '@mui/material';

export default function TicketPopoverModal({ onApplyFilter }) {
  const [anchorEl, setAnchorEl] = React.useState(null);

  const [formData, setFormData] = React.useState({
    username: '',
    attended_by: '',
    title: '',
    created_by: '',
    created_at: '',
    is_closed: false,
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
            <Typography sx={{ p: 2 }}>Filter Tickets</Typography>
          </Stack>

          <TextField
            id="outlined-text-input"
            name="title"
            value={formData.title}
            onChange={handleSetFormData}
            label="Subject"
            type="text"
            size="small"
          />

          <TextField
            id="outlined-text-input"
            name="username"
            value={formData.username}
            onChange={handleSetFormData}
            label="User"
            type="text"
            size="small"
          />
          <TextField
            id="outlined-text-input"
            name="attended_by"
            value={formData.attended_by}
            onChange={handleSetFormData}
            label="Assigned to"
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
            name="is_closed"
            value={formData.is_closed}
            onChange={handleSetFormData}
            select
            label="Status"
            defaultValue="open"
          >
            <MenuItem value>Closed</MenuItem>
            <MenuItem value={false}>Open</MenuItem>
          </TextField>

          <Button onClick={applyFilter} variant="contained">
            Apply Filter
          </Button>
        </Stack>
      </Popover>
    </div>
  );
}
