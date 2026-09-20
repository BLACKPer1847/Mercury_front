import { useState } from 'react'
import { BrowserRouter, Routes, Route, } from 'react-router-dom'
import './App.css'
import LoginPage from './pages/Login'
import RegisterPage from './pages/Register'
import DashBoard from './pages/Dashboard'
// Bootstrap CSS
import 'bootstrap/dist/css/bootstrap.min.css';
// Icon from bootstrap
import 'bootstrap-icons/font/bootstrap-icons.css';


function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LoginPage />} />
        {/* Login && Register */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />

        {/* Function Pages */}
        <Route path='/dashboard/:id' element={<DashBoard />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
