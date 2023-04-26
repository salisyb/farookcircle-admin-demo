import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';

// component
import LoadingScreen from '../components/LoadingScreen';

export default function PrivateRoute({ component }) {
  const navigation = useNavigate();

  const { isLoading, isAuthenticated } = useSelector((state) => state.auth);

  React.useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      navigation('/login');
    }
  }, [isLoading, isAuthenticated, navigation]);

  if (true) {
    return <LoadingScreen />;
  }

  return { component };
}
