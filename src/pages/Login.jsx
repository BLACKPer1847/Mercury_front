import React,{ useState } from 'react';
import { useNavigate } from "react-router-dom";
import styles from './Login.module.css';
import Button from 'react-bootstrap/Button';
import Alert from 'react-bootstrap/Alert';
import logo from '../assets/clock_svg.svg';
import { authApi } from '../api/client';


function LoginPage() {
  const navigate = useNavigate();

  const [userName, setUserName] = useState('');
  const [userPassword, setUserPassword] = useState('');

	const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e) => {
		e.preventDefault(); // 阻止默认刷新
		setError('');

		// 前端基础校验
    if (!userName.trim() || !userPassword) {
      setError('用户名和密码不能为空');
      return;
    }

		setLoading(true);
    try {
      const data = await authApi.login(userName, userPassword);
      // 存储 token
			localStorage.setItem('token', data.token);
			localStorage.setItem('username', data.username);
			navigate('/dashboard'); 
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }
  

  return (
    <>
    <div className={styles['login-page']}>
      <div className={styles['login-box']}>
        <div className={styles['title-box']}>
          <img src={logo} alt="Mercury Logo" className={styles['login-logo']} />
          <h1>日常与长期任务备忘录</h1>
        </div>
				{error && <Alert variant='danger' onClose={() => setError('')} dismissible>{error}</Alert>}
        <form onSubmit={handleLogin} className={styles['login-form']}>
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
                placeholder='输入密码'
                value={userPassword}
                onChange={(e) => setUserPassword(e.target.value)}
                className={styles['password-input-text']}
                id='password-input-text'
              />
            </div>

            <div className={styles['submit-button-container']}>
              <Button variant="primary" type='button' onClick={() => navigate("/register")}>注册</Button>
              <Button variant="success" type='submit' disabled={loading}>登录</Button>
            </div>
        </form>
      </div>
    </div>

    </>

  )
}

export default LoginPage;