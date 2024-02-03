import { Navigate, useRoutes } from 'react-router-dom';
import { useSelector } from 'react-redux';

// layouts
import DashboardLayout from './layouts/dashboard';
import LogoOnlyLayout from './layouts/LogoOnlyLayout';
//

// authenticate
import PrivateRoute from './layouts/PrivateRoute';

//
import Blog from './pages/Blog';
import User from './pages/User';
import Login from './pages/Login';
import NotFound from './pages/Page404';
import FundUserWallet from './pages/FundUserWallet';
import TicketList from './pages/TicketList';
import TicketMessages from './pages/TicketMessage';

// ----------------------------------------------------------------------

export default function Router() {
  const { isAuthenticated } = useSelector((state) => state.auth);

  return useRoutes([
    {
      path: '/dashboard',
      element: isAuthenticated ? <DashboardLayout /> : <Navigate to="/login" />,
      children: [
        { path: 'app', element: isAuthenticated ? <User /> : <Navigate to="/login" /> },
        { path: 'users', element: isAuthenticated ? <FundUserWallet /> : <Navigate to="/login" /> },
        { path: 'tickets', element: isAuthenticated ? <TicketList /> : <Navigate to="/login" /> },
        { path: 'tickets/message', element: isAuthenticated ? <TicketMessages /> : <Navigate to="/login" /> },
      ],
    },
    {
      path: 'login',
      element: <Login />,
    },

    {
      path: '/',
      element: isAuthenticated ? <LogoOnlyLayout /> : <Navigate to="/login" />,
      children: [
        { path: '/', element: <Navigate to={isAuthenticated ? '/dashboard/app' : '/login'} /> },
        { path: '404', element: <NotFound /> },
        { path: '*', element: <Navigate to="/404" /> },
      ],
    },
    {
      path: '*',
      element: <Navigate to="/404" replace />,
    },
  ]);
}
