import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { documentAPI, adminAPI } from '../services/api';
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
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Chip,
} from '@mui/material';
import { Upload, Description, School } from '@mui/icons-material';

const Dashboard = () => {
  const { user, isApproved, isAdmin } = useAuth();
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploadDialog, setUploadDialog] = useState(false);
  const [uploadForm, setUploadForm] = useState({
    branch: '',
    semester: '',
    subject: '',
    type: '',
    file: null,
  });
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');

  // New state for dropdowns
  const [branches, setBranches] = useState([]);
  const [semesters, setSemesters] = useState([]);
  const [subjects, setSubjects] = useState([]);

  const documentTypes = [
    'Handbook',
    'GATE PYQ',
    'University PYQ',
    'PYQ Solutions',
    'Handwritten Notes'
  ];

  // Fetch branches on mount
  useEffect(() => {
    const fetchBranches = async () => {
      try {
        const res = await adminAPI.getBranches();
        setBranches(res.data);
      } catch (err) {
        setBranches([]);
      }
    };
    fetchBranches();
  }, []);

  // Fetch semesters when branch changes
  useEffect(() => {
    if (!uploadForm.branch) {
      setSemesters([]);
      setUploadForm(f => ({ ...f, semester: '', subject: '' }));
      return;
    }
    const fetchSemesters = async () => {
      try {
        const res = await adminAPI.getSemesters(uploadForm.branch);
        setSemesters(res.data);
      } catch (err) {
        setSemesters([]);
      }
    };
    fetchSemesters();
    setUploadForm(f => ({ ...f, semester: '', subject: '' }));
  }, [uploadForm.branch]);

  // Fetch subjects when semester changes
  useEffect(() => {
    if (!uploadForm.branch || !uploadForm.semester) {
      setSubjects([]);
      setUploadForm(f => ({ ...f, subject: '' }));
      return;
    }
    const fetchSubjects = async () => {
      try {
        const res = await adminAPI.getSubjects(uploadForm.branch, uploadForm.semester);
        setSubjects(res.data);
      } catch (err) {
        setSubjects([]);
      }
    };
    fetchSubjects();
    setUploadForm(f => ({ ...f, subject: '' }));
  }, [uploadForm.branch, uploadForm.semester]);

  useEffect(() => {
    if (isApproved) fetchUserDocuments();
    // eslint-disable-next-line
  }, [isApproved]);

  const fetchUserDocuments = async () => {
    setLoading(true);
    try {
      let response;
      if (isAdmin) {
        response = await documentAPI.getDocuments();
      } else {
        response = await documentAPI.getMyDocuments();
      }
      setDocuments(response.data);
    } catch (error) {
      setError('Failed to fetch documents.');
    } finally {
      setLoading(false);
    }
  };

  const handleUploadFormChange = (e) => {
    const { name, value, files } = e.target;
    setUploadForm({
      ...uploadForm,
      [name]: files ? files[0] : value,
    });
  };

  const handleUpload = async () => {
    if (!uploadForm.file) {
      setError('Please select a file');
      return;
    }
    setUploading(true);
    setError('');
    try {
      const formData = new FormData();
      formData.append('file', uploadForm.file);
      formData.append('branch', uploadForm.branch); // ObjectId
      formData.append('semester', uploadForm.semester); // ObjectId
      formData.append('subject', uploadForm.subject); // ObjectId
      formData.append('type', uploadForm.type);
      await documentAPI.uploadDocument(formData);
      setUploadDialog(false);
      setUploadForm({
        branch: '',
        semester: '',
        subject: '',
        type: '',
        file: null,
      });
      fetchUserDocuments();
    } catch (error) {
      setError(error.response?.data?.message || 'Upload failed');
    } finally {
      setUploading(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'approved': return 'success';
      case 'pending': return 'warning';
      case 'rejected': return 'error';
      case 'featured': return 'info';
      default: return 'default';
    }
  };

  const backendUrl = 'http://localhost:5000'; // Change to your backend URL or use env variable

  if (!isAdmin && !isApproved) {
    return (
      <Container maxWidth="sm">
        <Box sx={{ mt: 8, mb: 4 }}>
          <Alert severity="warning">
            Your application is not approved yet. You cannot upload or view content until approved.
          </Alert>
        </Box>
      </Container>
    );
  }

  if (loading) {
    return (
      <Container>
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
          <CircularProgress />
        </Box>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg">
      <Box sx={{ mt: 4, mb: 4 }}>
        <Typography variant="h4" gutterBottom>
          Welcome, {user?.name}!
        </Typography>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Typography variant="h6" color="text.secondary">
            Your Academic Content
          </Typography>
          <Button
            variant="contained"
            startIcon={<Upload />}
            onClick={() => setUploadDialog(true)}
          >
            Upload Content
          </Button>
        </Box>
        {documents.length === 0 ? (
          <Paper sx={{ p: 4, textAlign: 'center' }}>
            <School sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
            <Typography variant="h6" color="text.secondary" gutterBottom>
              No content uploaded yet
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Start sharing your academic resources with the community
            </Typography>
          </Paper>
        ) : (
          <Grid container spacing={3}>
            {documents.map((doc) => (
              <Grid item xs={12} sm={6} md={4} key={doc._id}>
                <Card>
                  <CardContent>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                      <Typography variant="h6" component="div">
                        {doc.subject}
                      </Typography>
                      <Chip
                        label={doc.status}
                        color={getStatusColor(doc.status)}
                        size="small"
                      />
                    </Box>
                    <Typography variant="body2" color="text.secondary" gutterBottom>
                      {doc.branch} • Semester {doc.semester}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Type: {doc.type}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      Uploaded: {new Date(doc.createdAt).toLocaleDateString()}
                    </Typography>
                  </CardContent>
                  <CardActions>
                    <Button size="small" startIcon={<Description />} href={backendUrl + doc.fileUrl} target="_blank">
                      View
                    </Button>
                  </CardActions>
                </Card>
              </Grid>
            ))}
          </Grid>
        )}
      </Box>
      {/* Upload Dialog */}
      <Dialog open={uploadDialog} onClose={() => setUploadDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Upload Academic Content</DialogTitle>
        <DialogContent>
          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}
          <Box sx={{ mt: 2 }}>
            <FormControl fullWidth sx={{ mb: 2 }}>
              <InputLabel>Branch</InputLabel>
              <Select
                name="branch"
                value={uploadForm.branch}
                label="Branch"
                onChange={handleUploadFormChange}
                required
              >
                <MenuItem value="">Select Branch</MenuItem>
                {branches.map((b) => (
                  <MenuItem key={b._id} value={b._id}>{b.name}</MenuItem>
                ))}
              </Select>
            </FormControl>
            <FormControl fullWidth sx={{ mb: 2 }} disabled={!uploadForm.branch}>
              <InputLabel>Semester</InputLabel>
              <Select
                name="semester"
                value={uploadForm.semester}
                label="Semester"
                onChange={handleUploadFormChange}
                required
              >
                <MenuItem value="">Select Semester</MenuItem>
                {semesters.map((s) => (
                  <MenuItem key={s._id || s.number} value={s._id}>{s.name || s.number}</MenuItem>
                ))}
              </Select>
            </FormControl>
            <FormControl fullWidth sx={{ mb: 2 }} disabled={!uploadForm.semester}>
              <InputLabel>Subject</InputLabel>
              <Select
                name="subject"
                value={uploadForm.subject}
                label="Subject"
                onChange={handleUploadFormChange}
                required
              >
                <MenuItem value="">Select Subject</MenuItem>
                {subjects.map((subj) => (
                  <MenuItem key={subj._id} value={subj._id}>{subj.name}</MenuItem>
                ))}
              </Select>
            </FormControl>
            <FormControl fullWidth margin="normal">
              <InputLabel>Content Type</InputLabel>
              <Select
                name="type"
                value={uploadForm.type}
                onChange={handleUploadFormChange}
                label="Content Type"
              >
                {documentTypes.map((type) => (
                  <MenuItem key={type} value={type}>
                    {type}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <Button
              variant="outlined"
              component="label"
              fullWidth
              sx={{ mt: 2 }}
            >
              Choose File
              <input
                type="file"
                hidden
                name="file"
                onChange={handleUploadFormChange}
                accept=".pdf,.doc,.docx,.txt"
              />
            </Button>
            {uploadForm.file && (
              <Typography variant="body2" sx={{ mt: 1 }}>
                Selected: {uploadForm.file.name}
              </Typography>
            )}
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setUploadDialog(false)}>
            Cancel
          </Button>
          <Button
            onClick={handleUpload}
            variant="contained"
            disabled={uploading || !uploadForm.file}
          >
            {uploading ? <CircularProgress size={20} /> : 'Upload'}
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default Dashboard; 