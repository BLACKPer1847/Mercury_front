// Task 2.1.3 Register Screen
import React,{ useState } from 'react';
import { useNavigate } from "react-router-dom";
import styles from './Register.module.css';
import Button from 'react-bootstrap/Button';
import Alert from 'react-bootstrap/Alert';
import { authApi } from '../api/client';

function RegisterPage() {
  const navigate = useNavigate();

  const [userName, setUserName] = useState('');
  const [userPassword, setUserPassword] = useState('');
  const [userPasswordConfirm, setUserPasswordConfirm] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleRegister =async(e)=> {
    e.preventDefault(); // 阻止默认刷新
    setError('');

    // 前端校验
    if (!userName.trim() || !userPassword || !userPasswordConfirm) {
      setError('所有字段都不能为空');
      return;
    }
    if (userPassword !== userPasswordConfirm) {
      setError('两次输入的密码不一致');
      return;
    }

    setLoading(true);
    try {
      await authApi.register(userName, userPassword);
      // 注册成功后跳转到登录页
      navigate('/login');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
}

  return (
    <>
    <div className={styles['register-page']}>
      <div className={styles['register-box']}>
        {error && <Alert variant='danger' onClose={() => setError('')} dismissible>{error}</Alert>}
        <form onSubmit={handleRegister} className={styles['register-form']}>
            <div className={styles['input-text-container']}>
              <label htmlFor='username-input-text'>用户名:</label>
              <input
                type='text'
                placeholder='输入用户名'
                value={userName}
                onChange={(e) => setUserName(e.target.value)}
                className={styles['username-input-text']}
                id='username-input-text'
              />


              <label htmlFor='password-input-text'>密码:</label>
              <input
                type='password'
                placeholder='请输入密码'
                value={userPassword}
                onChange={(e) => setUserPassword(e.target.value)}
                className={styles['password-input-text']}
                id='password-input-text'
              />

              <label htmlFor='password-confirm-input-text'>请确认密码:</label>
              <input
                type='password'
                placeholder='请输入与上一栏相同的密码'
                value={userPasswordConfirm}
                onChange={(e) => setUserPasswordConfirm(e.target.value)}
                className={styles['password-confirm-input-text']}
                id='password-confirm-input-text'
              />
            </div>

            <div className={styles['submit-button-container']}>
              <Button variant="danger" type='button' onClick={() => navigate("/login")}>返回</Button>
              <Button variant="success" type='submit'>注册</Button>
            </div>
        </form>
      </div>
    </div>

    </>
  )
}

export default RegisterPage;