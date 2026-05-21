import React, { useState } from 'react';
import './App.css'; 
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './components/Navbar';
import LoginPage from './Pages/Login';
import SignUpPage from './Pages/SignUp';
import EventPage from './Pages/Event';
import BookingsPage from './Pages/Bookings';
import AuthContext from './context/auth-context';
import PrivateRoute from './components/PrivateRoute';



function App() {
    let [token, setToken] = useState(localStorage.getItem('token') || '')  
    let [userId, setUserId] = useState(localStorage.getItem('userId') || '') 
    let [username, setUsername] = useState(localStorage.getItem('username') || '')
    
    const login = (usertoken, loginUserId, username ) => {
        if(usertoken){
            setToken(usertoken);
            localStorage.setItem('token', usertoken);
        }
        if(loginUserId){
            setUserId(loginUserId);
            localStorage.setItem('userId', loginUserId);
        }
        if(username){
            setUsername(username);
            localStorage.setItem('username', username);
        }
    } 

    const logout = () => {
        setToken('');
        setUserId('');
        setUsername('');
        localStorage.removeItem('token');
        localStorage.removeItem('userId');
        localStorage.removeItem('username');
    }
    
  return (
    <BrowserRouter> 
    <AuthContext.Provider value={{ token, userId, username, login, logout}}>
         <Navbar/>
     <div className="main-content">
         <Routes>
            {token && <Route path="/login" element={<Navigate replace to='/events' />}  exact/>}
            {token && <Route path="/signup" element={<Navigate replace to='/events' />} exact/>}
             <Route path="/events" element={<EventPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/signup" element={<SignUpPage />} /> 
             
                <Route path="/bookings" element={
                    <PrivateRoute>
                        <BookingsPage />
                    </PrivateRoute>
                } />

            <Route path="/" element={<Navigate replace to="/events" />} />
        </Routes>
    </div>
    </AuthContext.Provider>
   
    </BrowserRouter>
  );
}

export default App;
