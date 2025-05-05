import { useState, useContext } from 'react';
import { useNavigate, Link as RouterLink } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import {
    Container,
    Paper,
    Typography,
    TextField,
    Button,
    Box,
    Grid,
    Alert,
    Divider,
    CircularProgress
} from '@mui/material';
import { Google as GoogleIcon } from '@mui/icons-material';
import { useFormik } from 'formik';
import * as Yup from 'yup';

const Login = () => {
    const { login, googleLogin, error, loading } = useContext(AuthContext);
    const [loginError, setLoginError] = useState(null);
    const navigate = useNavigate();

    // Form validation schema
    const validationSchema = Yup.object({
        email: Yup.string()
            .email('Invalid email address')
            .required('Email is required'),
        password: Yup.string()
            .required('Password is required')
    });

    // Formik setup
    const formik = useFormik({
        initialValues: {
            email: '',
            password: ''
        },
        validationSchema,
        onSubmit: async (values) => {
            try {
                await login(values);
                navigate('/');
            } catch (err) {
                setLoginError(err.response?.data?.message || 'Login failed. Please try again.');
            }
        }
    });

    // Google login handler
    const handleGoogleLogin = async () => {
        try {
            // This would normally use the Google API to get an ID token
            // For demo purposes, we'll just show a message
            alert('Google login would be implemented here with Google Auth API');

            // In a real implementation:
            // 1. Load the Google API client
            // 2. Get the ID token
            // 3. Send to our backend
            // await googleLogin(idToken);
            // navigate('/');
        } catch (err) {
            setLoginError('Google login failed. Please try again.');
        }
    };

    return (
        <Container maxWidth="sm">
            <Paper elevation={3} sx={{ mt: 8, p: 4 }}>
                <Typography variant="h4" component="h1" align="center" gutterBottom>
                    Login
                </Typography>

                {(loginError || error) && (
                    <Alert severity="error" sx={{ mb: 2 }}>
                        {loginError || error}
                    </Alert>
                )}

                <form onSubmit={formik.handleSubmit}>
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
                    />

                    <TextField
                        fullWidth
                        id="password"
                        name="password"
                        label="Password"
                        type="password"
                        variant="outlined"
                        margin="normal"
                        value={formik.values.password}
                        onChange={formik.handleChange}
                        onBlur={formik.handleBlur}
                        error={formik.touched.password && Boolean(formik.errors.password)}
                        helperText={formik.touched.password && formik.errors.password}
                    />

                    <Button
                        type="submit"
                        fullWidth
                        variant="contained"
                        color="primary"
                        size="large"
                        sx={{ mt: 3, mb: 2 }}
                        disabled={loading}
                    >
                        {loading ? <CircularProgress size={24} /> : 'Login'}
                    </Button>
                </form>

                <Divider sx={{ my: 3 }}>OR</Divider>

                <Button
                    fullWidth
                    variant="outlined"
                    color="primary"
                    size="large"
                    startIcon={<GoogleIcon />}
                    onClick={handleGoogleLogin}
                    disabled={loading}
                >
                    Continue with Google
                </Button>

                <Box mt={3} textAlign="center">
                    <Typography variant="body2">
                        Don't have an account?{' '}
                        <RouterLink to="/register" style={{ textDecoration: 'none' }}>
                            Register
                        </RouterLink>
                    </Typography>
                </Box>
            </Paper>
        </Container>
    );
};

export default Login;