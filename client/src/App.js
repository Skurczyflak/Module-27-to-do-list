import io from 'socket.io-client';
import { useState, useEffect } from 'react';
const shortid = require('shortid');

const App = () => {

  const [socket, setSocket] = useState();
  const [taskName, setTaskName] = useState('');
  const [tasks, setTasks] = useState([]);

  useEffect(() => {
      const socket = io('ws://localhost:8000', { transports: ['websocket'] });
      setSocket(socket);
        socket.on('updateData', ( tasks ) => {
            updateData( tasks );
        });
        socket.on('addTask', ( task ) => {
          //console.log(task)
            addTask( { task: task, emit: false } );
        });
        socket.on('removeTask', ( id ) => {
          //console.log(id)
            removeTask( { id: id, emit: false } );
        })
        socket.on('editTask', ( { id, name } ) => {
          //console.log(id, name)
            editTask( { id: id, name: name, emit: false } );
        })
      return () => {
        socket.disconnect();
      };
  }, []);

  function submitForm(e) {
    e.preventDefault();
    const task = { id: shortid.generate(), name: taskName };
    addTask( { task: task, emit: true } );
  }

  function addTask( { task, emit } ){
    setTasks(tasks => [...tasks, task]);
    setTaskName('');
    if ( emit ) socket.emit('addTask', task);
  }

  function updateData(  tasks ) {
    setTasks( tasks );
  }
  
  function removeTask( { id, emit } ) {
    setTasks( tasks => tasks.filter( task => task.id !== id ) );

    if( emit ) socket.emit('removeTask', id);
  }

  function editTask( {id, name, emit} ){
    //console.log( id, name, emit )
      setTasks( tasks => tasks.map( task => { if( task.id === id ) task.name = name;
        return task;
      }));
      if( emit ) socket.emit('editTask', { id: id, name: name});
      
  }

  function editBtn( e, {id, emit} ) {
    const editBtn = e.target;
    const taskEdit = document.getElementById(id);
    const name = taskEdit.value;

    if( editBtn.innerText === 'EDIT'){
      editBtn.innerText = 'SAVE';
      taskEdit.disabled = false;
    }else{
      editBtn.innerText = 'EDIT';
      taskEdit.disabled = true;
      editTask( { id: id, name: name, emit: emit } );
    }
    
  }


  return (
    <div className="App">

      <header>
        <h1>ToDoList.app</h1>
      </header>

      <section className="tasks-section" id="tasks-section">
        <h2>Tasks</h2>

        <ul className="tasks-section__list" id="tasks-list">
          {tasks.map((task) => (
            <li key={task.id} className="task">
              <input className='text-input' autoComplete='off' type='text' id={task.id} value={task.name} onChange={(e) => editTask( { id: task.id, name: e.target.value, emit: false } )} disabled/>
              <div className='task-controls'>
                <button className='btn btn--green' onClick={(e) => editBtn( e, {id: task.id, emit: true}, )}>Edit</button>
                <button className="btn btn--red" onClick={() => removeTask( { id: task.id, emit: true } )}>Remove</button>
              </div>
            </li>
          ))}
        </ul>

        <form id="add-task-form" onSubmit={(e) => submitForm(e)}>
          <input className="text-input" autoComplete="off" type="text" placeholder="Type your description" id="task-name" value={taskName} onChange={(e) => setTaskName( e.target.value )}/>
          <button className="btn" type="submit" >Add</button>
        </form>

      </section>
    </div>
  );
}

export default App;
