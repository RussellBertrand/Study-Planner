import React from 'react';
import Navbar from '../components/Navbar';

export default function OutputPage({ tasks = [], currentUser }) {
  return (
    <div className="dashboard-wrapper">
      <Navbar currentUser={currentUser} />
      <main className="app">
        <h2>Ringkasan / Output Tugas Belajar</h2>
        <p>Halaman ini menampilkan ringkasan data tugas yang telah tercatat dalam sistem.</p>
        <div className="task-list">
          {tasks.map((task) => (
            <div key={task.id} className={`task-card priority-${task.priority?.toLowerCase() || 'medium'}`}>
              <div className="task-card-header">
                <h4>{task.title}</h4>
                <span className={`badge priority-${task.priority?.toLowerCase() || 'medium'}`}>
                  {task.priority}
                </span>
              </div>
              <div className="task-card-body">
                <div>Mata Kuliah: <strong>{task.subject}</strong></div>
                <div>Deadline: <strong>{task.deadline}</strong></div>
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
