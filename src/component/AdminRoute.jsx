import { Navigate } from 'react-router-dom';
import { auth } from '../api/client';

/*
 * 管理页路由守卫：
 * - 没登录 → 去登录页
 * - 登录了但不是管理员 → 回首页（不暴露管理页的存在）
 * 注意 localStorage 可以被手动改，所以真正的权限由后端接口兜底。
 */
export default function AdminRoute({ children }) {
  if (!auth.isLoggedIn()) {
    return <Navigate to="/login" replace />;
  }
  if (!auth.isAdmin()) {
    return <Navigate to="/dashboard" replace />;
  }
  return children;
}
