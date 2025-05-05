import { useState, useContext } from 'react';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import {
    AppBar,
    Toolbar,
    Typography,
    Button,
    IconButton,
    Avatar,
    Menu,
    MenuItem,
    Tooltip,
    Box,
    Switch
} from '@mui/material';
import {
    Menu as MenuIcon,
    Brightness4 as DarkModeIcon,
    Brightness7 as LightModeIcon
} from '@mui/icons-material';
import { AuthContext } from '../context/AuthContext';

const Header = ({ darkMode, toggleDarkMode }) => {
    const [anchorEl, setAnchorEl] = useState(null);
    const { currentUser, isAuthenticated, logout } = useContext(AuthContext);
    const navigate = useNavigate();

    const handleMenuOpen = (event) => {
        setAnchorEl(event.currentTarget);
    };

    const handleMenuClose = () => {
        setAnchorEl(null);
    };

    const handleLogout = () => {
        logout();
        handleMenuClose();
        navigate('/login');
    };

    const handleProfile = () => {
        handleMenuClose();
        navigate('/profile');
    };

    return (
        <AppBar position="static">
            <Toolbar>
                <Typography variant="h6" component={RouterLink} to="/" color="inherit" sx={{ flexGrow: 1, textDecoration: 'none' }}>
                    Task Master
                </Typography>

                {/* Theme toggle */}
                <Box sx={{ display: 'flex', alignItems: 'center', mr: 2 }}>
                    <Tooltip title={darkMode ? "Switch to Light Mode" : "Switch to Dark Mode"}>
                        <IconButton color="inherit" onClick={toggleDarkMode} size="small">
                            {darkMode ? <LightModeIcon /> : <DarkModeIcon />}
                        </IconButton>
                    </Tooltip>
                </Box>

                {isAuthenticated ? (
                    <>
                        <Button
                            color="inherit"
                            component={RouterLink}
                            to="/"
                            sx={{ mr: 1 }}
                        >
                            Dashboard
                        </Button>
                        <Tooltip title="Account menu">
                            <IconButton
                                onClick={handleMenuOpen}
                                size="small"
                                edge="end"
                                color="inherit"
                            >
                                <Avatar
                                    alt={currentUser?.name}
                                    src="/static/avatar.jpg"
                                    sx={{ width: 32, height: 32 }}
                                >
                                    {currentUser?.name?.charAt(0).toUpperCase()}
                                </Avatar>
                            </IconButton>
                        </Tooltip>
                        <Menu
                            anchorEl={anchorEl}
                            open={Boolean(anchorEl)}
                            onClose={handleMenuClose}
                            PaperProps={{
                                elevation: 0,
                                sx: {
                                    overflow: 'visible',
                                    filter: 'drop-shadow(0px 2px 8px rgba(0,0,0,0.32))',
                                    mt: 1.5,
                                }
                            }}
                            transformOrigin={{ horizontal: 'right', vertical: 'top' }}
                            anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
                        >
                            <MenuItem onClick={handleProfile}>Profile</MenuItem>
                            <MenuItem onClick={handleLogout}>Logout</MenuItem>
                        </Menu>
                    </>
                ) : (
                    <>
                        <Button
                            color="inherit"
                            component={RouterLink}
                            to="/login"
                            sx={{ mr: 1 }}
                        >
                            Login
                        </Button>
                        <Button
                            color="inherit"
                            component={RouterLink}
                            to="/register"
                        >
                            Register
                        </Button>
                    </>
                )}
            </Toolbar>
        </AppBar>
    );
};

export default Header;