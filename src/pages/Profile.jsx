import { useState, useContext } from 'react';
import {
    Container,
    Paper,
    Typography,
    TextField,
    Button,
    Box,
    Grid,
    Avatar,
    Divider,
    Alert,
    CircularProgress,
    Switch,
    FormControlLabel,
    List,
    ListItem,
    ListItemText,
    ListItemIcon,
    IconButton,
    Snackbar
} from '@mui/material';
import {
    Save as SaveIcon,
    Email as EmailIcon,
    Person as PersonIcon,
    Key as KeyIcon,
    Google as GoogleIcon,
    Sync as SyncIcon,
    Delete as DeleteIcon,
    Palette as PaletteIcon
} from '@mui/icons-material';
import { AuthContext } from '../context/AuthContext';
import { useFormik } from 'formik';
import * as Yup from 'yup';

const Profile = () => {
    const { currentUser, error: authError, loading } = useContext(AuthContext);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(null);
    const [showSnackbar, setShowSnackbar] = useState(false);
    const [emailNotifications, setEmailNotifications] = useState(true);

    // Form validation schema
    const validationSchema = Yup.object({
        name: Yup.string()
            .required('Name is required')
            .min(2, 'Name must be at least 2 characters'),
        email: Yup.string()
            .email('Invalid email address')
            .required('Email is required'),
        currentPassword: Yup.string()
            .min(6, 'Password must be at least 6 characters'),
        newPassword: Yup.string()
            .min(6, 'Password must be at least 6 characters'),
        confirmNewPassword: Yup.string()
            .oneOf([Yup.ref('newPassword'), null], 'Passwords must match')
    });

    // Formik setup
    const formik = useFormik({
        initialValues: {
            name: currentUser?.name || '',
            email: currentUser?.email || '',
            currentPassword: '',
            newPassword: '',
            confirmNewPassword: ''
        },
        validationSchema,
        enableReinitialize: true,
        onSubmit: async (values) => {
            try {
                // For demo purposes, we'll just show a success message
                setSuccess('Profile updated successfully');
                setShowSnackbar(true);

                // Reset password fields
                formik.setFieldValue('currentPassword', '', false);
                formik.setFieldValue('newPassword', '', false);
                formik.setFieldValue('confirmNewPassword', '', false);
            } catch (err) {
                console.error('Error updating profile:', err);
                setError('Failed to update profile');
                setShowSnackbar(true);
            }
        }
    });

    const handleConnectGoogle = () => {
        // This would integrate with Google API
        setSuccess('Google account connected successfully');
        setShowSnackbar(true);
    };

    const handleSyncCalendar = () => {
        // This would sync with Google Calendar
        setSuccess('Calendar synced successfully');
        setShowSnackbar(true);
    };

    const handleDeleteAccount = () => {
        if (window.confirm('Are you sure you want to delete your account? This action cannot be undone.')) {
            // This would delete the account
            setSuccess('Account deleted successfully');
            setShowSnackbar(true);
        }
    };

    const handleToggleEmailNotifications = () => {
        setEmailNotifications(!emailNotifications);
        setSuccess('Notification settings updated');
        setShowSnackbar(true);
    };

    const handleCloseSnackbar = () => {
        setShowSnackbar(false);
    };

    return (
        <Container maxWidth="md" sx={{ mt: 4, mb: 4 }}>
            {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
            {authError && <Alert severity="error" sx={{ mb: 2 }}>{authError}</Alert>}

            <Typography variant="h4" component="h1" gutterBottom>
                Your Profile
            </Typography>

            <Grid container spacing={3}>
                <Grid item xs={12} md={4}>
                    <Paper sx={{ p: 3, textAlign: 'center' }}>
                        <Avatar
                            sx={{
                                width: 100,
                                height: 100,
                                mx: 'auto',
                                mb: 2,
                                bgcolor: 'primary.main'
                            }}
                        >
                            {currentUser?.name?.charAt(0)?.toUpperCase() || 'U'}
                        </Avatar>

                        <Typography variant="h6">{currentUser?.name}</Typography>
                        <Typography variant="body2" color="text.secondary" gutterBottom>
                            {currentUser?.email}
                        </Typography>

                        <Button
                            variant="outlined"
                            size="small"
                            sx={{ mt: 2 }}
                        >
                            Change Avatar
                        </Button>

                        <List sx={{ mt: 3, textAlign: 'left' }}>
                            <ListItem>
                                <ListItemIcon>
                                    <GoogleIcon />
                                </ListItemIcon>
                                <ListItemText
                                    primary="Google Account"
                                    secondary={currentUser?.googleId ? "Connected" : "Not connected"}
                                />
                                {!currentUser?.googleId && (
                                    <Button
                                        variant="outlined"
                                        size="small"
                                        onClick={handleConnectGoogle}
                                    >
                                        Connect
                                    </Button>
                                )}
                            </ListItem>
                        </List>
                    </Paper>
                </Grid>

                <Grid item xs={12} md={8}>
                    <Paper sx={{ p: 3 }}>
                        <Typography variant="h6" gutterBottom>
                            Edit Profile
                        </Typography>

                        <form onSubmit={formik.handleSubmit}>
                            <TextField
                                fullWidth
                                id="name"
                                name="name"
                                label="Full Name"
                                variant="outlined"
                                margin="normal"
                                value={formik.values.name}
                                onChange={formik.handleChange}
                                onBlur={formik.handleBlur}
                                error={formik.touched.name && Boolean(formik.errors.name)}
                                helperText={formik.touched.name && formik.errors.name}
                                InputProps={{
                                    startAdornment: <PersonIcon color="action" sx={{ mr: 1 }} />
                                }}
                            />

                            <TextField
                                fullWidth
                                id="email"
                                name="email"
                                label="Email"
                                variant="outlined"
                                margin="normal"
                                value={formik.values.email}
                                onChange={formik.handleChange}
                                onBlur={formik.handleBlur}
                                error={formik.touched.email && Boolean(formik.errors.email)}
                                helperText={formik.touched.email && formik.errors.email}
                                InputProps={{
                                    startAdornment: <EmailIcon color="action" sx={{ mr: 1 }} />
                                }}
                            />

                            <Divider sx={{ my: 3 }} />

                            <Typography variant="h6" gutterBottom>
                                Change Password
                            </Typography>

                            <TextField
                                fullWidth
                                id="currentPassword"
                                name="currentPassword"
                                label="Current Password"
                                type="password"
                                variant="outlined"
                                margin="normal"
                                value={formik.values.currentPassword}
                                onChange={formik.handleChange}
                                onBlur={formik.handleBlur}
                                error={formik.touched.currentPassword && Boolean(formik.errors.currentPassword)}
                                helperText={formik.touched.currentPassword && formik.errors.currentPassword}
                                InputProps={{
                                    startAdornment: <KeyIcon color="action" sx={{ mr: 1 }} />
                                }}
                            />

                            <TextField
                                fullWidth
                                id="newPassword"
                                name="newPassword"
                                label="New Password"
                                type="password"
                                variant="outlined"
                                margin="normal"
                                value={formik.values.newPassword}
                                onChange={formik.handleChange}
                                onBlur={formik.handleBlur}
                                error={formik.touched.newPassword && Boolean(formik.errors.newPassword)}
                                helperText={formik.touched.newPassword && formik.errors.newPassword}
                                InputProps={{
                                    startAdornment: <KeyIcon color="action" sx={{ mr: 1 }} />
                                }}
                            />

                            <TextField
                                fullWidth
                                id="confirmNewPassword"
                                name="confirmNewPassword"
                                label="Confirm New Password"
                                type="password"
                                variant="outlined"
                                margin="normal"
                                value={formik.values.confirmNewPassword}
                                onChange={formik.handleChange}
                                onBlur={formik.handleBlur}
                                error={formik.touched.confirmNewPassword && Boolean(formik.errors.confirmNewPassword)}
                                helperText={formik.touched.confirmNewPassword && formik.errors.confirmNewPassword}
                                InputProps={{
                                    startAdornment: <KeyIcon color="action" sx={{ mr: 1 }} />
                                }}
                            />

                            <Box sx={{ mt: 3, display: 'flex', justifyContent: 'flex-end' }}>
                                <Button
                                    type="submit"
                                    variant="contained"
                                    color="primary"
                                    startIcon={<SaveIcon />}
                                    disabled={loading}
                                >
                                    {loading ? <CircularProgress size={24} /> : 'Save Changes'}
                                </Button>
                            </Box>
                        </form>
                    </Paper>

                    <Paper sx={{ p: 3, mt: 3 }}>
                        <Typography variant="h6" gutterBottom>
                            Settings
                        </Typography>

                        <List>
                            <ListItem>
                                <ListItemIcon>
                                    <EmailIcon />
                                </ListItemIcon>
                                <ListItemText primary="Email Notifications" />
                                <FormControlLabel
                                    control={
                                        <Switch
                                            checked={emailNotifications}
                                            onChange={handleToggleEmailNotifications}
                                            color="primary"
                                        />
                                    }
                                    label=""
                                />
                            </ListItem>

                            <ListItem>
                                <ListItemIcon>
                                    <SyncIcon />
                                </ListItemIcon>
                                <ListItemText primary="Sync with Google Calendar" />
                                <Button
                                    variant="outlined"
                                    size="small"
                                    onClick={handleSyncCalendar}
                                >
                                    Sync Now
                                </Button>
                            </ListItem>

                            <ListItem>
                                <ListItemIcon>
                                    <PaletteIcon />
                                </ListItemIcon>
                                <ListItemText primary="Theme Settings" />
                                <Button
                                    variant="outlined"
                                    size="small"
                                    onClick={() => { }}
                                >
                                    Customize
                                </Button>
                            </ListItem>
                        </List>
                    </Paper>

                    <Paper sx={{ p: 3, mt: 3, bgcolor: '#ffebee' }}>
                        <Typography variant="h6" gutterBottom color="error">
                            Danger Zone
                        </Typography>
                        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                            <Typography variant="body2">
                                Delete your account and all your data
                            </Typography>
                            <Button
                                variant="outlined"
                                color="error"
                                startIcon={<DeleteIcon />}
                                onClick={handleDeleteAccount}
                            >
                                Delete Account
                            </Button>
                        </Box>
                    </Paper>
                </Grid>
            </Grid>

            <Snackbar
                open={showSnackbar}
                autoHideDuration={6000}
                onClose={handleCloseSnackbar}
                message={success || error || authError}
            />
        </Container>
    );
};

export default Profile;