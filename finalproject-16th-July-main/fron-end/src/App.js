import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import Sidebar from './Sidebar';
import CalendarBoard from './CalendarBoard';
import AddEvent from './AddEvent';
import Profile from './Profile';
import Login from './Login';
import Register from './Register';
import Chart from './Chart';
import AddEventForm from './EventForm';
import MyProfile from './MyProfile';
import GroupCalendar from './Groupcalendar';
import Homepage from './Homepage';


function AppWrapper() {
  const location = useLocation();
  const isLoginPage = location.pathname === '/login' || location.pathname === '/register' || location.pathname === '/home';; 

  return (
    <div className="app">
      {!isLoginPage && <Sidebar />}
      <div className="main">
        <Routes>
          <Route path="/" element={<Navigate to="/home" />} />
          <Route path="/calendar" element={<CalendarBoard />} />
          <Route path="/add-event" element={<AddEvent />} />
          <Route path="/profile/:userId" element={<Profile />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/chart" element={<Chart />} />
          <Route path="/form" element={<AddEventForm />} />  
          <Route path="/me" element={<MyProfile />} />
          <Route path="/group" element={<GroupCalendar />} />
          <Route path="/home" element={<Homepage/>} />
        </Routes>
      </div>
    </div>
  );
}

function App() {
  return (
    <Router>
      <AppWrapper />
    </Router>
  );
}

export default App;
