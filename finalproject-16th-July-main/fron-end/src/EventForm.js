import React, { useEffect, useState } from 'react';
import {
  Box, Button, TextField, Typography, FormControl,
  IconButton, CardContent, Dialog, Fade, Select, MenuItem, InputLabel
} from '@mui/material';
import { Delete as DeleteIcon, Close as CloseIcon } from '@mui/icons-material';
import { LocalizationProvider, DatePicker } from '@mui/x-date-pickers';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import axios from 'axios';

function AddEventForm({ selectedDate, calendarId, onClose, onAddSuccess, initialData }) {
  const [formData, setFormData] = useState({
    title: '',
    subject: '',
    assignedDate: null,
    contentBlocks: [],
  });

  const [newBlock, setNewBlock] = useState({ data: '' });
  const [editingIndex, setEditingIndex] = useState(null);
  const [editingContent, setEditingContent] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogTitle, setDialogTitle] = useState('');
  const [dialogContent, setDialogContent] = useState('');
  const token = localStorage.getItem('token');

  const handleDialog = (title, content) => {
    setDialogTitle(title);
    setDialogContent(content);
    setDialogOpen(true);
  };

  useEffect(() => {
    if (initialData) {
      setFormData({
        title: initialData.title || '',
        subject: initialData.subject || '',
        assignedDate: initialData.assignedDate ? new Date(initialData.assignedDate) : new Date(),
        contentBlocks: (initialData.contentBlocks || []).map(block => ({
          ...block,
          data: typeof block.data === 'object' && block.data?.text ? block.data.text : block.data
        })),
      });
    } else if (selectedDate) {
      const datePart = new Date(selectedDate);
      const now = new Date();
      datePart.setHours(now.getHours(), now.getMinutes(), now.getSeconds(), now.getMilliseconds());
      setFormData(prev => ({
        ...prev,
        assignedDate: datePart,
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        assignedDate: new Date(),
      }));
    }
  }, [initialData, selectedDate]);

  const handleChange = (field) => (e) => {
    setFormData({ ...formData, [field]: e.target.value });
  };

  const handleDateChange = (date) => {
    if (!date) return;
    const prevDate = formData.assignedDate;
    const newDate = new Date(date);

    if (prevDate) {
      newDate.setHours(
        prevDate.getHours(),
        prevDate.getMinutes(),
        prevDate.getSeconds(),
        prevDate.getMilliseconds()
      );
    } else {
      const now = new Date();
      newDate.setHours(now.getHours(), now.getMinutes(), now.getSeconds(), now.getMilliseconds());
    }

    setFormData({ ...formData, assignedDate: newDate });
  };

  const handleBlockChange = (e) => {
    setNewBlock({ data: e.target.value });
  };

  const handleAddBlock = () => {
    if (newBlock.data.trim() === '') return;
    setFormData({
      ...formData,
      contentBlocks: [...formData.contentBlocks, { type: 'text', data: newBlock.data }],
    });
    setNewBlock({ data: '' });
  };

  const handleRemoveBlock = (index) => {
    const updated = [...formData.contentBlocks];
    updated.splice(index, 1);
    setFormData({ ...formData, contentBlocks: updated });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const payload = {
        ...formData,
        assignedDate: formData.assignedDate.toISOString(),
        contentBlocks: formData.contentBlocks.map(block => ({
          type: 'text',
          data: { text: block.data }
        })),
        calendarId,
      };

      if (initialData?.id) {
        await axios.put(`http://localhost:8003/api/notes/${initialData.id}`, payload, {
          headers: { Authorization: `Bearer ${token}` },
        });
        handleDialog('Success', '✔️ Note updated successfully!');
      } else {
        await axios.post('http://localhost:8003/api/notes', payload, {
          headers: { Authorization: `Bearer ${token}` },
        });
        handleDialog('Success', '🎉 Note created successfully!');
      }

    } catch (err) {
      console.error('Error saving note:', err);
      handleDialog('Error', '❌ Failed to save note.');
    }
  };

  return (
    <>
      <form onSubmit={handleSubmit}>
        <CardContent>
          <Typography variant="h6">
            {initialData ? 'Edit Event' : 'New Event'}
          </Typography>

          <TextField
            fullWidth
            margin="normal"
            label="Title"
            value={formData.title}
            onChange={handleChange('title')}
            required
          />

          <FormControl fullWidth margin="normal">
            <InputLabel>Task Type</InputLabel>
            <Select
              value={formData.subject}
              onChange={handleChange('subject')}
              label="Task Type"
              required
            >
              <MenuItem value="work">Work</MenuItem>
              <MenuItem value="meeting">Meeting</MenuItem>
              <MenuItem value="personal">Personal</MenuItem>
              <MenuItem value="birthday">Birthday</MenuItem>
            </Select>
          </FormControl>

          <LocalizationProvider dateAdapter={AdapterDateFns}>
            <DatePicker
              label="Assigned Date"
              value={formData.assignedDate instanceof Date && !isNaN(formData.assignedDate) ? formData.assignedDate : null}
              onChange={handleDateChange}
              renderInput={(params) => (
                <TextField {...params} fullWidth margin="normal" error={!formData.assignedDate} />
              )}
            />
          </LocalizationProvider>

          <Typography variant="subtitle1" sx={{ mt: 2 }}>Add Task</Typography>

          <TextField
            label="Task Content"
            fullWidth
            multiline
            rows={3}
            margin="normal"
            value={newBlock.data}
            onChange={handleBlockChange}
          />

          {formData.contentBlocks.map((block, idx) => (
            <Box
              key={idx}
              sx={{
                mt: 2,
                p: 2,
                borderLeft: '4px solid',
                borderColor: 'primary.main',
                backgroundColor: '#f9f9f9',
                borderRadius: 1,
                position: 'relative',
              }}
            >
              <Typography variant="subtitle2">[TEXT]</Typography>

              {editingIndex === idx ? (
                <>
                  <TextField
                    fullWidth
                    multiline
                    rows={3}
                    value={editingContent}
                    onChange={(e) => setEditingContent(e.target.value)}
                    sx={{ mt: 1 }}
                  />
                  <Box sx={{ mt: 1, display: 'flex', gap: 1 }}>
                    <Button
                      variant="contained"
                      color="success"
                      size="small"
                      onClick={() => {
                        const updated = [...formData.contentBlocks];
                        updated[idx].data = editingContent;
                        setFormData({ ...formData, contentBlocks: updated });
                        setEditingIndex(null);
                      }}
                    >
                      Save
                    </Button>
                    <Button
                      variant="outlined"
                      color="inherit"
                      size="small"
                      onClick={() => setEditingIndex(null)}
                    >
                      Cancel
                    </Button>
                  </Box>
                </>
              ) : (
                <Typography sx={{ mt: 1, whiteSpace: 'pre-line' }}>
                  {typeof block.data === 'object' ? block.data?.text : block.data}
                </Typography>
              )}

              <Box sx={{ position: 'absolute', top: 8, right: 8, display: 'flex', gap: 1 }}>
                <IconButton onClick={() => handleRemoveBlock(idx)} size="small">
                  <DeleteIcon fontSize="small" />
                </IconButton>
                <Button
                  size="small"
                  onClick={() => {
                    setEditingIndex(idx);
                    setEditingContent(block.data);
                  }}
                >
                  Edit
                </Button>
              </Box>
            </Box>
          ))}

          <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 3 }}>
            <Button onClick={handleAddBlock} variant="outlined">
              Add Task
            </Button>
            <Button type="submit" variant="contained" color="primary">
              {initialData ? 'Update Event' : 'Save Event'}
            </Button>
          </Box>
        </CardContent>
      </form>

      <Dialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        TransitionComponent={Fade}
        keepMounted
        PaperProps={{
          sx: { position: 'relative' }
        }}
      >
        <IconButton
          onClick={() => setDialogOpen(false)}
          sx={{ position: 'absolute', top: 8, right: 8 }}
        >
          <CloseIcon />
        </IconButton>
        <Box sx={{ p: 3, minWidth: 300 }}>
          <Typography variant="h6" gutterBottom>
            {dialogTitle}
          </Typography>
          <Typography>{dialogContent}</Typography>
          <Box sx={{ mt: 2, display: 'flex', justifyContent: 'flex-end' }}>
            <Button
              onClick={() => {
                setDialogOpen(false);
                setTimeout(() => {
                  onAddSuccess();
                }, 300);
              }}
              variant="contained"
              autoFocus
            >
              OK
            </Button>
          </Box>
        </Box>
      </Dialog>
    </>
  );
}

export default AddEventForm;
