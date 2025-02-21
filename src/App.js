import './App.css';
import React, { useState } from 'react';

//Firebase database imports
import { db } from './firebase';
import { collection, addDoc, Timestamp } from "firebase/firestore";

//date and time operation lib
import dayjs from 'dayjs';

//materialui components
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import Paper from '@mui/material/Paper';
import Box from '@mui/material/Box';
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import FormControl from '@mui/material/FormControl';
import Select from '@mui/material/Select';
import Checkbox from '@mui/material/Checkbox';
import FormControlLabel from '@mui/material/FormControlLabel';

//miux components for datepickers
import { DemoContainer } from '@mui/x-date-pickers/internals/demo';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { DateTimePicker } from '@mui/x-date-pickers/DateTimePicker';




function App() {

  const Add = async (event) => {

    //prevents the page from refreshing when the event triggered
    event.preventDefault();

    //variable for reminder date calculation
    let reminderTimestamp = null;

    //calculating reminder date from user's minute choise
    if (reminderEnabled && reminderTime) {
      reminderTimestamp = Timestamp.fromDate(
        new Date(dayjs(taskDate).subtract(reminderTime, 'minute').toDate())
      );
    }

    //adding all the data to firestore
    await addDoc(collection(db, "todos"), {
      text: text,
      taskDate: Timestamp.fromDate(new Date(taskDate)),
      reminderEnabled: reminderEnabled,
      reminderTime: reminderEnabled ? reminderTime : null,
      reminderTimestamp: reminderTimestamp,
      createdAt: Timestamp.now(),
    });

    //clearing the blanks after adding the data
    setText("");
    setTaskDate(null);
    setReminderEnabled(false);
    setReminderTime("");
  }


  //holds the text in the textfield
  const [text, setText] = useState("")

  //holds the date
  const [taskDate, setTaskDate] = useState(null);

  //holds the boolean reminderenabled value
  const [reminderEnabled, setReminderEnabled] = useState(false);

  //holds the reminder minute
  const [reminderTime, setReminderTime] = useState(null);

  // label const, to be able to show the text next to switch
  const label = { inputProps: { 'aria-label': 'Reminder ?' } };


  return (
    <div className="app-container">

      {/* Header */}
      <h1>Todo 4U</h1>

      <form>

        {/* Paper for todo components */}
        <Paper elevation={8} className="todo-paper">

          {/* Todo content */}
          <TextField label="Enter Todos" value={text} onChange={(event) => setText(event.target.value)} fullWidth className="todo-textfield"></TextField>

          {/* Date and Time Picker */}
          <LocalizationProvider dateAdapter={AdapterDayjs}>
            <DemoContainer components={['DateTimePicker']}>
              <DateTimePicker
                label="Notification Time ?"
                className="datetime-picker"
                value={taskDate}
                onChange={(newValue) => setTaskDate(newValue)}
              />
            </DemoContainer>
          </LocalizationProvider>

          <div className="reminder-section">

            {/* Reminder checkbox */}
            <FormControlLabel
              control={<Checkbox checked={reminderEnabled} onChange={(event) => setReminderEnabled(event.target.checked)} />}
              label="Reminde me"
              className="checkbox-label"
            />

            {/* Reminder Selector */}
            <Box className="reminder-select-box">
              <FormControl fullWidth>
                <InputLabel id="demo-simple-select-label">Reminder Date</InputLabel>
                <Select
                  labelId="demo-simple-select-label"
                  id="demo-simple-select"
                  className="reminder-select"
                  disabled={!reminderEnabled}
                  value={reminderTime || ""}
                  onChange={(event) => setReminderTime(event.target.value)}
                >
                  <MenuItem value={15} >15 min before</MenuItem>
                  <MenuItem value={30} >30 min before</MenuItem>
                  <MenuItem value={60} >60 min before</MenuItem>
                </Select>
              </FormControl>

            </Box>
          </div>

          <div className="button-container" >

            {/* Add Button */}
            <Button className="button" variant="outlined" disabled={!text || !taskDate} onClick={Add}>Add</Button>

            {/* Clear Button */}
            <Button
              className="button"
              variant="outlined"
              onClick={() => {
                setText("");
                setTaskDate(null);
                setReminderEnabled(false);
                setReminderTime(null);
              }}
            >Clear</Button>
          </div>
        </Paper>
      </form>
    </div>
  );
}

export default App;
