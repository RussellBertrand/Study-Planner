import React, { useState } from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import { users } from './data/users';
import { initialTasks } from './data/tasks';

import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import FormPage from './pages/FormPage';
import OutputPage from './pages/OutputPage';

function App() {
  const [currentUser, setCurrentUser] = useState(null);
  const [tasks, setTasks] = useState(initialTasks);

  const handleAddTask = (newTask) => {
    setTasks((prevTasks) => [...prevTasks, { ...newTask, id: Date.now() }]);
  };

  return (
    <HashRouter>
      <Routes>
        <Route 
          path="/login" 
          element={<LoginPage users={users} setCurrentUser={setCurrentUser} />} 
        />

        <Route 
          path="/dashboard" 
          element={
            currentUser ? (
              <DashboardPage currentUser={currentUser} tasks={tasks} />
            ) : (
              <Navigate to="/login" replace />
            )
          } 
        />

        <Route 
          path="/form" 
          element={
            currentUser && currentUser.role === 'client' ? (
              <FormPage onAddTask={handleAddTask} studentName={currentUser.name} />
            ) : (
              <Navigate to="/login" replace />
            )
          } 
        />

        <Route 
          path="/output" 
          element={
            currentUser ? (
              <OutputPage tasks={tasks} currentUser={currentUser} />
            ) : (
              <Navigate to="/login" replace />
            )
          } 
        />

        <Route 
          path="/" 
          element={<Navigate to={currentUser ? "/dashboard" : "/login"} replace />} 
        />

        <Route 
          path="*" 
          element={
            <div style={{ textAlign: 'center', marginTop: '50px' }}>
              <h1>404 Not Found</h1>
              <p>Sorry, the page you are looking for does not exist.</p>
            </div>
          } 
        />
      </Routes>
    </HashRouter>
  );
}

export default App;