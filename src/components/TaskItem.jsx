import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Paper,
    Typography,
    Box,
    Chip,
    IconButton,
    Checkbox,
    Tooltip,
    Grid,
    LinearProgress,
    Menu,
    MenuItem,
    ListItemIcon,
    ListItemText
} from '@mui/material';
import {
    Edit as EditIcon,
    Delete as DeleteIcon,
    MoreVert as MoreIcon,
    AttachFile as AttachmentIcon,
    Event as CalendarIcon,
    Flag as FlagIcon,
    Visibility as ViewIcon,
    Add as AddIcon,
    AccessTime as TimeIcon
} from '@mui/icons-material';
import { format, isPast, isToday } from 'date-fns';

const TaskItem = ({ task }) => {
    const navigate = useNavigate();
    const [anchorEl, setAnchorEl] = useState(null);
    const [hovering, setHovering] = useState(false);

    const handleMenuOpen = (event) => {
        setAnchorEl(event.currentTarget);
        event.stopPropagation();
    };

    const handleMenuClose = (event) => {
        if (event) {
            event.stopPropagation();
        }
        setAnchorEl(null);
    };

    const handleViewTask = (event) => {
        event.stopPropagation();
        handleMenuClose();
        navigate(`/tasks/${task._id}`);
    };

    const handleEditTask = (event) => {
        event.stopPropagation();
        handleMenuClose();
        navigate(`/tasks/${task._id}?edit=true`);
    };

    const handleTaskClick = () => {
        navigate(`/tasks/${task._id}`);
    };

    // Helper functions for visual elements
    const getStatusColor = (status) => {
        switch (status) {
            case 'completed':
                return 'success';
            case 'in-progress':
                return 'info';
            default:
                return 'warning';
        }
    };

    const getPriorityColor = (priority) => {
        switch (priority) {
            case 'high':
                return 'error';
            case 'medium':
                return 'warning';
            default:
                return 'info';
        }
    };

    const getProgressValue = (status) => {
        switch (status) {
            case 'completed':
                return 100;
            case 'in-progress':
                return 50;
            default:
                return 0;
        }
    };

    const isDueDatePast = () => {
        if (!task.dueDate) return false;
        return isPast(new Date(task.dueDate)) && task.status !== 'completed';
    };

    const isDueDateToday = () => {
        if (!task.dueDate) return false;
        return isToday(new Date(task.dueDate));
    };

    const getDueDateColor = () => {
        if (isDueDatePast()) return 'error';
        if (isDueDateToday()) return 'warning';
        return 'default';
    };

    return (
        <Paper
            sx={{
                p: 2,
                mb: 2,
                cursor: 'pointer',
                transition: 'transform 0.2s, box-shadow 0.2s',
                position: 'relative',
                borderLeft: task.category
                    ? `5px solid ${task.category.color}`
                    : 'none',
                '&:hover': {
                    transform: 'translateY(-2px)',
                    boxShadow: 3
                }
            }}
            onClick={handleTaskClick}
            onMouseEnter={() => setHovering(true)}
            onMouseLeave={() => setHovering(false)}
        >
            <Grid container spacing={2} alignItems="center">
                <Grid item xs={12} sm={8}>
                    <Box sx={{ display: 'flex', alignItems: 'flex-start' }}>
                        <Checkbox
                            checked={task.status === 'completed'}
                            sx={{
                                mt: -0.5,
                                mr: 1,
                                opacity: task.status === 'completed' ? 1 : 0.7
                            }}
                            onClick={(e) => e.stopPropagation()}
                        />
                        <Box>
                            <Typography
                                variant="h6"
                                component="h3"
                                sx={{
                                    textDecoration: task.status === 'completed' ? 'line-through' : 'none',
                                    color: task.status === 'completed' ? 'text.secondary' : 'text.primary',
                                    mb: 0.5
                                }}
                            >
                                {task.title}
                            </Typography>

                            {task.description && (
                                <Typography
                                    variant="body2"
                                    color="text.secondary"
                                    sx={{
                                        mb: 1,
                                        overflow: 'hidden',
                                        textOverflow: 'ellipsis',
                                        display: '-webkit-box',
                                        WebkitLineClamp: 2,
                                        WebkitBoxOrient: 'vertical'
                                    }}
                                >
                                    {task.description}
                                </Typography>
                            )}

                            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mt: 1 }}>
                                <Chip
                                    label={task.status}
                                    size="small"
                                    color={getStatusColor(task.status)}
                                />

                                <Chip
                                    icon={<FlagIcon />}
                                    label={task.priority}
                                    size="small"
                                    color={getPriorityColor(task.priority)}
                                />

                                {task.category && (
                                    <Chip
                                        label={task.category.name}
                                        size="small"
                                        sx={{ bgcolor: task.category.color, color: '#fff' }}
                                    />
                                )}

                                {task.attachments && task.attachments.length > 0 && (
                                    <Tooltip title={`${task.attachments.length} attachment(s)`}>
                                        <Chip
                                            icon={<AttachmentIcon />}
                                            label={task.attachments.length}
                                            size="small"
                                            variant="outlined"
                                        />
                                    </Tooltip>
                                )}

                                {task.googleCalendarEventId && (
                                    <Tooltip title="Added to Google Calendar">
                                        <Chip
                                            icon={<CalendarIcon />}
                                            label="Calendar"
                                            size="small"
                                            variant="outlined"
                                            color="primary"
                                        />
                                    </Tooltip>
                                )}
                            </Box>
                        </Box>
                    </Box>
                </Grid>

                <Grid item xs={12} sm={4}>
                    <Box sx={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center' }}>
                        {task.dueDate && (
                            <Tooltip title={isDueDatePast() ? "Overdue" : (isDueDateToday() ? "Due today" : "Due date")}>
                                <Chip
                                    icon={<TimeIcon />}
                                    label={format(new Date(task.dueDate), 'MMM d')}
                                    size="small"
                                    color={getDueDateColor()}
                                    sx={{ mr: 1 }}
                                />
                            </Tooltip>
                        )}

                        <IconButton
                            size="small"
                            onClick={handleMenuOpen}
                            sx={{ ml: 'auto' }}
                        >
                            <MoreIcon />
                        </IconButton>
                    </Box>

                    <Box sx={{ mt: 1.5 }}>
                        <LinearProgress
                            variant="determinate"
                            value={getProgressValue(task.status)}
                            sx={{ height: 4, borderRadius: 2 }}
                            color={getStatusColor(task.status)}
                        />
                    </Box>
                </Grid>
            </Grid>

            <Menu
                anchorEl={anchorEl}
                open={Boolean(anchorEl)}
                onClose={handleMenuClose}
                onClick={(e) => e.stopPropagation()}
            >
                <MenuItem onClick={handleViewTask}>
                    <ListItemIcon>
                        <ViewIcon fontSize="small" />
                    </ListItemIcon>
                    <ListItemText>View Details</ListItemText>
                </MenuItem>

                <MenuItem onClick={handleEditTask}>
                    <ListItemIcon>
                        <EditIcon fontSize="small" />
                    </ListItemIcon>
                    <ListItemText>Edit Task</ListItemText>
                </MenuItem>

                {task.dueDate && !task.googleCalendarEventId && (
                    <MenuItem onClick={(e) => {
                        e.stopPropagation();
                        handleMenuClose();
                        // Add to calendar logic would go here
                    }}>
                        <ListItemIcon>
                            <AddIcon fontSize="small" />
                        </ListItemIcon>
                        <ListItemText>Add to Calendar</ListItemText>
                    </MenuItem>
                )}
            </Menu>
        </Paper>
    );
};

export default TaskItem;