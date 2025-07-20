import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Box,
  Paper,
  Tabs,
  Tab,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Button,
  CircularProgress,
  Alert,
  Chip,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Accordion,
  AccordionSummary,
  AccordionDetails,
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { adminAPI } from '../services/api';
import { useSnackbar } from 'notistack';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

function TabPanel({ children, value, index }) {
  return value === index ? <Box sx={{ p: 3 }}>{children}</Box> : null;
}

const statusOptions = [
  { value: '', label: 'All' },
  { value: 'pending', label: 'Pending' },
  { value: 'approved', label: 'Approved' },
  { value: 'rejected', label: 'Rejected' },
];

// Helper to group uploads hierarchically
const groupUploads = (uploads) => {
  const tree = {};
  uploads.forEach(doc => {
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

const Admin = () => {
  const [tab, setTab] = useState(0);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [statusFilter, setStatusFilter] = useState('pending');
  const [branchFilter, setBranchFilter] = useState('');
  const [branches, setBranches] = useState([]);
  const { enqueueSnackbar } = useSnackbar();

  // Modal and dialog state
  const [selectedUser, setSelectedUser] = useState(null);
  const [confirmAction, setConfirmAction] = useState(null); // 'approve' or 'reject'
  const [confirmOpen, setConfirmOpen] = useState(false);

  const [uploads, setUploads] = useState([]);
  const [uploadsLoading, setUploadsLoading] = useState(false);
  const [uploadsError, setUploadsError] = useState('');

  // Content tab state
  const [contentBranch, setContentBranch] = useState('');
  const [contentSemester, setContentSemester] = useState('');
  const [contentSubject, setContentSubject] = useState('');
  const [contentSemesters, setContentSemesters] = useState([]);
  const [contentSubjects, setContentSubjects] = useState([]);
  const [contentDocs, setContentDocs] = useState([]);
  const [contentLoading, setContentLoading] = useState(false);
  const [contentError, setContentError] = useState('');

  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!user || user.role !== 'admin') {
      navigate('/', { replace: true });
    }
  }, [user, navigate]);

  const handleTabChange = (event, newValue) => {
    setTab(newValue);
  };

  useEffect(() => {
    if (tab === 0) {
      fetchUsers();
      fetchBranches();
    }
    if (tab === 3) {
      fetchUploads();
    }
    // eslint-disable-next-line
  }, [tab, statusFilter, branchFilter]);

  const fetchBranches = async () => {
    try {
      const res = await adminAPI.getBranches();
      setBranches(res.data);
    } catch (err) {
      setBranches([]);
    }
  };

  const fetchUsers = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await adminAPI.getAllUsers();
      let filtered = res.data;
      if (statusFilter) filtered = filtered.filter(u => u.status === statusFilter);
      if (branchFilter) filtered = filtered.filter(u => u.branch === branchFilter);
      setUsers(filtered);
    } catch (err) {
      setError('Failed to fetch users.');
    } finally {
      setLoading(false);
    }
  };

  const fetchUploads = async () => {
    setUploadsLoading(true);
    setUploadsError('');
    try {
      const res = await adminAPI.getAllUploads();
      setUploads(res.data);
    } catch (err) {
      setUploadsError('Failed to fetch uploads.');
    } finally {
      setUploadsLoading(false);
    }
  };

  // Fetch semesters when branch changes
  useEffect(() => {
    if (tab === 2 && contentBranch) {
      fetchContentSemesters(contentBranch);
      setContentSemester('');
      setContentSubject('');
      setContentSubjects([]);
      setContentDocs([]);
    }
    // eslint-disable-next-line
  }, [tab, contentBranch]);

  // Fetch subjects when semester changes
  useEffect(() => {
    if (tab === 2 && contentBranch && contentSemester) {
      fetchContentSubjects(contentBranch, contentSemester);
      setContentSubject('');
      setContentDocs([]);
    }
    // eslint-disable-next-line
  }, [tab, contentBranch, contentSemester]);

  // Fetch content when subject changes
  useEffect(() => {
    if (tab === 2 && contentBranch && contentSemester && contentSubject) {
      fetchContentDocs();
    }
    // eslint-disable-next-line
  }, [tab, contentBranch, contentSemester, contentSubject]);

  const fetchContentSemesters = async (branchId) => {
    try {
      const res = await adminAPI.getSemesters(branchId);
      setContentSemesters(res.data);
    } catch (err) {
      setContentSemesters([]);
    }
  };
  const fetchContentSubjects = async (branchId, semesterId) => {
    try {
      const res = await adminAPI.getSubjects(branchId, semesterId);
      setContentSubjects(res.data);
    } catch (err) {
      setContentSubjects([]);
    }
  };
  const fetchContentDocs = async () => {
    setContentLoading(true);
    setContentError('');
    try {
      const res = await adminAPI.getAllUploads({
        branch: contentBranch,
        semester: contentSemester,
        subject: contentSubject,
        status: 'approved',
      });
      setContentDocs(res.data);
    } catch (err) {
      setContentError('Failed to fetch content.');
      setContentDocs([]);
    } finally {
      setContentLoading(false);
    }
  };

  // Open user details modal
  const handleViewDetails = (user) => {
    setSelectedUser(user);
  };

  // Open confirmation dialog
  const handleConfirm = (action) => {
    setConfirmAction(action);
    setConfirmOpen(true);
  };

  // Approve or reject user
  const handleApproveReject = async () => {
    if (!selectedUser) return;
    setLoading(true);
    setConfirmOpen(false);
    try {
      if (confirmAction === 'approve') {
        await adminAPI.approveUser(selectedUser._id);
        enqueueSnackbar('User approved and notified by email!', { variant: 'success' });
      } else {
        await adminAPI.rejectUser(selectedUser._id);
        enqueueSnackbar('User rejected and notified by email.', { variant: 'info' });
      }
      setSelectedUser(null);
      fetchUsers();
    } catch (err) {
      enqueueSnackbar('Failed to update user status.', { variant: 'error' });
    } finally {
      setLoading(false);
    }
  };

  // Approve or reject upload
  const handleApproveUpload = async (docId) => {
    setUploadsLoading(true);
    try {
      await adminAPI.approveUpload(docId);
      enqueueSnackbar('Upload approved and user notified by email!', { variant: 'success' });
      fetchUploads();
    } catch (err) {
      enqueueSnackbar('Failed to approve upload.', { variant: 'error' });
    } finally {
      setUploadsLoading(false);
    }
  };
  const handleRejectUpload = async (docId) => {
    setUploadsLoading(true);
    try {
      await adminAPI.rejectUpload(docId);
      enqueueSnackbar('Upload rejected and user notified by email.', { variant: 'info' });
      fetchUploads();
    } catch (err) {
      enqueueSnackbar('Failed to reject upload.', { variant: 'error' });
    } finally {
      setUploadsLoading(false);
    }
  };

  // Group users by branch
  const usersByBranch = users.reduce((acc, user) => {
    if (!acc[user.branch]) acc[user.branch] = [];
    acc[user.branch].push(user);
    return acc;
  }, {});

  const backendUrl = 'http://localhost:5000'; // Change to your backend URL or use env variable

  return (
    <Container maxWidth="xl">
      <Box sx={{ mt: 4, mb: 4 }}>
        <Typography variant="h4" gutterBottom>
          Admin Dashboard
        </Typography>
        <Paper sx={{ p: 2 }}>
          <Tabs value={tab} onChange={handleTabChange} variant="scrollable" scrollButtons="auto">
            <Tab label="Applications" />
            <Tab label="Branches & Subjects" />
            <Tab label="Content" />
            <Tab label="Uploads" />
          </Tabs>
          <TabPanel value={tab} index={0}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
              <Typography variant="h6" gutterBottom sx={{ flexGrow: 1 }}>
                User Applications
              </Typography>
              {/* You can keep or remove the branch filter if you want */}
              <FormControl size="small" sx={{ minWidth: 180 }}>
                <InputLabel>Status</InputLabel>
                <Select
                  value={statusFilter}
                  label="Status"
                  onChange={e => setStatusFilter(e.target.value)}
                >
                  {statusOptions.map(opt => (
                    <MenuItem key={opt.value} value={opt.value}>{opt.label}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Box>
            {loading ? (
              <CircularProgress />
            ) : error ? (
              <Alert severity="error">{error}</Alert>
            ) : (
              Object.keys(usersByBranch).length === 0 ? (
                <Alert severity="info">No users found.</Alert>
              ) : (
                Object.keys(usersByBranch).map(branch => (
                  <Box key={branch} sx={{ mb: 4 }}>
                    <Typography variant="h6" sx={{ mb: 1 }}>{branch}</Typography>
                    <TableContainer component={Paper}>
                      <Table>
                        <TableHead>
                          <TableRow>
                            <TableCell>Name</TableCell>
                            <TableCell>Email</TableCell>
                            <TableCell>Branch</TableCell>
                            <TableCell>College</TableCell>
                            <TableCell>Status</TableCell>
                            <TableCell>Actions</TableCell>
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          {usersByBranch[branch].map((user) => (
                            <TableRow key={user._id}>
                              <TableCell>{user.name}</TableCell>
                              <TableCell>{user.email}</TableCell>
                              <TableCell>{user.branch}</TableCell>
                              <TableCell>{user.college}</TableCell>
                              <TableCell><Chip label={user.status} color={user.status === 'pending' ? 'warning' : user.status === 'approved' ? 'success' : 'error'} /></TableCell>
                              <TableCell>
                                <Button variant="outlined" size="small" onClick={() => handleViewDetails(user)}>
                                  View Details
                                </Button>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </TableContainer>
                  </Box>
                ))
              )
            )}
          </TabPanel>
          <TabPanel value={tab} index={1}>
            {/* Branch/Semester/Subject management will go here */}
            <Typography>Manage branches, semesters, and subjects.</Typography>
          </TabPanel>
          <TabPanel value={tab} index={2}>
            <Typography variant="h6" gutterBottom>
              Manage Content by Branch, Semester, and Subject
            </Typography>
            <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
              <FormControl sx={{ minWidth: 180 }} size="small">
                <InputLabel>Branch</InputLabel>
                <Select
                  value={contentBranch}
                  label="Branch"
                  onChange={e => setContentBranch(e.target.value)}
                >
                  <MenuItem value="">Select Branch</MenuItem>
                  {branches.map((b) => (
                    <MenuItem key={b._id || b.name} value={b._id || b.name}>{b.name}</MenuItem>
                  ))}
                </Select>
              </FormControl>
              <FormControl sx={{ minWidth: 140 }} size="small" disabled={!contentBranch}>
                <InputLabel>Semester</InputLabel>
                <Select
                  value={contentSemester}
                  label="Semester"
                  onChange={e => setContentSemester(e.target.value)}
                >
                  <MenuItem value="">Select Semester</MenuItem>
                  {contentSemesters.map((s) => (
                    <MenuItem key={s._id || s.number || s} value={s.number || s}>{s.name || s.number || s}</MenuItem>
                  ))}
                </Select>
              </FormControl>
              <FormControl sx={{ minWidth: 180 }} size="small" disabled={!contentSemester}>
                <InputLabel>Subject</InputLabel>
                <Select
                  value={contentSubject}
                  label="Subject"
                  onChange={e => setContentSubject(e.target.value)}
                >
                  <MenuItem value="">Select Subject</MenuItem>
                  {contentSubjects.map((subj) => (
                    <MenuItem key={subj._id || subj.name || subj} value={subj.name || subj}>{subj.name || subj}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Box>
            {contentLoading ? (
              <CircularProgress />
            ) : contentError ? (
              <Alert severity="error">{contentError}</Alert>
            ) : contentDocs.length === 0 && contentBranch && contentSemester && contentSubject ? (
              <Alert severity="info">No content found for this subject.</Alert>
            ) : contentDocs.length > 0 ? (
              <TableContainer component={Paper}>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Type</TableCell>
                      <TableCell>Title/Subject</TableCell>
                      <TableCell>Uploader</TableCell>
                      <TableCell>Uploaded At</TableCell>
                      <TableCell>File</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {contentDocs.map((doc) => (
                      <TableRow key={doc._id}>
                        <TableCell>{doc.type}</TableCell>
                        <TableCell>{doc.subject}</TableCell>
                        <TableCell>{doc.uploader?.name}</TableCell>
                        <TableCell>{new Date(doc.createdAt).toLocaleString()}</TableCell>
                        <TableCell>
                          <Button size="small" href={backendUrl + doc.fileUrl} target="_blank" variant="outlined">View</Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            ) : null}
          </TabPanel>
          <TabPanel value={tab} index={3}>
            <Typography variant="h6" gutterBottom>
              All Uploaded Resources
            </Typography>
            {uploadsLoading ? (
              <CircularProgress />
            ) : uploadsError ? (
              <Alert severity="error">{uploadsError}</Alert>
            ) : uploads.length === 0 ? (
              <Alert severity="info">No uploads found.</Alert>
            ) : (
              <TableContainer component={Paper}>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Type</TableCell>
                      <TableCell>Subject</TableCell>
                      <TableCell>Branch</TableCell>
                      <TableCell>Semester</TableCell>
                      <TableCell>Uploader Name</TableCell>
                      <TableCell>Uploader Email</TableCell>
                      <TableCell>Status</TableCell>
                      <TableCell>Uploaded At</TableCell>
                      <TableCell>File</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {uploads.map((doc) => (
                      <TableRow key={doc._id}>
                        <TableCell>{doc.type}</TableCell>
                        <TableCell>{doc.subject?.name || doc.subject}</TableCell>
                        <TableCell>{doc.branch?.name || doc.branch}</TableCell>
                        <TableCell>{doc.semester?.name || doc.semester?.number || doc.semester}</TableCell>
                        <TableCell>{doc.uploader?.name}</TableCell>
                        <TableCell>{doc.uploader?.email}</TableCell>
                        <TableCell>
                          <Chip label={doc.status} color={doc.status === 'pending' ? 'warning' : doc.status === 'approved' ? 'success' : doc.status === 'rejected' ? 'error' : 'info'} />
                        </TableCell>
                        <TableCell>{new Date(doc.createdAt).toLocaleString()}</TableCell>
                        <TableCell>
                          <Button size="small" href={backendUrl + doc.fileUrl} target="_blank" variant="outlined">View</Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            )}
          </TabPanel>
        </Paper>
      </Box>

      {/* User Details Modal */}
      <Dialog open={!!selectedUser} onClose={() => setSelectedUser(null)} maxWidth="xs" fullWidth>
        <DialogTitle>User Details</DialogTitle>
        <DialogContent>
          {selectedUser && (
            <Box>
              <Typography><b>Name:</b> {selectedUser.name}</Typography>
              <Typography><b>Email:</b> {selectedUser.email}</Typography>
              <Typography><b>Branch:</b> {selectedUser.branch}</Typography>
              <Typography><b>College:</b> {selectedUser.college}</Typography>
              <Typography><b>Status:</b> <Chip label={selectedUser.status} color={selectedUser.status === 'pending' ? 'warning' : selectedUser.status === 'approved' ? 'success' : 'error'} /></Typography>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          {selectedUser && selectedUser.status === 'pending' && (
            <>
              <Button color="success" variant="contained" onClick={() => handleConfirm('approve')}>
                Approve
              </Button>
              <Button color="error" variant="contained" onClick={() => handleConfirm('reject')}>
                Reject
              </Button>
            </>
          )}
          <Button onClick={() => setSelectedUser(null)}>Close</Button>
        </DialogActions>
      </Dialog>

      {/* Confirmation Dialog */}
      <Dialog open={confirmOpen} onClose={() => setConfirmOpen(false)}>
        <DialogTitle>Confirm {confirmAction === 'approve' ? 'Approval' : 'Rejection'}</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to {confirmAction} this user?
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setConfirmOpen(false)}>Cancel</Button>
          <Button color={confirmAction === 'approve' ? 'success' : 'error'} variant="contained" onClick={handleApproveReject}>
            Yes, {confirmAction === 'approve' ? 'Approve' : 'Reject'}
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default Admin; 