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
import Register from './pages/Register';
import Products from './pages/Products';
import DashboardApp from './pages/DashboardApp';
import LoadingScreen from './components/LoadingScreen';
import Add from './pages/Users/NewUser';
import Update from './pages/Users/UpdateUser';
import UpdateService from './pages/UpdateServices';
import UpdateDiscount from './pages/UpdateDiscount';
import Transaction from './pages/Transaction';
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
        // { path: 'app', element: isAuthenticated ? <DashboardApp /> : <Navigate to="/login" /> },
        { path: 'app', element: isAuthenticated ? <User /> : <Navigate to="/login" /> },
        { path: 'funding', element: isAuthenticated ? <FundUserWallet /> : <Navigate to="/login" /> },
        { path: 'ticket', element: isAuthenticated ? <TicketList /> : <Navigate to="/login" /> },
        { path: 'ticket/message', element: isAuthenticated ? <TicketMessages /> : <Navigate to="/login" /> },

        // { path: 'user/add', element: isAuthenticated ? <Add /> : <Navigate to="/login" /> },
        // { path: 'services', element: isAuthenticated ? <Products /> : <Navigate to="/login" /> },
        // { path: 'services/:category', element: isAuthenticated ? <UpdateService /> : <Navigate to="/login" /> },
        // { path: 'discount', element: isAuthenticated ? <UpdateDiscount /> : <Navigate to="/login" /> },
        // { path: 'transaction', element: isAuthenticated ? <Transaction /> : <Navigate to="/login" /> },

        // { path: 'blog', element: isAuthenticated ? <Blog /> : <Navigate to="/login" /> },
      ],
    },
    {
      path: 'login',
      element: <Login />,
    },
    // {
    //   path: 'register',
    //   element: <Register />,
    // },
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
