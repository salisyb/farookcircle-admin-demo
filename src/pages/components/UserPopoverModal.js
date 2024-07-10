import * as React from 'react';
import Popover from '@mui/material/Popover';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import { FormControl, MenuItem, Select, Stack, TextField } from '@mui/material';

export default function UserBasicPopover({ onApplyFilter }) {
  const [anchorEl, setAnchorEl] = React.useState(null);

  const [formData, setFormData] = React.useState({
    owner: '',
    amount: '',
    description: '',
    createdAt: '',
    direction: '',
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
    //   owner: '',
    //   amount: '',
    //   description: '',
    //   createdAt: '',
    //   direction: '',
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
            name="owner"
            value={formData.owner}
            onChange={handleSetFormData}
            label="Owner"
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
            name="description"
            value={formData.description}
            onChange={handleSetFormData}
            label="Descriptions"
            type="text"
            size="small"
          />
          <TextField
            id="outlined-text-input"
            name="createdAt"
            value={formData.createdAt}
            onChange={handleSetFormData}
            label="Date"
            type="date"
            size="small"
          />

          <TextField
            id="outlined-text-input"
            name="direction"
            value={formData.direction}
            onChange={handleSetFormData}
            label="Directions"
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
