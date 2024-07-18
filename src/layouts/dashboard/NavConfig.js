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
    title: 'funding history',
    path: '/dashboard/funding',
    icon: getIcon('material-symbols:history'),
  },
  {
    title: 'users',
    path: '/dashboard/users',
    icon: getIcon('ph:users-fill'),
  },
  {
    title: 'user history',
    path: '/dashboard/transactions',
    icon: getIcon('icon-park-solid:transaction-order'),
  },
  {
    title: 'tickets',
    path: '/dashboard/tickets',
    icon: getIcon('f7:tickets-fill'),
  },
];

export default navConfig;
