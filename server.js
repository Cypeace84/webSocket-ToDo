const express = require('express');
const cors = require('cors');
const path = require('path');
const app = express();
const port = 8000;
const socket = require('socket.io');

const { createProxyMiddleware } = require('http-proxy-middleware');

app.use(cors({ origin: 'http://localhost:3000' }));

const tasks = [];

const indexPath = path.join(__dirname, 'client', 'public', 'index.html');
console.log(
  'Static files directory:',
  path.join(__dirname, 'client', 'public', 'index.html')
);

// Serwowanie statycznych plików z katalogu "client/build"

app.use(express.static(path.join(__dirname, 'client', 'build')));

app.get('/', (req, res) => {
  console.log('Sending index.html:', indexPath);
  res.sendFile(indexPath);
});

// Dodaj middleware do obsługi danych przesyłanych przez formularze
app.use(express.urlencoded({ extended: false }));

const server = app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
const io = socket(server, { cors: { origin: 'http://localhost:3000' } });

io.on('connection', (socket) => {
  console.log('New client connected!');

  socket.emit('updateData', tasks);
  console.log('updateData:', tasks);

  socket.on('addTask', (task) => {
    tasks.push(task);
    console.log('tasks:', tasks);
    console.log('task:', task);
    socket.broadcast.emit('addTask', task);
  });

  socket.on('removeTask', (taskId) => {
    const taskIndex = tasks.findIndex((t) => t.id === taskId);
    if (taskIndex !== -1) {
      const removedTask = tasks.splice(taskIndex, 1)[0];
      console.log('removedTask:', removedTask);
      socket.broadcast.emit('removeTask', removedTask.id);
    }
  });
});

app.use((req, res) => {
  res.status(404).send({ message: 'Not found...' });
});
