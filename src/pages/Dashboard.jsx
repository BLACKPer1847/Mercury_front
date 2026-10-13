// Dashboard page


import  { useState, useEffect } from 'react';
import { useNavigate } from "react-router-dom";

import styles from "./Dashboard.module.css";
import Button from 'react-bootstrap/Button';
import Spinner from 'react-bootstrap/Spinner';
import Card from 'react-bootstrap/Card';
import Alert from 'react-bootstrap/Alert';
import { taskApi,auth } from '../api/client';

import TaskList from '../component/TaskList';
import TaskModal from '../component/TaskModal';



function DashBoard() {
  const navigate = useNavigate();
  const [dailyTasks,setDailytasks] = useState([]);
  const [longtermTasks,setlongtermTasks] = useState([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  const [showModal, setShowModal] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);

  // 拉取任务的函数
  const fetchTasks = async () => {
    setLoading(true);
    setError('');
    try {
      const [daily, longterm] = await Promise.all([
        taskApi.getAll('daily'),
        taskApi.getAll('longterm'),
      ]);
      setDailytasks(daily);
      setlongtermTasks(longterm);
    } catch (err) {
      setError(err.message);
      // token 失效时跳回登录
      if (err.message.includes('token') || err.message.includes('401')) {
        auth.logout();
        navigate('/login');
      }
    } finally {
      setLoading(false);
    }
  };

  // 挂载时拉取一次
  useEffect(() => {
    fetchTasks();
  }, []);

  const handleComplete = async(id)=>{
    try {
      await taskApi.update(id, { status: 'done' });
      // API 成功后，从本地状态移除
      setDailytasks(prev => prev.filter(t => t.id !== id));
      setlongtermTasks(prev => prev.filter(t => t.id !== id));
    } catch (err) {
      throw err;   // 把错误抛给 TaskItem，让它处理动画回滚
    }
  }

  const handleDetailClick = async (id) => {
    try {
      const task = await taskApi.getOne(id);
      setSelectedTask(task);
    } catch (err) {
      setError(err.message);
    }
  };


  const handleAddition =()=>{
    setShowModal(true);
  }

  const handleCreateTask = async (taskData) => {
    try {
      await taskApi.create(taskData);
      // 重新拉取列表
      await fetchTasks();
    } catch (err) {
      throw err;   // 抛给 Modal 显示错误
    }
  };

  const handleUpdateTask = async (taskData) => {
    try {
      await taskApi.update(selectedTask.id,taskData);
      // 重新拉取列表
      await fetchTasks();
    } catch (err) {
      throw err;   // 抛给 Modal 显示错误
    }
  };

  const handleExit =()=>{
    auth.logout()
    navigate('/login')
    return
  }

  return (

    <>
    <div className={styles['dashboard-page']}>
      {/* 头部工具栏 */}
      <div className={styles['header-container']}>
        <Button variant="success" onClick={handleAddition}>
          <i className="bi bi-file-earmark-plus"></i> 添加待办
        </Button>
        <Button variant="secondary">
          <i className="bi bi-gear"></i> 管理事件
        </Button>
        <Button variant="secondary">
          <i className="bi bi-clipboard2-data"></i> 管理待办
        </Button>
        <Button variant="dark" onClick={handleExit}>
          <i className="bi bi-box-arrow-right"></i> 登出
        </Button>
        
      </div>

      {/* 页面主体 */}
      <div className={styles['main-container']}>
        {/* 左侧日历区域 */}
        <div className={styles['calender-container']}>
          <Alert variant='secondary'>
          日历功能在初版不会涉及，此处是留待开发区域
          </Alert>
        </div>

        {/* 右侧任务列表区域 */}
        <div className={styles['quest-list-container']}>
          {loading ? (
            <Spinner animation="border" role="status">
              <span className="visually-hidden">加载中...</span>
            </Spinner>
          ):(
          <>
            <TaskList
              title="每日待办事项"
              tasks={dailyTasks}
              onComplete={handleComplete}
              onDetailClick={handleDetailClick}
            />

            <TaskList
              title="长期待办事项"
              tasks={longtermTasks}
              onComplete={handleComplete}
              onDetailClick={handleDetailClick}
            />
          </>
          )}
          

        </div>
      </div>

      <TaskModal
        show={showModal}
        onHide={() => setShowModal(false)}
        onSubmit={handleCreateTask}
      />

      <TaskModal
        show={!!selectedTask}
        onHide={() => setSelectedTask(null)}
        onSubmit={handleUpdateTask}
        initialData={selectedTask}
      />

      {/* 页尾 */}
      <div className={styles['tail-container']}>

      </div>
    </div> 

    </>

  )
}

export default DashBoard;