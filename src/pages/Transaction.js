import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { Box, CircularProgress, Divider, Stack, Typography } from '@mui/material';

// project imports
import MainCard from './components/MainCard';
import TransactionCard from './components/TransactionCard';
import { getTransactionsHistory } from '../api/transactions.api';

const Transactions = () => {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(false);
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const username = queryParams.get('user') || '';

  useEffect(() => {
    const fetchTransactions = async () => {
      setLoading(true);
      try {
        const response = await getTransactionsHistory({ username });
        if (response.ok) {
          setTransactions(response.data.data);
        } else {
          console.error('Failed to fetch transactions:', response.error);
        }
      } catch (error) {
        console.error('Error fetching transactions:', error);
      } finally {
        setLoading(false);
      }
    };

    if (username) {
      fetchTransactions();
    }
  }, [username]);

  return (
    <>
      <MainCard title="Transactions History">
        <Box sx={{ px: { xs: '0px', sm: '100px', md: '140px', lg: '180px' }, pb: '50px' }}>
          {loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100px' }}>
              <CircularProgress size={32} />
            </Box>
          ) : (
            <>
              {transactions?.map((transaction, index) => (
                <React.Fragment key={transaction.id}>
                  <TransactionCard transaction={transaction} />
                  {index < transactions.length - 1 && <Divider />}
                </React.Fragment>
              ))}
            </>
          )}
        </Box>
      </MainCard>
    </>
  );
};

export default Transactions;
