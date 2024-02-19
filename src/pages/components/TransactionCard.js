import React from 'react';
import PropTypes from 'prop-types';
import { Card, CardContent, Typography, Box } from '@mui/material';

const TransactionCard = ({ transaction }) => (
    <Card variant="outlined">
      <CardContent>
        <Typography variant="h6" component="div">
          {transaction.transactionType}
        </Typography>
        <Typography color="text.secondary" gutterBottom>
          {transaction.createdAt}
        </Typography>
        <Box display="flex" justifyContent="space-between">
          <Typography variant="body1" gutterBottom>
            Amount: {transaction.amount}
          </Typography>
          <Typography variant="body1" gutterBottom>
            Transaction Ref: {transaction.ref}
          </Typography>
        </Box>
        <Typography variant="body2" color="text.secondary" mt={2}>
          Description: {transaction.description}
        </Typography>
      </CardContent>
    </Card>
  );

TransactionCard.propTypes = {
  transaction: PropTypes.object.isRequired,
};

export default TransactionCard;
