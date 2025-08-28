const express = require('express');

const socket = require('socket.io');
const app = express();


let tasks = [];

app.use(express.json());

const server = app.listen(process.env.PORT || 8000, () => {
  console.log('Server is running...');
});
const io = socket(server);

io.on('connection', (socket) => {
    socket.emit('updateData', tasks);
    socket.on('addTask', ( task ) => {
        console.log('addTask');
        tasks.push(task);
        //console.log(tasks);
        socket.broadcast.emit('addTask', task);
    });
    socket.on('removeTask', ( id ) => {
        console.log('removeTask');
        tasks = tasks.filter( task => task.id !== id );
        //console.log(tasks);
        socket.broadcast.emit('removeTask', id);
    });
    socket.on('editTask', ( { id, name } ) => {
        console.log('editTask');
        tasks = tasks.map( task => { if( task.id === id ) task.name = name;
            return task
        });
        //console.log(tasks);
        socket.broadcast.emit('editTask', { id: id, name: name });
    })
    socket.on('disconnect', () => {
        console.log('user disconnected');
    });
})

app.use((req, res) => {
  res.status(404).send({ message: 'Not found...' });
});