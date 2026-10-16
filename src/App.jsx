import { useState } from 'react'
import { BrowserRouter, Routes, Route, } from 'react-router-dom'
import './App.css'
import LoginPage from './pages/Login'
import RegisterPage from './pages/Register'
import DashBoard from './pages/Dashboard'
import TaskManage from './pages/TaskManage'
import TaskEdit from './pages/TaskEdit'
import ProtectedRoute from './component/ProtectedRoute'
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
        {/* 用 <Navigate> 组件代替 navigate() 函数调用, 在渲染阶段处理重定向。 */}
        <Route
          path='/dashboard'
          element={
            <ProtectedRoute>
              <DashBoard />
            </ProtectedRoute>
          }
        />

        <Route
          path='/taskmanage'
          element={
            <ProtectedRoute>
              <TaskManage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/tasks/edit/:id"
          element={
            <ProtectedRoute>
              <TaskEdit />
            </ProtectedRoute>
          }
        />
      </Routes>
    </BrowserRouter>
  )
}

export default App
