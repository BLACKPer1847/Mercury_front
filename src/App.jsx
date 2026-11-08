import { useState } from 'react'
import { BrowserRouter, Routes, Route, } from 'react-router-dom'
import './App.css'
import LoginPage from './pages/Login'
import RegisterPage from './pages/Register'
import DashBoard from './pages/Dashboard'
import TaskManage from './pages/TaskManage'
import TaskEdit from './pages/TaskEdit'
import AdminEvents from './pages/AdminEvents'
import ProtectedRoute from './component/ProtectedRoute'
import AdminRoute from './component/AdminRoute'
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

        {/* 管理端：只有 admin 能进（后端接口另有权限校验） */}
        <Route
          path="/admin/events"
          element={
            <AdminRoute>
              <AdminEvents />
            </AdminRoute>
          }
        />
      </Routes>
    </BrowserRouter>
  )
}

export default App
