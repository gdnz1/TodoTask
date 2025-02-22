import './App.css';
import React, { useState, useEffect } from 'react';


//Firebase database imports
import { db } from './firebase';
import { collection, addDoc, Timestamp, onSnapshot, doc, deleteDoc, updateDoc, getDocs } from "firebase/firestore";



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

  //holds the text in the textfield
  const [text, setText] = useState("")

  //holds the date
  const [taskDate, setTaskDate] = useState(null);

  //holds the boolean reminderenabled value
  const [reminderEnabled, setReminderEnabled] = useState(false);

  //holds the reminder minute
  const [reminderTime, setReminderTime] = useState(null);

  //holds the single todo
  const [todos, setTodos] = useState([]);

  //holds the edittext field
  const [editText, setEditText] = useState("");

  //holds the edittext id
  const [editId, setEditId] = useState(null);

  //holds the edittext reminder boolean
  const [editReminderEnabled, setEditReminderEnabled] = useState(false);

  //holds the edittext date
  const [editDate, setEditDate] = useState(null);

  //holds the edittext reminder time
  const [editReminderTime, setEditReminderTime] = useState(null);





  // method for add button
  const Add = async (event) => {
    //prevents the page from refreshing when the event is triggered
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
    clearTexts();
  }




  // method for clean button
  const clearTexts = async () => {

    setText("");
    setTaskDate(null);
    setReminderEnabled(false);
    setReminderTime(null);
  }


  // method for deleting the selected todo
  const deleteTodo = async (id) => {
    await deleteDoc(doc(db, "todos", id));
  }




  // method for updating the selected todo
  const updateTodo = async (id, newText, newDate, newReminderEnabled, newReminderTime) => {
    let reminderTimestamp = newReminderEnabled ? Timestamp.fromDate(
      new Date(dayjs(newDate).subtract(newReminderTime, 'minute').toDate())
    ) : null;
    await updateDoc(doc(db, "todos", id), {
      text: newText,
      taskDate: Timestamp.fromDate(new Date(newDate)),
      reminderEnabled: newReminderEnabled,
      reminderTime: newReminderEnabled ? newReminderTime : null,
      reminderTimestamp: reminderTimestamp
    });
  }




  //listener for updates from firestore
  useEffect(() => {
    const startListening = onSnapshot(collection(db, "todos"), (snapshot) => {
      setTodos(snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        taskDate: doc.data().taskDate ? dayjs(doc.data().taskDate.toDate()) : null
      })));
    });
    return () => startListening();
  }, []);




  // asking permission from user to send notification
  useEffect(() => {
    const requestPermission = async () => {
      const permission = await Notification.requestPermission();
    };
    requestPermission();
  }, []);




  // notification message
  const showNotification = (message) => {
    if (Notification.permission === "granted") {
      new Notification("Task Notification", {
        body: message,
      });
    }
  };




  // reminder message
  const showReminder = (message) => {
    if (Notification.permission === "granted") {
      new Notification("Task Reminder", {
        body: message,
      });
    }
  };

 

  // method for sending notifications
  useEffect(() => {
    // to hold reminders that have been sent before
    const sentReminders = new Set();
    // method to check tasks in every 10 seconds
    const checkTasks = setInterval(async () => {
      const now = new Date();
      // to track any change with snapshot
      const snapshot = await getDocs(collection(db, "todos"));
      snapshot.forEach(async (docSnapshot) => {
        const task = docSnapshot.data();
        const taskRef = docSnapshot.ref;
        const taskTime = task.taskDate?.toDate();
        const reminderTime = task.reminderEnabled ? task.reminderTimestamp?.toDate() : null;
        // if the task is completed delete it after sending notification
        if (taskTime && taskTime <= now) {
          showNotification(`It's time for the task: ${task.text}`);
          await deleteDoc(taskRef);
        }
        // if the date is true and if no reminder has been sent before
        else if (reminderTime && reminderTime <= now && task.reminderEnabled) {
          if (!sentReminders.has(taskRef.id)) {
            //send a reminder
            showReminder(`It's almost time for the task: ${task.text}`);
            //and add it to sentReminders
            sentReminders.add(taskRef.id);
            // to clear reminderEnabled, reminderTime and reminderTimestamp
            await updateDoc(taskRef, {
              reminderEnabled: false,
              reminderTime: null,
              reminderTimestamp: null,
            });
            setReminderTime(null);
          }
        }
      });
    }, 10000);
    return () => clearInterval(checkTasks);
  }, []);





  return (
    <div className="app_division">

      {/* Header */}
      <h1 className='app_name_header'>Todo 4U</h1>

      <form>
        <div className='insertion_division'>
          {/* Paper for todo components */}
          <Paper elevation={20} className="input_paper">

            {/* Todo content */}
            <TextField label="Enter the task" value={text} onChange={(event) => setText(event.target.value)} fullWidth className="todo_textfield"></TextField>

            {/* Date and Time Picker */}
            <LocalizationProvider dateAdapter={AdapterDayjs}>
              <DemoContainer components={['DateTimePicker']}>
                <DateTimePicker
                  label="Enter the notification time"
                  className="datetime_picker"
                  value={taskDate}
                  onChange={(newValue) => setTaskDate(newValue)}
                />
              </DemoContainer>
            </LocalizationProvider>


            <div className="reminder_division">



              {/* Reminder Selector */}
              <Box className="selector_box">
                <FormControl fullWidth>
                  <InputLabel id="demo-simple-select-label">Enter the reminder time</InputLabel>
                  <Select
                    labelId="demo-simple-select-label"
                    id="demo-simple-select"
                    className="selector_time"
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



              {/* Reminder checkbox */}
              <FormControlLabel
                control={<Checkbox checked={reminderEnabled} onChange={(event) => setReminderEnabled(event.target.checked)} />}
                label="Reminder"
                className="label_checkbox"
              />
            </div>



            <div className="add_clear_button_division" >

              {/* Add Button */}
              <Button className="button" variant="outlined" disabled={!text || !taskDate} onClick={Add}>Add</Button>

              {/* Clear Button */}
              <Button
                className="button"
                color='error'
                variant="outlined"
                onClick={clearTexts}
              >Clear</Button>
            </div>
          </Paper>
        </div>

      </form>



      {/* Todo object */}
      <div className="todo_division">
        {todos.map((todo) => (
          <Paper key={todo.id} elevation={4} className="todo_paper">
            {editId === todo.id ? (
              <>
                <div className='edit_division'>
                  {/* Todo textfield */}
                  <TextField label= 'Enter the task' className='edit_todo_text' value={editText} onChange={(event) => setEditText(event.target.value)} fullWidth />

                  {/* Todo DateTimepPicker from muix */}
                  <LocalizationProvider dateAdapter={AdapterDayjs}>
                    <DateTimePicker label= 'Enter the notification time' className='edit_todo_date_time_picker' value={editDate} onChange={(newValue) => setEditDate(newValue)} />
                  </LocalizationProvider>

                  {/* Todo remindertime selector */}
                  {editReminderEnabled && (
                    <FormControl className='edit_todo_remindertime_selector' fullWidth>
                      <InputLabel className='edit_todo_remindertime_text'>Enter the reminder time</InputLabel>
                      <Select
                        value={editReminderTime || ""}
                        onChange={(event) => setEditReminderTime(event.target.value)}
                      >
                        <MenuItem value={15}>15 min before</MenuItem>
                        <MenuItem value={30}>30 min before</MenuItem>
                        <MenuItem value={60}>60 min before</MenuItem>
                      </Select>
                    </FormControl>
                  )}

                  {/* Todo reminder checkbox with text */}
                  <FormControlLabel className='edit_todo_reminder_checkbox'
                    control={<Checkbox checked={editReminderEnabled} onChange={(event) => setEditReminderEnabled(event.target.checked)} />}
                    label="Reminder"
                  />

                  
                  <div className='edit_cancel_button_division'>
                    {/* Todo edit save button */}
                    <Button className='button' variant="outlined" onClick={() => { updateTodo(todo.id, editText, editDate, editReminderEnabled, editReminderTime); setEditId(null); }}>Save</Button>

                    {/* Todo edit cancel button */}
                    <Button className='button' variant="outlined" color='error' onClick={() => setEditId(null)}>Cancel</Button>

                  </div>

                </div>


              </>
            ) : (
              <>
                {/* Todo header information */}
                <h3 className='todo_text'>{todo.text}</h3>

                {/* Todo date information */}
                <p className='todo_date_text'><strong>Date:</strong> {dayjs(todo.taskDate.toDate()).format('YYYY-MM-DD HH:mm')}</p>

                {/* Todo reminder information */}
                {todo.reminderEnabled && <p className='todo_reminder_text'><strong>Reminder:</strong> {todo.reminderTime} minutes before</p>}

                <div className="edit_delete_button_division">

                  {/* Todo edit button */}
                  <Button className='button' variant="outlined" color="primary" onClick={() => {
                    setEditId(todo.id);
                    setEditText(todo.text);
                    setEditDate(todo.taskDate ? dayjs(todo.taskDate.toDate()) : null);
                    setEditReminderEnabled(todo.reminderEnabled);
                    setEditReminderTime(todo.reminderTime);
                  }}>Edit</Button>

                  {/* Todo delete button */}
                  <Button className='button' variant="outlined" color="error" onClick={() => deleteTodo(todo.id)}>Delete</Button>
                </div>
              </>
            )}
          </Paper>
        ))}
      </div>



    </div>
  );
}

export default App;
