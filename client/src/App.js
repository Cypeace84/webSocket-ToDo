import React, { useState, useEffect } from 'react';
import './index.css';
import io from 'socket.io-client';
import { v4 as uuidv4 } from 'uuid';

const App = () => {
  const [socket, setSocket] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [taskName, setTaskName] = useState('');
  console.log('taskName', taskName);
  console.log('App-tasks:', tasks);

  useEffect(() => {
    const socket = io('http://localhost:8000');
    console.log('Socket:', socket);
    setSocket(socket);

    socket.on('addTask', (newTask) => {
      addTask(newTask);
    });

    socket.on('removeTask', (taskId) => {
      console.log('rm:', taskId);
      removeTask(taskId);
    });

    socket.on('updateData', (data) => {
      updateTasks(data);
    });

    return () => {
      socket.disconnect();
      setSocket(null);
    };
  }, []);

  const submitForm = (event) => {
    event.preventDefault();

    // Dodanie nowego zadania na serwerze
    const newTask = {
      id: uuidv4(),
      task: taskName,
    };
    addTask(newTask);

    socket.emit('addTask', newTask);

    // Wyczyść wartość pola taskName
    setTaskName('');
  };

  const addTask = (task) => {
    setTasks((tasks) => [...tasks, task]);
  };

  const removeTask = (taskId, localAction) => {
    console.log('taskId:', taskId);
    console.log('socket:', socket);
    setTasks((tasks) => tasks.filter((task) => task.id !== taskId));

    if (localAction) {
      socket.emit('removeTask', taskId);
    }
  };

  const updateTasks = (data) => {
    setTasks(data);
  };

  return (
    <div className='App'>
      <header>
        <h1>ToDoList.app</h1>
      </header>

      <section className='tasks-section' id='tasks-section'>
        <h2>Tasks</h2>

        <ul className='tasks-section__list' id='tasks-list'>
          {tasks.map((task) => (
            <li className='task' key={task.id}>
              {task.task}{' '}
              <button
                className='btn btn--red'
                onClick={() => removeTask(task.id, true)}
              >
                Remove
              </button>
            </li>
          ))}
        </ul>

        <form id='add-task-form' onSubmit={submitForm}>
          <input
            className='text-input'
            autoComplete='off'
            type='text'
            placeholder='Type your description'
            id='task-name'
            value={taskName}
            onChange={(event) => setTaskName(event.target.value)}
          />
          <button className='btn' type='submit'>
            Add
          </button>
        </form>
      </section>
    </div>
  );
};

export default App;
