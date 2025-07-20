import React, { useEffect, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { authAPI } from '../services/api';
import { Container, Typography, Box, CircularProgress, Alert, Button } from '@mui/material';

const VerifyEmail = () => {
  const [searchParams] = useSearchParams();
  const [status, setStatus] = useState('loading'); // loading, success, error
  const [message, setMessage] = useState('');

  useEffect(() => {
    const token = searchParams.get('token');
    if (!token) {
      setStatus('error');
      setMessage('No verification token provided.');
      return;
    }
    const verify = async () => {
      try {
        const res = await authAPI.verifyEmail(token);
        setStatus('success');
        setMessage(res.data.message || 'Email verified successfully!');
      } catch (err) {
        setStatus('error');
        setMessage(
          err.response?.data?.message || 'Verification failed. The link may be invalid or expired.'
        );
      }
    };
    verify();
  }, [searchParams]);

  return (
    <Container maxWidth="sm">
      <Box sx={{ mt: 8, mb: 4, textAlign: 'center' }}>
        <Typography variant="h4" gutterBottom>
          Email Verification
        </Typography>
        {status === 'loading' && <CircularProgress sx={{ mt: 4 }} />}
        {status === 'success' && (
          <Alert severity="success" sx={{ mt: 4 }}>
            {message}
            <Box sx={{ mt: 2 }}>
              <Button variant="contained" component={Link} to="/login">
                Go to Login
              </Button>
            </Box>
          </Alert>
        )}
        {status === 'error' && (
          <Alert severity="error" sx={{ mt: 4 }}>
            {message}
            <Box sx={{ mt: 2 }}>
              <Button variant="contained" component={Link} to="/register">
                Register Again
              </Button>
            </Box>
          </Alert>
        )}
      </Box>
    </Container>
  );
};

export default VerifyEmail; 