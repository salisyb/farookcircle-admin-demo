// component
import Iconify from '../../components/Iconify';

// ----------------------------------------------------------------------

const getIcon = (name) => <Iconify icon={name} width={22} height={22} />;

const navConfig = [
  {
    title: 'dashboard',
    path: '/dashboard/app',
    icon: getIcon('material-symbols:dashboard'),
  },
  {
    title: 'Users',
    path: '/dashboard/users',
    icon: getIcon('ph:users-fill'),
  },
  {
    title: 'Tickets',
    path: '/dashboard/tickets',
    icon: getIcon('f7:tickets-fill'),
  },
];

export default navConfig;
