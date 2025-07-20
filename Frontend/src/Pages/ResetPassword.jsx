import React, { useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { authAPI } from '../services/api';
import { Container, Typography, Box, Paper, TextField, Button, Alert, CircularProgress } from '@mui/material';

const ResetPassword = () => {
  const [searchParams] = useSearchParams();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  const token = searchParams.get('token');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    if (!password || !confirmPassword) {
      setError('Please fill in all fields.');
      return;
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }
    if (!token) {
      setError('Invalid or missing token.');
      return;
    }
    setLoading(true);
    try {
      const res = await authAPI.resetPassword(token, password);
      setSuccess(res.message || res.data.message || 'Password reset successful!');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to reset password.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container maxWidth="sm">
      <Box sx={{ mt: 8, mb: 4 }}>
        <Paper sx={{ p: 4 }}>
          <Typography variant="h4" gutterBottom align="center">
            Reset Password
          </Typography>
          <Box component="form" onSubmit={handleSubmit} sx={{ mt: 2 }}>
            <TextField
              label="New Password"
              type="password"
              fullWidth
              required
              value={password}
              onChange={e => setPassword(e.target.value)}
              sx={{ mb: 2 }}
            />
            <TextField
              label="Confirm New Password"
              type="password"
              fullWidth
              required
              value={confirmPassword}
              onChange={e => setConfirmPassword(e.target.value)}
              sx={{ mb: 2 }}
            />
            <Button type="submit" variant="contained" fullWidth disabled={loading}>
              {loading ? <CircularProgress size={24} /> : 'Reset Password'}
            </Button>
          </Box>
          {success && (
            <Alert severity="success" sx={{ mt: 3 }}>
              {success}
              <Box sx={{ mt: 2 }}>
                <Button variant="contained" component={Link} to="/login">
                  Go to Login
                </Button>
              </Box>
            </Alert>
          )}
          {error && (
            <Alert severity="error" sx={{ mt: 3 }}>{error}</Alert>
          )}
        </Paper>
      </Box>
    </Container>
  );
};

export default ResetPassword; 