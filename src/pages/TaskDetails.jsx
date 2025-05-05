import { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { 
  Container,
  Paper,
  Typography,
  Box,
  Grid,
  Chip,
  IconButton,
  Button,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  CircularProgress,
  Alert,
  Divider,
  Avatar,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  ListItemAvatar,
  FormControlLabel,
  Switch
} from '@mui/material';
import { 
  Edit as EditIcon,
  Delete as DeleteIcon,
  Save as SaveIcon,
  Cancel as CancelIcon,
  CloudDownload as DownloadIcon,
  Event as CalendarIcon,
  EventBusy as CalendarRemoveIcon,
  Flag as FlagIcon,
  Label as LabelIcon,
  AccessTime as TimeIcon,
  Description as DescriptionIcon,
  AttachFile as AttachmentIcon,
  ArrowBack as BackIcon
} from '@mui/icons-material';
import { format } from 'date-fns';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { useDropzone } from 'react-dropzone';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { LocalizationProvider, DatePicker } from '@mui/x-date-pickers';
import { TaskContext } from '../context/TaskContext';

const TaskDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const editMode = searchParams.get('edit') === 'true';
  
  const [task, setTask] = useState(null);
  const [isEditing, setIsEditing] = useState(editMode);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [success, setSuccess] = useState(null);
  
  const { 
    categories,
    getTaskById, 
    updateTask, 
    deleteTask, 
    addTaskToCalendar, 
    removeTaskFromCalendar,
    removeAttachment,
    loading, 
    error 
  } = useContext(TaskContext);

  // Fetch task data
  useEffect(() => {
    const fetchTask = async () => {
      try {
        const taskData = await getTaskById(id);
        setTask(taskData);
      } catch (err) {
        console.error('Error fetching task:', err);
      }
    };
    
    fetchTask();
  }, [id, getTaskById]);

  // Task form validation schema
  const validationSchema = Yup.object({
    title: Yup.string()
      .required('Title is required')
      .min(3, 'Title must be at least 3 characters'),
    description: Yup.string(),
    status: Yup.string()
      .required('Status is required'),
    priority: Yup.string()
      .required('Priority is required'),
    categoryId: Yup.string()
  });

  // Formik setup
  const formik = useFormik({
    initialValues: {
      title: task?.title || '',
      description: task?.description || '',
      status: task?.status || 'pending',
      priority: task?.priority || 'medium',
      categoryId: task?.category?._id || '',
      dueDate: task?.dueDate ? new Date(task.dueDate) : null,
      addToCalendar: false
    },
    validationSchema,
    enableReinitialize: true,
    onSubmit: async (values) => {
      try {
        await updateTask(id, values, selectedFiles);
        setIsEditing(false);
        setSuccess('Task updated successfully');
        
        // Refresh task data
        const updatedTask = await getTaskById(id);
        setTask(updatedTask);
        
        // Clear selected files
        setSelectedFiles([]);
      } catch (err) {
        console.error('Error updating task:', err);
      }
    }
  });

  // File dropzone setup
  const { getRootProps, getInputProps } = useDropzone({
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png', '.gif'],
      'application/pdf': ['.pdf']
    },
    onDrop: acceptedFiles => {
      setSelectedFiles(acceptedFiles.map(file => Object.assign(file, {
        preview: URL.createObjectURL(file)
      })));
    }
  });

  // Clean up file previews
  useEffect(() => {
    return () => {
      selectedFiles.forEach(file => URL.revokeObjectURL(file.preview));
    };
  }, [selectedFiles]);

  // Handle task deletion
  const handleDelete = async () => {
    try {
      await deleteTask(id);
      navigate('/');
    } catch (err) {
      console.error('Error deleting task:', err);
    }
  };

  // Handle attachment deletion
  const handleDeleteAttachment = async (attachmentId) => {
    try {
      await removeAttachment(id, attachmentId);
      
      // Refresh task data
      const updatedTask = await getTaskById(id);
      setTask(updatedTask);
      
      setSuccess('Attachment removed successfully');
    } catch (err) {
      console.error('Error removing attachment:', err);
    }
  };

  // Handle calendar integration
  const handleAddToCalendar = async () => {
    try {
      await addTaskToCalendar(id);
      
      // Refresh task data
      const updatedTask = await getTaskById(id);
      setTask(updatedTask);
      
      setSuccess('Task added to Google Calendar');
    } catch (err) {
      console.error('Error adding to calendar:', err);
    }
  };

  const handleRemoveFromCalendar = async () => {
    try {
      await removeTaskFromCalendar(id);
      
      // Refresh task data
      const updatedTask = await getTaskById(id);
      setTask(updatedTask);
      
      setSuccess('Task removed from Google Calendar');
    } catch (err) {
      console.error('Error removing from calendar:', err);
    }
  };

  // Helper functions for status colors
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

  if (loading && !task) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (!task && !loading) {
    return (
      <Container maxWidth="md" sx={{ py: 4 }}>
        <Alert severity="error">Task not found</Alert>
        <Button 
          startIcon={<BackIcon />} 
          onClick={() => navigate(-1)} 
          sx={{ mt: 2 }}
        >
          Go Back
        </Button>
      </Container>
    );
  }

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
      {success && <Alert severity="success" sx={{ mb: 2 }}>{success}</Alert>}
      
      <Box sx={{ mb: 3, display: 'flex', alignItems: 'center' }}>
        <Button 
          startIcon={<BackIcon />} 
          onClick={() => navigate(-1)} 
          sx={{ mr: 2 }}
        >
          Back
        </Button>
        
        <Typography variant="h4" component="h1" sx={{ flexGrow: 1 }}>
          {isEditing ? 'Edit Task' : 'Task Details'}
        </Typography>
        
        {!isEditing ? (
          <Box>
            <IconButton 
              color="primary" 
              onClick={() => setIsEditing(true)}
              sx={{ mr: 1 }}
            >
              <EditIcon />
            </IconButton>
            <IconButton 
              color="error" 
              onClick={() => setConfirmDelete(true)}
            >
              <DeleteIcon />
            </IconButton>
          </Box>
        ) : (
          <Box>
            <Button 
              startIcon={<CancelIcon />} 
              onClick={() => setIsEditing(false)} 
              sx={{ mr: 1 }}
            >
              Cancel
            </Button>
          </Box>
        )}
      </Box>
      
      {isEditing ? (
        // Edit Mode
        <Paper sx={{ p: 3 }}>
          <form onSubmit={formik.handleSubmit}>
            <TextField
              fullWidth
              id="title"
              name="title"
              label="Task Title"
              variant="outlined"
              margin="normal"
              value={formik.values.title}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              error={formik.touched.title && Boolean(formik.errors.title)}
              helperText={formik.touched.title && formik.errors.title}
            />
            
            <TextField
              fullWidth
              id="description"
              name="description"
              label="Description"
              variant="outlined"
              margin="normal"
              multiline
              rows={4}
              value={formik.values.description}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              error={formik.touched.description && Boolean(formik.errors.description)}
              helperText={formik.touched.description && formik.errors.description}
            />
            
            <Grid container spacing={2} sx={{ mt: 1 }}>
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth>
                  <InputLabel id="status-label">Status</InputLabel>
                  <Select
                    labelId="status-label"
                    id="status"
                    name="status"
                    value={formik.values.status}
                    onChange={formik.handleChange}
                    label="Status"
                  >
                    <MenuItem value="pending">Pending</MenuItem>
                    <MenuItem value="in-progress">In Progress</MenuItem>
                    <MenuItem value="completed">Completed</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth>
                  <InputLabel id="priority-label">Priority</InputLabel>
                  <Select
                    labelId="priority-label"
                    id="priority"
                    name="priority"
                    value={formik.values.priority}
                    onChange={formik.handleChange}
                    label="Priority"
                  >
                    <MenuItem value="low">Low</MenuItem>
                    <MenuItem value="medium">Medium</MenuItem>
                    <MenuItem value="high">High</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
            </Grid>
            
            <Grid container spacing={2} sx={{ mt: 1 }}>
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth>
                  <InputLabel id="category-label">Category</InputLabel>
                  <Select
                    labelId="category-label"
                    id="categoryId"
                    name="categoryId"
                    value={formik.values.categoryId}
                    onChange={formik.handleChange}
                    label="Category"
                  >
                    <MenuItem value="">None</MenuItem>
                    {categories.map((category) => (
                      <MenuItem key={category._id} value={category._id}>
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          <Box 
                            sx={{ 
                              width: 12, 
                              height: 12, 
                              borderRadius: '50%', 
                              bgcolor: category.color,
                              mr: 1
                            }} 
                          />
                          {category.name}
                        </Box>
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <LocalizationProvider dateAdapter={AdapterDateFns}>
                  <DatePicker
                    label="Due Date"
                    value={formik.values.dueDate}
                    onChange={(date) => {
                      formik.setFieldValue('dueDate', date);
                    }}
                    renderInput={(params) => <TextField {...params} fullWidth />}
                  />
                </LocalizationProvider>
              </Grid>
            </Grid>
            
            {formik.values.dueDate && !task.googleCalendarEventId && (
              <FormControlLabel
                control={
                  <Switch
                    checked={formik.values.addToCalendar}
                    onChange={(e) => {
                      formik.setFieldValue('addToCalendar', e.target.checked);
                    }}
                    name="addToCalendar"
                  />
                }
                label="Add to Google Calendar"
                sx={{ mt: 2 }}
              />
            )}
            
            <Box sx={{ mt: 3, mb: 1 }}>
              <Typography variant="subtitle1" gutterBottom>
                Attachments
              </Typography>
              <Paper
                {...getRootProps()}
                sx={{
                  border: '2px dashed #ccc',
                  borderRadius: 2,
                  p: 3,
                  textAlign: 'center',
                  cursor: 'pointer',
                  '&:hover': {
                    borderColor: 'primary.main'
                  }
                }}
              >
                <input {...getInputProps()} />
                <Typography>
                  Drag & drop files here, or click to select files
                </Typography>
                <Typography variant="caption" display="block" color="textSecondary">
                  Supports PDF, JPG, PNG (Max 10MB)
                </Typography>
              </Paper>
              
              {selectedFiles.length > 0 && (
                <Box sx={{ mt: 2 }}>
                  <Typography variant="subtitle2" gutterBottom>
                    New files to upload:
                  </Typography>
                  {selectedFiles.map(file => (
                    <Chip
                      key={file.name}
                      label={file.name}
                      variant="outlined"
                      size="small"
                      sx={{ mr: 1, mb: 1 }}
                      onDelete={() => {
                        setSelectedFiles(files => files.filter(f => f !== file));
                      }}
                    />
                  ))}
                </Box>
              )}
              
              {task.attachments && task.attachments.length > 0 && (
                <Box sx={{ mt: 2 }}>
                  <Typography variant="subtitle2" gutterBottom>
                    Current attachments:
                  </Typography>
                  <List>
                    {task.attachments.map((attachment) => (
                      <ListItem
                        key={attachment._id}
                        secondaryAction={
                          <IconButton 
                            edge="end" 
                            aria-label="delete"
                            onClick={() => handleDeleteAttachment(attachment._id)}
                          >
                            <DeleteIcon />
                          </IconButton>
                        }
                      >
                        <ListItemIcon>
                          <AttachmentIcon />
                        </ListItemIcon>
                        <ListItemText
                          primary={attachment.originalName}
                          secondary={`${(attachment.size / 1024).toFixed(2)} KB`}
                        />
                      </ListItem>
                    ))}
                  </List>
                </Box>
              )}
            </Box>
            
            <Box sx={{ mt: 4, display: 'flex', justifyContent: 'flex-end' }}>
              <Button
                type="button"
                variant="outlined"
                onClick={() => setIsEditing(false)}
                startIcon={<CancelIcon />}
                sx={{ mr: 2 }}
              >
                Cancel
              </Button>
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
      ) : (
        // View Mode
        <Paper sx={{ p: 3, position: 'relative', overflow: 'hidden' }}>
          {task.category && (
            <Box 
              sx={{ 
                position: 'absolute',
                top: 0,
                left: 0,
                width: '8px',
                height: '100%',
                bgcolor: task.category.color
              }} 
            />
          )}
          
          <Box sx={{ pl: task.category ? 2 : 0 }}>
            <Typography 
              variant="h4" 
              component="h2" 
              gutterBottom
              sx={{ 
                textDecoration: task.status === 'completed' ? 'line-through' : 'none',
                color: task.status === 'completed' ? 'text.secondary' : 'text.primary'
              }}
            >
              {task.title}
            </Typography>
            
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 3 }}>
              <Chip 
                icon={<FlagIcon />}
                label={task.priority} 
                color={getPriorityColor(task.priority)} 
              />
              
              <Chip 
                label={task.status} 
                color={getStatusColor(task.status)} 
              />
              
              {task.category && (
                <Chip 
                  icon={<LabelIcon />}
                  label={task.category.name}
                  sx={{ bgcolor: task.category.color, color: '#fff' }}
                />
              )}
              
              {task.dueDate && (
                <Chip 
                  icon={<TimeIcon />}
                  label={`Due: ${format(new Date(task.dueDate), 'MMM d, yyyy')}`} 
                  variant="outlined"
                />
              )}
            </Box>
            
            {task.description && (
              <Box sx={{ mb: 4 }}>
                <Typography variant="subtitle1" gutterBottom fontWeight="bold">
                  Description
                </Typography>
                <Typography variant="body1" whiteSpace="pre-wrap">
                  {task.description}
                </Typography>
              </Box>
            )}
            
            {task.attachments && task.attachments.length > 0 && (
              <Box sx={{ mb: 4 }}>
                <Typography variant="subtitle1" gutterBottom fontWeight="bold">
                  Attachments
                </Typography>
                <List>
                  {task.attachments.map((attachment) => (
                    <ListItem
                      key={attachment._id}
                      secondaryAction={
                        <Box>
                          <IconButton 
                            edge="end" 
                            aria-label="download"
                            href={`http://localhost:5000/uploads/${attachment.filename}`}
                            download={attachment.originalName}
                            target="_blank"
                            sx={{ mr: 1 }}
                          >
                            <DownloadIcon />
                          </IconButton>
                          <IconButton 
                            edge="end" 
                            aria-label="delete"
                            onClick={() => handleDeleteAttachment(attachment._id)}
                          >
                            <DeleteIcon />
                          </IconButton>
                        </Box>
                      }
                    >
                      <ListItemIcon>
                        <AttachmentIcon />
                      </ListItemIcon>
                      <ListItemText
                        primary={attachment.originalName}
                        secondary={`${(attachment.size / 1024).toFixed(2)} KB`}
                      />
                    </ListItem>
                  ))}
                </List>
              </Box>
            )}
            
            <Divider sx={{ my: 3 }} />
            
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Box>
                <Typography variant="body2" color="text.secondary">
                  Created: {format(new Date(task.createdAt), 'MMM d, yyyy')}
                </Typography>
                {task.updatedAt !== task.createdAt && (
                  <Typography variant="body2" color="text.secondary">
                    Updated: {format(new Date(task.updatedAt), 'MMM d, yyyy')}
                  </Typography>
                )}
              </Box>
              
              {task.dueDate && (
                <Box>
                  {task.googleCalendarEventId ? (
                    <Button
                      startIcon={<CalendarRemoveIcon />}
                      variant="outlined"
                      color="error"
                      onClick={handleRemoveFromCalendar}
                      size="small"
                    >
                      Remove from Calendar
                    </Button>
                  ) : (
                    <Button
                      startIcon={<CalendarIcon />}
                      variant="outlined"
                      color="primary"
                      onClick={handleAddToCalendar}
                      size="small"
                    >
                      Add to Calendar
                    </Button>
                  )}
                </Box>
              )}
            </Box>
          </Box>
        </Paper>
      )}
      
      {/* Delete Confirmation Dialog */}
      <Dialog
        open={confirmDelete}
        onClose={() => setConfirmDelete(false)}
      >
        <DialogTitle>Delete Task</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete this task? This action cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setConfirmDelete(false)}>Cancel</Button>
          <Button onClick={handleDelete} color="error" variant="contained">
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default TaskDetails;