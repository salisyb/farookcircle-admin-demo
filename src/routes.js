import { Navigate, useRoutes } from 'react-router-dom';
import { useSelector } from 'react-redux';

// layouts
import DashboardLayout from './layouts/dashboard';
import LogoOnlyLayout from './layouts/LogoOnlyLayout';
//

// authenticate
import User from './pages/User';
import Login from './pages/Login';
import NotFound from './pages/Page404';
import TicketList from './pages/TicketList';
import TicketMessages from './pages/TicketMessage';
import UsersManagement from './pages/UsersManagement';
import Transactions from './pages/Transactions';
import Funding from './pages/Funding';
import Transaction from './pages/Transaction';
import TransactionData from './pages/TransactionData';

// ----------------------------------------------------------------------

export default function Router() {
  const { isAuthenticated } = useSelector((state) => state.auth);

  return useRoutes([
    {
      path: '/dashboard',
      element: isAuthenticated ? <DashboardLayout /> : <Navigate to="/login" />,
      children: [
        { path: 'app', element: isAuthenticated ? <User /> : <Navigate to="/login" /> },
        { path: 'funding', element: isAuthenticated ? <Funding /> : <Navigate to="/login" /> },
        { path: 'users', element: isAuthenticated ? <UsersManagement /> : <Navigate to="/login" /> },
        { path: 'tickets', element: isAuthenticated ? <TicketList /> : <Navigate to="/login" /> },
        { path: 'tickets/message', element: isAuthenticated ? <TicketMessages /> : <Navigate to="/login" /> },
        { path: 'transaction', element: isAuthenticated ? <Transaction /> : <Navigate to="/login" /> },
        { path: 'transaction/data', element: isAuthenticated ? <TransactionData /> : <Navigate to="/login" /> },
        { path: 'transactions', element: isAuthenticated ? <Transactions /> : <Navigate to="/login" /> },
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
