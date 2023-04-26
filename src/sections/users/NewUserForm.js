/* eslint-disable no-unused-expressions */
import * as Yup from 'yup';
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';

// form
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
// @mui
import { Stack, IconButton, InputAdornment, CircularProgress, Grid } from '@mui/material';
import { LoadingButton } from '@mui/lab';

// auth action
import { addNewUser, updateUser } from '../../store/actions/users';

// components
import Iconify from '../../components/Iconify';
import { FormProvider, RHFTextField, RHFCheckbox } from '../../components/hook-form';

// ----------------------------------------------------------------------
export default function NewUser({ sentValue, update }) {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const { isLoading, added } = useSelector((state) => state.users);

  const NewUserSchema = Yup.object().shape({
    email: Yup.string().email('Email must be a valid email address').required('Email is required'),
    first_name: Yup.string().required('First Name is required'),
    last_name: Yup.string().required('Last Name is required'),
    phone_number: Yup.string().required('phone number is required'),
    password: Yup.string().required('Password is required'),
  });

  const defaultValues = sentValue || {
    first_name: '',
    last_name: '',
    phone_number: '',
    email: '',
    password: '',
  };

  const methods = useForm({
    resolver: yupResolver(NewUserSchema),
    defaultValues,
  });

  const {
    handleSubmit,
    formState: { isSubmitting },
  } = methods;

  const onSubmit = async (data) => {
    update ? dispatch(updateUser(data)) : dispatch(addNewUser(data));
  };

  React.useEffect(() => {
    if (added) {
      navigate('/dashboard/user');
    }
  }, [added, navigate]);

  return (
    <FormProvider methods={methods} onSubmit={handleSubmit(onSubmit)}>
      <Grid container spacing={4}>
        <Grid item xs={12} sm={6} md={4}>
          <RHFTextField name="first_name" label="First Name" />
        </Grid>

        <Grid item xs={12} sm={6} md={4}>
          <RHFTextField name="last_name" label="Last Name" />
        </Grid>
        <Grid item xs={12} sm={6} md={4}>
          <RHFTextField name="email" label="Email address" />
        </Grid>
        <Grid item xs={12} sm={6} md={4}>
          <RHFTextField name="phone_number" label="Phone Number" />
        </Grid>
        <Grid item xs={12} sm={6} md={4}>
          <RHFTextField name="password" label="Password" />
        </Grid>
      </Grid>
      <Grid item xs={12} sm={6} md={4} mt="30px">
        <LoadingButton size="large" type="submit" variant="contained" loading={isSubmitting} disabled={isLoading}>
          {update ? 'Update User' : 'Create New User'}
        </LoadingButton>
      </Grid>
    </FormProvider>
  );
}
