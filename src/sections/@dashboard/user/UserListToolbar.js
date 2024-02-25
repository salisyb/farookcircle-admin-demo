import PropTypes from 'prop-types';
// material
import { styled } from '@mui/material/styles';
import { Toolbar, Tooltip, IconButton, Typography, OutlinedInput, InputAdornment, Stack } from '@mui/material';
// component
import Iconify from '../../../components/Iconify';
import BasicPopover from '../../../pages/components/PopoverModal';

// ----------------------------------------------------------------------

const RootStyle = styled(Toolbar)(({ theme }) => ({
  height: 96,
  display: 'flex',
  justifyContent: 'space-between',
  padding: theme.spacing(0, 1, 0, 3),
}));

const SearchStyle = styled(OutlinedInput)(({ theme }) => ({
  width: 240,
  transition: theme.transitions.create(['box-shadow', 'width'], {
    easing: theme.transitions.easing.easeInOut,
    duration: theme.transitions.duration.shorter,
  }),
  '&.Mui-focused': { width: 320, boxShadow: theme.customShadows.z8 },
  '& fieldset': {
    borderWidth: `1px !important`,
    borderColor: `${theme.palette.grey[500_32]} !important`,
  },
}));

// ----------------------------------------------------------------------

UserListToolbar.propTypes = {
  numSelected: PropTypes.number,
  filterName: PropTypes.string,
  onFilterName: PropTypes.func,
  toggleFilter: PropTypes.func,
  totalAmount: PropTypes.string,
  onApplyFilter: PropTypes.func,
};

export default function UserListToolbar({
  numSelected,
  filterName,
  onFilterName,
  toggleFilter,
  totalAmount,
  onApplyFilter,
}) {
  return (
    <RootStyle
      sx={{
        ...(numSelected > 0 && {
          color: 'primary.main',
          bgcolor: 'primary.lighter',
        }),
      }}
    >
      <Stack direction={'column'}>
        <Typography variant="h6" sx={{ fontWeight: '200', color: 'gray' }}>
          Current Balance
        </Typography>
        <Typography variant="h2" sx={{ fontWeight: '200' }}>
          ₦ {new Intl.NumberFormat().format(totalAmount) || '0.00'}
        </Typography>
      </Stack>

      {/* <BasicPopover onApplyFilter={onApplyFilter} /> */}
    </RootStyle>
  );
}
