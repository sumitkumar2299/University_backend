import React, { useEffect, useState } from 'react';
import { publicAPI } from '../services/api';
import {
  Container,
  Typography,
  Box,
  Paper,
  Grid,
  Card,
  CardContent,
  CardActions,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  CircularProgress,
  Alert,
  Chip,
} from '@mui/material';
import { Description, School } from '@mui/icons-material';

const branches = ['CSE', 'ECE', 'ME', 'CE', 'EE'];
const semesters = [1, 2, 3, 4, 5, 6, 7, 8];
const documentTypes = [
  'Handbook',
  'GATE PYQ',
  'University PYQ',
  'PYQ Solutions',
  'Handwritten Notes',
];

// Helper to group documents hierarchically
const groupDocuments = (docs) => {
  const tree = {};
  docs.forEach(doc => {
    const branch = doc.branch?.name || 'Other';
    const semester = doc.semester?.name || doc.semester?.number || 'Other';
    const subject = doc.subject?.name || 'Other';
    const type = doc.type || 'Other';
    if (!tree[branch]) tree[branch] = {};
    if (!tree[branch][semester]) tree[branch][semester] = {};
    if (!tree[branch][semester][subject]) tree[branch][semester][subject] = {};
    if (!tree[branch][semester][subject][type]) tree[branch][semester][subject][type] = [];
    tree[branch][semester][subject][type].push(doc);
  });
  return tree;
};

const PublicLibrary = () => {
  const [filters, setFilters] = useState({
    branch: '',
    semester: '',
    subject: '',
    type: '',
  });
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [subjects, setSubjects] = useState([]);

  useEffect(() => {
    fetchDocuments();
    // eslint-disable-next-line
  }, []);

  // Fetch subjects when branch and semester are selected
  useEffect(() => {
    if (filters.branch && filters.semester) {
      fetchSubjects(filters.branch, filters.semester);
    } else {
      setSubjects([]);
      setFilters(f => ({ ...f, subject: '' }));
    }
    // eslint-disable-next-line
  }, [filters.branch, filters.semester]);

  const fetchDocuments = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await publicAPI.getPublicDocuments({
        branch: filters.branch,
        semester: filters.semester,
        subject: filters.subject,
        type: filters.type,
        status: 'approved',
      });
      setDocuments(res.data);
    } catch (err) {
      setError('Failed to fetch documents.');
    } finally {
      setLoading(false);
    }
  };

  // Fetch subjects for selected branch and semester
  const fetchSubjects = async (branch, semester) => {
    try {
      const res = await publicAPI.getSubjects(branch, semester);
      // If backend returns array of subject objects, map to names
      const subjectNames = Array.isArray(res.data) && typeof res.data[0] === 'object'
        ? res.data.map(s => s.name || s)
        : res.data;
      setSubjects(subjectNames);
    } catch (err) {
      setSubjects([]);
    }
  };

  const handleFilterChange = (e) => {
    setFilters({
      ...filters,
      [e.target.name]: e.target.value,
      ...(e.target.name === 'branch' ? { semester: '', subject: '' } : {}),
      ...(e.target.name === 'semester' ? { subject: '' } : {}),
    });
  };

  const handleSearch = (e) => {
    e.preventDefault();
    fetchDocuments();
  };

  return (
    <Container maxWidth="xl">
      <Box sx={{ mt: 4, mb: 4 }}>
        <Typography variant="h4" gutterBottom align="center">
          Public Academic Library
        </Typography>
        <Paper sx={{ p: 3, mb: 4 }}>
          <form onSubmit={handleSearch}>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={3}>
                <FormControl fullWidth>
                  <InputLabel>Branch</InputLabel>
                  <Select
                    name="branch"
                    value={filters.branch}
                    label="Branch"
                    onChange={handleFilterChange}
                  >
                    <MenuItem value="">All</MenuItem>
                    {branches.map((b) => (
                      <MenuItem key={b} value={b}>{b}</MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={3}>
                <FormControl fullWidth disabled={!filters.branch}>
                  <InputLabel>Semester</InputLabel>
                  <Select
                    name="semester"
                    value={filters.semester}
                    label="Semester"
                    onChange={handleFilterChange}
                  >
                    <MenuItem value="">All</MenuItem>
                    {semesters.map((s) => (
                      <MenuItem key={s} value={s}>{s}</MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={3}>
                <FormControl fullWidth disabled={!filters.branch || !filters.semester}>
                  <InputLabel>Subject</InputLabel>
                  <Select
                    name="subject"
                    value={filters.subject}
                    label="Subject"
                    onChange={handleFilterChange}
                  >
                    <MenuItem value="">All</MenuItem>
                    {subjects.length > 0
                      ? subjects.map((subj) => (
                          <MenuItem key={subj} value={subj}>{subj}</MenuItem>
                        ))
                      : null}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={2}>
                <FormControl fullWidth>
                  <InputLabel>Type</InputLabel>
                  <Select
                    name="type"
                    value={filters.type}
                    label="Type"
                    onChange={handleFilterChange}
                  >
                    <MenuItem value="">All</MenuItem>
                    {documentTypes.map((t) => (
                      <MenuItem key={t} value={t}>{t}</MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={1}>
                <Button type="submit" variant="contained" fullWidth sx={{ height: '100%' }}>
                  Search
                </Button>
              </Grid>
            </Grid>
          </form>
        </Paper>
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
            <CircularProgress />
          </Box>
        ) : error ? (
          <Alert severity="error">{error}</Alert>
        ) : documents.length === 0 ? (
          <Paper sx={{ p: 4, textAlign: 'center' }}>
            <School sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
            <Typography variant="h6" color="text.secondary" gutterBottom>
              No content found for the selected filters.
            </Typography>
          </Paper>
        ) : (
          <Grid container spacing={3}>
            {documents.map((doc) => (
              <Grid item xs={12} sm={6} md={4} lg={3} key={doc._id}>
                <Card>
                  <CardContent>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                      <Typography variant="h6" component="div">
                        {doc.subject}
                      </Typography>
                      <Chip label={doc.type} color="primary" size="small" />
                    </Box>
                    <Typography variant="body2" color="text.secondary" gutterBottom>
                      {doc.branch} • Semester {doc.semester}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      Uploaded: {new Date(doc.createdAt).toLocaleDateString()}
                    </Typography>
                  </CardContent>
                  <CardActions>
                    <Button size="small" startIcon={<Description />} href={doc.fileUrl} target="_blank">
                      View
                    </Button>
                  </CardActions>
                </Card>
              </Grid>
            ))}
          </Grid>
        )}
      </Box>
    </Container>
  );
};

export default PublicLibrary; 