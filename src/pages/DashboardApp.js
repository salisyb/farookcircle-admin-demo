import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
// @mui

import { Grid, Container, Typography } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { getUsers, getUsersWallet } from '../store/actions/users';
import { getServices } from '../store/actions/services';

// components
import Page from '../components/Page';

// sections
import { AppWebsiteVisits, AppWidgetSummary } from '../sections/@dashboard/app';

// ----------------------------------------------------------------------

export default function DashboardApp() {
  const navigation = useNavigate();
  const dispatch = useDispatch();

  const [showBalance, setShowBalance] = React.useState(false);

  // from  store
  const { user } = useSelector((state) => state.auth);
  const { users, userWallet, walletSum } = useSelector((state) => state.users);
  const { services } = useSelector((state) => state.services);

  React.useEffect(() => {
    // get list of users

    dispatch(getUsers());
  }, []);

  return (
    <Page title="Dashboard">
      <Container maxWidth="xl">
        <Typography variant="h4" sx={{ mb: 5 }}>
          Hi, Welcome back
        </Typography>

        <Grid container spacing={3}>
          <Grid item xs={12} sm={6} md={3}>
            <AppWidgetSummary
              title={'Wallet sum'}
              subtitle={'click to show or hide'}
              total={!showBalance ? '******' : Math.floor(walletSum)}
              extra={'₦'}
              icon={'ant-design:wallet-outlined'}
              onClick={() => setShowBalance(!showBalance)}
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <AppWidgetSummary
              title="Users"
              total={users.length}
              icon={'ant-design:user-outlined'}
              onClick={() => navigation('/dashboard/user')}
            />
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <AppWidgetSummary
              title="Update Services"
              total={''}
              color="info"
              onClick={() => navigation('/dashboard/services')}
              icon={'ant-design:shopping-cart-outlined'}
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <AppWidgetSummary
              title="Add Service Discount"
              total={''}
              color="info"
              onClick={() => navigation('/dashboard/discount')}
              icon={'ant-design:percentage-outlined'}
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <AppWidgetSummary
              title="Transactions"
              total={''}
              color="info"
              onClick={() => navigation('/dashboard/transaction')}
              icon={'ant-design:sync-outlined'}
            />
          </Grid>
        </Grid>
      </Container>
    </Page>
  );
}
