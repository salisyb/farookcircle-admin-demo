import { filter } from 'lodash';
import { sentenceCase } from 'change-case';
import React, { useState } from 'react';
import { Link as RouterLink, useParams } from 'react-router-dom';
// material
import { Card, Stack, Container, Box, Typography, CircularProgress } from '@mui/material';
// components
import Page from '../../components/Page';

import UserForm from '../../sections/users/NewUserForm';
import { getUser } from '../../api/users.api';

// ----------------------------------------------------------------------

const TABLE_HEAD = [
  { id: 'name', label: 'Name', alignRight: false },
  { id: 'company', label: 'Company', alignRight: false },
  { id: 'role', label: 'Role', alignRight: false },
  { id: 'isVerified', label: 'Verified', alignRight: false },
  { id: 'status', label: 'Status', alignRight: false },
  { id: '' },
];

// ----------------------------------------------------------------------

export default function User() {
  const { id } = useParams();
  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState(null);

  React.useEffect(() => {
    handleGetUser(id);
  }, []);

  const handleGetUser = async (userId) => {
    setLoading(true);
    const response = await getUser(userId);
    if (response.ok) {
      setUser(response.data);
    }
    setLoading(false);
  };

  return (
    <Page title="Update">
      <Container>
        <Stack direction="row" alignItems="center" justifyContent="space-between" mb={5}>
          <Typography variant="h4" gutterBottom>
            Update User
          </Typography>
        </Stack>

        <Card>
          <Box p="20px">
            {loading ? (
              <Box minHeight={'200px'} width={'100%'} display="flex" justifyContent="center" alignItems="center">
                <CircularProgress />
              </Box>
            ) : (
              <UserForm sentValue={user} update />
            )}
          </Box>
        </Card>
      </Container>
    </Page>
  );
}
