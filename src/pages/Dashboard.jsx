// Dashboard page


import { useState, useEffect } from 'react';
import { useNavigate } from "react-router-dom";

import styles from "./Dashboard.module.css";
import Button from 'react-bootstrap/Button';
import Spinner from 'react-bootstrap/Spinner';
import Card from 'react-bootstrap/Card';
import Alert from 'react-bootstrap/Alert';
import { taskApi, auth } from '../api/client';

import TaskList from '../component/TaskList';
import TaskModal from '../component/TaskModal';
import ConfirmModal from '../component/ConfirmModal';
import PageHeader from '../component/PageHeader';

// 长期任务在首页只预览前几条（完整列表在「管理待办」页）
const LONGTERM_PREVIEW_LIMIT = 5;

// 长期任务的排序规则：星标优先 > 截止日期近的优先 > id 小的优先
// 与后端约定的格式：sort / order 用逗号按位置对应
const LONGTERM_SORT = 'is_starred,deadline,id';
const LONGTERM_ORDER = 'desc,asc,asc';



function DashBoard() {
  const navigate = useNavigate();
  // ======待办任务列表========
  const [dailyTasks, setDailytasks] = useState([]);
  const [longtermTasks, setlongtermTasks] = useState([]);
  // 长期任务的总条数（列表被截断成前 5 条，徽章要显示真实总数）
  const [longtermTotal, setlongtermTotal] = useState(0);
  // ======错误信息与加载状态========
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  // ======详情页相关状态=====
  const [showModal, setShowModal] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);
  // =====删除功能的确认状态=====
  const [confirmDelete, setConfirmDelete] = useState(null);
  // null = 不显示
  // { id, title, originalTask } = 显示弹窗，状态内包含完整任务
  const [deleting, setDeleting] = useState(false);

  // ********** 函数部分 *********************
  // 拉取任务的函数
  // silent = true 时不切 loading（完成/删除后补位用，避免整页闪 Spinner）
  const fetchTasks = async ({ silent = false } = {}) => {
    if (!silent) setLoading(true);
    setError('');
    try {
      const [daily, longterm] = await Promise.all([
        taskApi.getAll({ type: 'daily', status: 'pending', limit: 999 }),
        // 长期任务由后端按规则排序并截断，前端不再自行 sort/slice
        taskApi.getAll({
          type: 'longterm',
          status: 'pending',
          limit: LONGTERM_PREVIEW_LIMIT,
          sort: LONGTERM_SORT,
          order: LONGTERM_ORDER,
        }),
      ]);
      setDailytasks(daily.items);
      setlongtermTasks(longterm.items);
      setlongtermTotal(longterm.total);
    } catch (err) {
      setError(err.message);
      // token 失效时跳回登录
      if (err.message.includes('token') || err.message.includes('401')) {
        auth.logout();
        navigate('/login');
      }
    } finally {
      if (!silent) setLoading(false);
    }
  };

  // 挂载时拉取一次
  useEffect(() => {
    fetchTasks();
  }, []);

  const handleComplete = async (id) => {
    try {
      await taskApi.update(id, { status: 'done' });
      // API 成功后，从本地状态移除
      setDailytasks(prev => prev.filter(t => t.id !== id));
      setlongtermTasks(prev => prev.filter(t => t.id !== id));
      // 长期列表被截断成前 5 条，完成一条后需要重新拉取让后面的任务补位
      await fetchTasks({ silent: true });
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


  const handleAddition = () => {
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
      await taskApi.update(selectedTask.id, taskData);
      // 重新拉取列表
      await fetchTasks();
    } catch (err) {
      throw err;   // 抛给 Modal 显示错误
    }
  };

  const handleDeleteTask = async () => {
    if (!confirmDelete) return;
    const { id, originalTask } = confirmDelete;
    setDeleting(true);
    try {
      await taskApi.remove(id);
      // 从本地状态移除
      setSelectedTask(null);  // 先关详情弹窗
      setConfirmDelete(null);   // 关闭删除确认弹窗
      setDailytasks(prev => prev.filter(t => t.id !== id));
      setlongtermTasks(prev => prev.filter(t => t.id !== id));
      // 删除后同样让长期列表补位
      await fetchTasks({ silent: true });
    } catch (err) {
      setError(err.message);
      if (originalTask) {
        setSelectedTask(originalTask);
      }
      setConfirmDelete(null);
    } finally {
      setDeleting(false);
    }

  }

  const handleExit = () => {
    auth.logout()
    navigate('/login')
    return
  }

  return (

    <>
      <div className={styles['dashboard-page']}>
        {/* 头部工具栏 */}
        <PageHeader
          actions={[
            { icon: 'bi-file-earmark-plus', label: '添加待办', variant: 'success', onClick: handleAddition },
            { icon: 'bi-gear', label: '管理事件', variant: 'secondary', onClick: () => {} },
            { icon: 'bi-clipboard2-data', label: '管理待办', variant: 'secondary', onClick: () => navigate('/taskmanage') },
            { icon: 'bi-box-arrow-right', label: '登出', variant: 'dark', onClick: handleExit },
          ]}
        />

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
            {error && <Alert variant="danger">{error}</Alert>}
            {loading ? (
              <Spinner animation="border" role="status">
                <span className="visually-hidden">加载中...</span>
              </Spinner>
            ) : (
              <>
                <TaskList
                  title="每日待办事项"
                  tasks={dailyTasks}
                  onComplete={handleComplete}
                  onDetailClick={handleDetailClick}
                />

                {/* 长期列表只显示前 5 条，徽章展示真实总数 */}
                <TaskList
                  title="长期待办事项"
                  tasks={longtermTasks}
                  onComplete={handleComplete}
                  onDetailClick={handleDetailClick}
                  badgeText={longtermTotal > longtermTasks.length
                    ? `显示 ${longtermTasks.length} / 共 ${longtermTotal}`
                    : `${longtermTotal} 个任务`}
                  action={{ label: '查看全部', onClick: () => navigate('/taskmanage') }}
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
          onDelete={() => {
            const taskToDelete = {
              id: selectedTask.id,
              title: selectedTask.title,
              originalTask: selectedTask,  // 保存用于恢复
            };
            setSelectedTask(null);
            setConfirmDelete(taskToDelete);
          }}
          initialData={selectedTask}
        />

        <ConfirmModal //删除确认
          show={!!confirmDelete}
          title="确认删除"
          message={`确定要删除「${confirmDelete?.title}」吗？此操作不可恢复。`}
          confirmText="删除"
          variant="danger"
          loading={deleting}
          onConfirm={handleDeleteTask}
          onCancel={() => {
            if (confirmDelete?.originalTask) {
              setSelectedTask(confirmDelete.originalTask);
            }
            setConfirmDelete(null)
          }}
        />

        {/* 页尾 */}
        <div className={styles['tail-container']}>

        </div>
      </div>

    </>

  )
}

export default DashBoard;