import { createContext, useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from './AuthContext';

// Create TaskContext
export const TaskContext = createContext();

export const TaskProvider = ({ children }) => {
    const [tasks, setTasks] = useState([]);
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const { token, isAuthenticated } = useContext(AuthContext);
    const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

    // Fetch tasks and categories on auth state change
    useEffect(() => {
        if (isAuthenticated) {
            fetchTasks();
            fetchCategories();
        } else {
            setTasks([]);
            setCategories([]);
        }
    }, [isAuthenticated]);

    // Fetch all tasks
    const fetchTasks = async () => {
        if (!token) return;

        try {
            setLoading(true);
            const res = await axios.get(`${API_URL}/tasks`);
            setTasks(res.data);
            setError(null);
        } catch (err) {
            console.error('Error fetching tasks:', err);
            setError('Failed to load tasks');
        } finally {
            setLoading(false);
        }
    };

    // Fetch all categories
    const fetchCategories = async () => {
        if (!token) return;

        try {
            setLoading(true);
            const res = await axios.get(`${API_URL}/categories`);
            setCategories(res.data);
            setError(null);
        } catch (err) {
            console.error('Error fetching categories:', err);
            setError('Failed to load categories');
        } finally {
            setLoading(false);
        }
    };

    // Get task by ID
    const getTaskById = async (id) => {
        try {
            const res = await axios.get(`${API_URL}/tasks/${id}`);
            return res.data;
        } catch (err) {
            console.error('Error fetching task:', err);
            setError('Failed to load task details');
            throw err;
        }
    };

    // Create new task
    const createTask = async (taskData, files = []) => {
        try {
            setLoading(true);

            // If there are files, use FormData to send multipart request
            if (files.length > 0) {
                const formData = new FormData();

                // Append task data
                Object.keys(taskData).forEach(key => {
                    if (taskData[key] !== null && taskData[key] !== undefined) {
                        formData.append(key, taskData[key]);
                    }
                });

                // Append files
                files.forEach(file => {
                    formData.append('attachments', file);
                });

                const res = await axios.post(`${API_URL}/tasks`, formData, {
                    headers: {
                        'Content-Type': 'multipart/form-data'
                    }
                });

                setTasks([...tasks, res.data]);
                setError(null);
                return res.data;
            } else {
                // No files, regular JSON request
                const res = await axios.post(`${API_URL}/tasks`, taskData);
                setTasks([...tasks, res.data]);
                setError(null);
                return res.data;
            }
        } catch (err) {
            console.error('Error creating task:', err);
            setError('Failed to create task');
            throw err;
        } finally {
            setLoading(false);
        }
    };

    // Update task
    const updateTask = async (id, taskData, files = []) => {
        try {
            setLoading(true);

            // If there are files, use FormData
            if (files.length > 0) {
                const formData = new FormData();

                // Append task data
                Object.keys(taskData).forEach(key => {
                    if (taskData[key] !== null && taskData[key] !== undefined) {
                        formData.append(key, taskData[key]);
                    }
                });

                // Append files
                files.forEach(file => {
                    formData.append('attachments', file);
                });

                const res = await axios.put(`${API_URL}/tasks/${id}`, formData, {
                    headers: {
                        'Content-Type': 'multipart/form-data'
                    }
                });

                setTasks(tasks.map(task => (task._id === id ? res.data : task)));
                setError(null);
                return res.data;
            } else {
                // No files, regular JSON request
                const res = await axios.put(`${API_URL}/tasks/${id}`, taskData);
                setTasks(tasks.map(task => (task._id === id ? res.data : task)));
                setError(null);
                return res.data;
            }
        } catch (err) {
            console.error('Error updating task:', err);
            setError('Failed to update task');
            throw err;
        } finally {
            setLoading(false);
        }
    };

    // Delete task
    const deleteTask = async (id) => {
        try {
            setLoading(true);
            await axios.delete(`${API_URL}/tasks/${id}`);
            setTasks(tasks.filter(task => task._id !== id));
            setError(null);
        } catch (err) {
            console.error('Error deleting task:', err);
            setError('Failed to delete task');
            throw err;
        } finally {
            setLoading(false);
        }
    };

    // Create category
    const createCategory = async (categoryData) => {
        try {
            setLoading(true);
            const res = await axios.post(`${API_URL}/categories`, categoryData);
            setCategories([...categories, res.data]);
            setError(null);
            return res.data;
        } catch (err) {
            console.error('Error creating category:', err);
            setError('Failed to create category');
            throw err;
        } finally {
            setLoading(false);
        }
    };

    // Update category
    const updateCategory = async (id, categoryData) => {
        try {
            setLoading(true);
            const res = await axios.put(`${API_URL}/categories/${id}`, categoryData);
            setCategories(categories.map(category => (category._id === id ? res.data : category)));
            setError(null);
            return res.data;
        } catch (err) {
            console.error('Error updating category:', err);
            setError('Failed to update category');
            throw err;
        } finally {
            setLoading(false);
        }
    };

    // Delete category
    const deleteCategory = async (id) => {
        try {
            setLoading(true);
            await axios.delete(`${API_URL}/categories/${id}`);
            setCategories(categories.filter(category => category._id !== id));
            setError(null);
        } catch (err) {
            console.error('Error deleting category:', err);
            setError('Failed to delete category');
            throw err;
        } finally {
            setLoading(false);
        }
    };

    // Remove attachment from task
    const removeAttachment = async (taskId, attachmentId) => {
        try {
            setLoading(true);
            await axios.delete(`${API_URL}/tasks/${taskId}/attachments/${attachmentId}`);

            // Update the task in the state
            const updatedTask = await getTaskById(taskId);
            setTasks(tasks.map(task => (task._id === taskId ? updatedTask : task)));

            setError(null);
        } catch (err) {
            console.error('Error removing attachment:', err);
            setError('Failed to remove attachment');
            throw err;
        } finally {
            setLoading(false);
        }
    };

    // Add task to Google Calendar
    const addTaskToCalendar = async (taskId) => {
        try {
            setLoading(true);
            const res = await axios.post(`${API_URL}/calendar/tasks/${taskId}`);

            // Update task with Google Calendar event ID
            setTasks(tasks.map(task => (task._id === taskId ? { ...task, googleCalendarEventId: res.data.eventId } : task)));

            setError(null);
            return res.data;
        } catch (err) {
            console.error('Error adding task to calendar:', err);
            setError('Failed to add task to Google Calendar');
            throw err;
        } finally {
            setLoading(false);
        }
    };

    // Remove task from Google Calendar
    const removeTaskFromCalendar = async (taskId) => {
        try {
            setLoading(true);
            await axios.delete(`${API_URL}/calendar/tasks/${taskId}`);

            // Update task to remove Google Calendar event ID
            setTasks(tasks.map(task => {
                if (task._id === taskId) {
                    const updatedTask = { ...task };
                    delete updatedTask.googleCalendarEventId;
                    return updatedTask;
                }
                return task;
            }));

            setError(null);
        } catch (err) {
            console.error('Error removing task from calendar:', err);
            setError('Failed to remove task from Google Calendar');
            throw err;
        } finally {
            setLoading(false);
        }
    };

    return (
        <TaskContext.Provider
            value={{
                tasks,
                categories,
                loading,
                error,
                fetchTasks,
                fetchCategories,
                getTaskById,
                createTask,
                updateTask,
                deleteTask,
                createCategory,
                updateCategory,
                deleteCategory,
                removeAttachment,
                addTaskToCalendar,
                removeTaskFromCalendar
            }}
        >
            {children}
        </TaskContext.Provider>
    );
};