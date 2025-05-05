import { useState, useEffect, useContext } from 'react';
import {
    Container,
    Grid,
    Paper,
    Typography,
    Button,
    Box,
    Fab,
    Dialog,
    TextField,
    DialogActions,
    DialogContent,
    DialogTitle,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    Tabs,
    Tab,
    IconButton,
    Tooltip,
    CircularProgress,
    Alert,
    Chip
} from '@mui/material';
import {
    Add as AddIcon,
    Search as SearchIcon,
    FilterList as FilterIcon,
    Category as CategoryIcon,
    Clear as ClearIcon
} from '@mui/icons-material';
import { TaskContext } from '../context/TaskContext';
import TaskItem from '../components/TaskItem';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { useDropzone } from 'react-dropzone';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { LocalizationProvider, DatePicker } from '@mui/x-date-pickers';

const Dashboard = () => {
    const [openTaskDialog, setOpenTaskDialog] = useState(false);
    const [openCategoryDialog, setOpenCategoryDialog] = useState(false);
    const [openFilterDialog, setOpenFilterDialog] = useState(false);
    const [statusFilter, setStatusFilter] = useState('');
    const [categoryFilter, setCategoryFilter] = useState('');
    const [priorityFilter, setPriorityFilter] = useState('');
    const [searchQuery, setSearchQuery] = useState('');
    const [tabValue, setTabValue] = useState(0);
    const [selectedFiles, setSelectedFiles] = useState([]);

    const {
        tasks,
        categories,
        loading,
        error,
        createTask,
        createCategory
    } = useContext(TaskContext);

    // Filtered tasks
    const [filteredTasks, setFilteredTasks] = useState([]);

    // Apply filters to tasks
    useEffect(() => {
        let result = [...tasks];

        // Filter by tab (status)
        if (tabValue === 1) {
            result = result.filter(task => task.status === 'in-progress');
        } else if (tabValue === 2) {
            result = result.filter(task => task.status === 'completed');
        } else if (tabValue === 3) {
            result = result.filter(task => task.status === 'pending');
        }

        // Apply additional filters
        if (statusFilter) {
            result = result.filter(task => task.status === statusFilter);
        }

        if (categoryFilter) {
            result = result.filter(task => task.category?._id === categoryFilter);
        }

        if (priorityFilter) {
            result = result.filter(task => task.priority === priorityFilter);
        }

        // Apply search query
        if (searchQuery) {
            const query = searchQuery.toLowerCase();
            result = result.filter(
                task =>
                    task.title.toLowerCase().includes(query) ||
                    (task.description && task.description.toLowerCase().includes(query))
            );
        }

        setFilteredTasks(result);
    }, [tasks, tabValue, statusFilter, categoryFilter, priorityFilter, searchQuery]);

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

    // Task form validation schema
    const taskValidationSchema = Yup.object({
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

    // Category form validation schema
    const categoryValidationSchema = Yup.object({
        name: Yup.string()
            .required('Name is required')
            .min(2, 'Name must be at least 2 characters'),
        color: Yup.string()
            .required('Color is required')
    });

    // Task form setup
    const taskFormik = useFormik({
        initialValues: {
            title: '',
            description: '',
            status: 'pending',
            priority: 'medium',
            categoryId: '',
            dueDate: null,
            addToCalendar: false
        },
        validationSchema: taskValidationSchema,
        onSubmit: async (values) => {
            try {
                await createTask(values, selectedFiles);
                setOpenTaskDialog(false);
                taskFormik.resetForm();
                setSelectedFiles([]);
            } catch (error) {
                console.error('Error creating task:', error);
            }
        }
    });

    // Category form setup
    const categoryFormik = useFormik({
        initialValues: {
            name: '',
            color: '#3498db'
        },
        validationSchema: categoryValidationSchema,
        onSubmit: async (values) => {
            try {
                await createCategory(values);
                setOpenCategoryDialog(false);
                categoryFormik.resetForm();
            } catch (error) {
                console.error('Error creating category:', error);
            }
        }
    });

    // Reset filters
    const handleClearFilters = () => {
        setStatusFilter('');
        setCategoryFilter('');
        setPriorityFilter('');
        setSearchQuery('');
        setOpenFilterDialog(false);
    };

    // Tab change handler
    const handleTabChange = (event, newValue) => {
        setTabValue(newValue);
    };

    return (
        <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
            {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

            <Grid container spacing={3}>
                {/* Header section */}
                <Grid item xs={12}>
                    <Paper
                        elevation={0}
                        sx={{
                            p: 2,
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            flexWrap: 'wrap',
                            bgcolor: 'background.default'
                        }}
                    >
                        <Typography variant="h4" component="h1">
                            Your Tasks
                        </Typography>

                        <Box sx={{ display: 'flex', gap: 1 }}>
                            <Button
                                variant="outlined"
                                startIcon={<CategoryIcon />}
                                onClick={() => setOpenCategoryDialog(true)}
                            >
                                New Category
                            </Button>

                            <Button
                                variant="contained"
                                startIcon={<AddIcon />}
                                onClick={() => setOpenTaskDialog(true)}
                            >
                                New Task
                            </Button>
                        </Box>
                    </Paper>
                </Grid>

                {/* Search and filters */}
                <Grid item xs={12}>
                    <Paper sx={{ p: 2 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                            <TextField
                                label="Search tasks"
                                variant="outlined"
                                fullWidth
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                InputProps={{
                                    startAdornment: <SearchIcon color="action" sx={{ mr: 1 }} />,
                                    endAdornment: searchQuery ? (
                                        <IconButton size="small" onClick={() => setSearchQuery('')}>
                                            <ClearIcon />
                                        </IconButton>
                                    ) : null
                                }}
                            />

                            <Tooltip title="Filter tasks">
                                <IconButton
                                    sx={{ ml: 1 }}
                                    onClick={() => setOpenFilterDialog(true)}
                                    color={statusFilter || categoryFilter || priorityFilter ? 'primary' : 'default'}
                                >
                                    <FilterIcon />
                                </IconButton>
                            </Tooltip>
                        </Box>

                        {/* Active filters */}
                        {(statusFilter || categoryFilter || priorityFilter) && (
                            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                                {statusFilter && (
                                    <Chip
                                        label={`Status: ${statusFilter}`}
                                        onDelete={() => setStatusFilter('')}
                                        size="small"
                                    />
                                )}

                                {priorityFilter && (
                                    <Chip
                                        label={`Priority: ${priorityFilter}`}
                                        onDelete={() => setPriorityFilter('')}
                                        size="small"
                                    />
                                )}

                                {categoryFilter && (
                                    <Chip
                                        label={`Category: ${categories.find(c => c._id === categoryFilter)?.name || 'Unknown'}`}
                                        onDelete={() => setCategoryFilter('')}
                                        size="small"
                                    />
                                )}

                                <Button
                                    size="small"
                                    onClick={handleClearFilters}
                                    startIcon={<ClearIcon />}
                                >
                                    Clear all
                                </Button>
                            </Box>
                        )}
                    </Paper>
                </Grid>

                {/* Tabs and Task List */}
                <Grid item xs={12}>
                    <Paper sx={{ width: '100%' }}>
                        <Tabs
                            value={tabValue}
                            onChange={handleTabChange}
                            indicatorColor="primary"
                            textColor="primary"
                            variant="fullWidth"
                        >
                            <Tab label="All" />
                            <Tab label="In Progress" />
                            <Tab label="Completed" />
                            <Tab label="Pending" />
                        </Tabs>

                        <Box sx={{ p: 2 }}>
                            {loading ? (
                                <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
                                    <CircularProgress />
                                </Box>
                            ) : filteredTasks.length === 0 ? (
                                <Box sx={{ textAlign: 'center', p: 3 }}>
                                    <Typography color="textSecondary">
                                        No tasks found. Create your first task!
                                    </Typography>
                                </Box>
                            ) : (
                                filteredTasks.map(task => (
                                    <TaskItem key={task._id} task={task} />
                                ))
                            )}
                        </Box>
                    </Paper>
                </Grid>
            </Grid>

            {/* Add Task Dialog */}
            <Dialog open={openTaskDialog} onClose={() => setOpenTaskDialog(false)} fullWidth maxWidth="sm">
                <DialogTitle>Create New Task</DialogTitle>
                <form onSubmit={taskFormik.handleSubmit}>
                    <DialogContent>
                        <TextField
                            fullWidth
                            id="title"
                            name="title"
                            label="Task Title"
                            variant="outlined"
                            margin="normal"
                            value={taskFormik.values.title}
                            onChange={taskFormik.handleChange}
                            onBlur={taskFormik.handleBlur}
                            error={taskFormik.touched.title && Boolean(taskFormik.errors.title)}
                            helperText={taskFormik.touched.title && taskFormik.errors.title}
                        />

                        <TextField
                            fullWidth
                            id="description"
                            name="description"
                            label="Description"
                            variant="outlined"
                            margin="normal"
                            multiline
                            rows={3}
                            value={taskFormik.values.description}
                            onChange={taskFormik.handleChange}
                            onBlur={taskFormik.handleBlur}
                            error={taskFormik.touched.description && Boolean(taskFormik.errors.description)}
                            helperText={taskFormik.touched.description && taskFormik.errors.description}
                        />

                        <Grid container spacing={2} sx={{ mt: 1 }}>
                            <Grid item xs={12} sm={6}>
                                <FormControl fullWidth>
                                    <InputLabel id="status-label">Status</InputLabel>
                                    <Select
                                        labelId="status-label"
                                        id="status"
                                        name="status"
                                        value={taskFormik.values.status}
                                        onChange={taskFormik.handleChange}
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
                                        value={taskFormik.values.priority}
                                        onChange={taskFormik.handleChange}
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
                                        value={taskFormik.values.categoryId}
                                        onChange={taskFormik.handleChange}
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
                                        value={taskFormik.values.dueDate}
                                        onChange={(date) => {
                                            taskFormik.setFieldValue('dueDate', date);
                                        }}
                                        renderInput={(params) => <TextField {...params} fullWidth />}
                                    />
                                </LocalizationProvider>
                            </Grid>
                        </Grid>

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
                                        Selected files:
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
                        </Box>
                    </DialogContent>

                    <DialogActions sx={{ px: 3, pb: 3 }}>
                        <Button onClick={() => setOpenTaskDialog(false)}>Cancel</Button>
                        <Button type="submit" variant="contained" disabled={loading}>
                            {loading ? <CircularProgress size={24} /> : 'Create Task'}
                        </Button>
                    </DialogActions>
                </form>
            </Dialog>

            {/* Add Category Dialog */}
            <Dialog open={openCategoryDialog} onClose={() => setOpenCategoryDialog(false)} fullWidth maxWidth="xs">
                <DialogTitle>Create New Category</DialogTitle>
                <form onSubmit={categoryFormik.handleSubmit}>
                    <DialogContent>
                        <TextField
                            fullWidth
                            id="name"
                            name="name"
                            label="Category Name"
                            variant="outlined"
                            margin="normal"
                            value={categoryFormik.values.name}
                            onChange={categoryFormik.handleChange}
                            onBlur={categoryFormik.handleBlur}
                            error={categoryFormik.touched.name && Boolean(categoryFormik.errors.name)}
                            helperText={categoryFormik.touched.name && categoryFormik.errors.name}
                        />

                        <Box sx={{ mt: 2 }}>
                            <Typography variant="subtitle2" gutterBottom>
                                Color
                            </Typography>
                            <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                <Box
                                    sx={{
                                        width: 36,
                                        height: 36,
                                        borderRadius: '50%',
                                        bgcolor: categoryFormik.values.color,
                                        border: '1px solid #ddd',
                                        mr: 2
                                    }}
                                />
                                <TextField
                                    id="color"
                                    name="color"
                                    type="color"
                                    value={categoryFormik.values.color}
                                    onChange={categoryFormik.handleChange}
                                    sx={{ width: 'auto' }}
                                />
                            </Box>
                        </Box>
                    </DialogContent>

                    <DialogActions sx={{ px: 3, pb: 3 }}>
                        <Button onClick={() => setOpenCategoryDialog(false)}>Cancel</Button>
                        <Button type="submit" variant="contained" disabled={loading}>
                            {loading ? <CircularProgress size={24} /> : 'Create Category'}
                        </Button>
                    </DialogActions>
                </form>
            </Dialog>

            {/* Filters Dialog */}
            <Dialog open={openFilterDialog} onClose={() => setOpenFilterDialog(false)} fullWidth maxWidth="xs">
                <DialogTitle>Filter Tasks</DialogTitle>
                <DialogContent>
                    <FormControl fullWidth margin="normal">
                        <InputLabel id="status-filter-label">Status</InputLabel>
                        <Select
                            labelId="status-filter-label"
                            id="status-filter"
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value)}
                            label="Status"
                        >
                            <MenuItem value="">All</MenuItem>
                            <MenuItem value="pending">Pending</MenuItem>
                            <MenuItem value="in-progress">In Progress</MenuItem>
                            <MenuItem value="completed">Completed</MenuItem>
                        </Select>
                    </FormControl>

                    <FormControl fullWidth margin="normal">
                        <InputLabel id="priority-filter-label">Priority</InputLabel>
                        <Select
                            labelId="priority-filter-label"
                            id="priority-filter"
                            value={priorityFilter}
                            onChange={(e) => setPriorityFilter(e.target.value)}
                            label="Priority"
                        >
                            <MenuItem value="">All</MenuItem>
                            <MenuItem value="low">Low</MenuItem>
                            <MenuItem value="medium">Medium</MenuItem>
                            <MenuItem value="high">High</MenuItem>
                        </Select>
                    </FormControl>

                    <FormControl fullWidth margin="normal">
                        <InputLabel id="category-filter-label">Category</InputLabel>
                        <Select
                            labelId="category-filter-label"
                            id="category-filter"
                            value={categoryFilter}
                            onChange={(e) => setCategoryFilter(e.target.value)}
                            label="Category"
                        >
                            <MenuItem value="">All</MenuItem>
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
                </DialogContent>

                <DialogActions sx={{ px: 3, pb: 3 }}>
                    <Button onClick={handleClearFilters} color="inherit">
                        Clear All
                    </Button>
                    <Button onClick={() => setOpenFilterDialog(false)} variant="contained">
                        Apply Filters
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Floating Action Button for quick add */}
            <Fab
                color="primary"
                aria-label="add"
                sx={{
                    position: 'fixed',
                    bottom: 16,
                    right: 16
                }}
                onClick={() => setOpenTaskDialog(true)}
            >
                <AddIcon />
            </Fab>
        </Container>
    );
};

export default Dashboard;