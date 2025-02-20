import { db } from './firebase';
import './App.css';
import React, { useState } from 'react';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import Paper from '@mui/material/Paper';
import Switch from '@mui/material/Switch';
import { DemoContainer } from '@mui/x-date-pickers/internals/demo';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { DateTimePicker } from '@mui/x-date-pickers/DateTimePicker';
import FormControlLabel from '@mui/material/FormControlLabel';
import Box from '@mui/material/Box';
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import FormControl from '@mui/material/FormControl';
import Select from '@mui/material/Select';





function App() {
  //
  const [todos, setTodos] = useState([
    {
      text: "Example 1",
      taskDate: new Date("2025-02-21T10:00:00"),
      reminderEnabled: true,
      reminderTime: new Date("2025-02-21T09:30:00"),
      createdAt: new Date("2025-02-25T15:00:00"),
    },
    {
      text: "Example 2",
      taskDate: new Date("2025-02-22T14:00:00"),
      reminderEnabled: false,
      reminderTime: null,
      createdAt: new Date("2025-02-24T16:00:00"),
    }
  ]);


  //holds the text in the textfield
  const [text, setText] = useState("")

  // label const, to be able to show the text next to switch
  const label = { inputProps: { 'aria-label': 'Reminder ?' } };



  return (
    <div>

      {/* Header */}
      <h1>Todo 4U</h1>

      <form>

        {/* Paper for todo components */}
        <Paper elevation={8} className='todo_paper'>

          {/* Todo content */}
          <TextField label="Enter Todos" value={text} onChange={(event) => setText(event.target.value)}></TextField>

          {/* Date and Time Picker */}
          <LocalizationProvider dateAdapter={AdapterDayjs}>
            <DemoContainer components={['DateTimePicker']}>
              <DateTimePicker label="Notification Time ?" />
            </DemoContainer>
          </LocalizationProvider><br />

          {/* Reminder switch */}
          <FormControlLabel control={<Switch defaultChecked />} label="Reminder ?" /><br />

          {/* Add Button */}
          <Button variant="outlined" >Add</Button>

          {/* Delete All Button */}
          <Button variant="outlined" >Delete All</Button>

          {/* Reminder Selector */}
          <Box sx={{ minWidth: 120 }}>
            <FormControl fullWidth>
              <InputLabel id="demo-simple-select-label">Remind me ... minutes ago</InputLabel>
              <Select
                labelId="demo-simple-select-label"
                id="demo-simple-select"
              >
                <MenuItem value={15}>15</MenuItem>
                <MenuItem value={30}>30</MenuItem>
                <MenuItem value={60}>60</MenuItem>
              </Select>
            </FormControl>
          </Box>

        </Paper>
      </form>
    </div>
  );
}

export default App;
