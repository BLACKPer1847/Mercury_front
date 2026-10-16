import { useState, useEffect } from 'react';
import { useNavigate } from "react-router-dom";

import styles from './TaskManage.module.css'
import Alert from 'react-bootstrap/Alert';
import TaskManageRow from '../component/TaskManageRow';
import PageHeader from '../component/PageHeader';
import Spinner from 'react-bootstrap/Spinner';
import Pagination from '../component/Pagination';

import { taskApi, auth } from '../api/client';

function TaskManage() {
	const navigate = useNavigate();
  const [tasks, setTasks] = useState([]);
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

	const fetchTasks = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await taskApi.getAll({
        status: 'all',
        page,
        limit: 10,
      });
      setTasks(data.items);
      setPages(data.pages);
      setTotal(data.total);
    } catch (err) {
      setError(err.message);
      if (err.message.includes('token') || err.message.includes('401')) {
        auth.logout();
        navigate('/login');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTasks();
  }, [page]);

  const handleRefresh = () => fetchTasks();

	const handleDetailClick = (id) => {
    window.open(`/tasks/edit/${id}`, '_blank');
  };

	const handleExit = () => {
    auth.logout()
    navigate('/login')
    return
  }

	return (
		<>
			<div className={styles.page}>
				{/* 头部工具栏 */}
				<PageHeader
					showBack={true}
					onBack={() => navigate('/dashboard')}
					actions={[
						{ icon: 'bi-gear', label: '管理事件', variant: 'secondary', onClick: () => { } },
						{ icon: 'bi-clipboard2-data', label: '管理待办', variant: 'secondary', onClick: () => navigate('/taskmanage') },
						{ icon: 'bi-box-arrow-right', label: '登出', variant: 'dark', onClick: handleExit },
					]}
				/>

				{error && <Alert variant="danger">{error}</Alert>}
				{/* 页面主体 */}
				<div className={styles.body}>
        {loading ? (
          <Spinner animation="border" />
        ) : tasks.length === 0 ? (
          <div className={styles.empty}>暂无任务</div>
        ) : (
          <>
            <div className={styles.grid}>
              {/* 表头 */}
              <div className={styles.headerRow}>
                <span>待办任务名称</span>
                <span>类型</span>
                <span>状态</span>
                <span>截止日期</span>
                <span></span>
              </div>
              {/* 数据行 */}
              {tasks.map(task => (
                <TaskManageRow key={task.id} task={task} onDetailClick={handleDetailClick} />
              ))}
            </div>

            <Pagination
              currentPage={page}
              totalPages={pages}
              onPageChange={setPage}
            />

            <div className={styles.totalInfo}>共 {total} 条任务</div>
          </>
        )}
      </div>

				{/* 页尾 */}
				<div className={styles['tail-container']}>

				</div>
			</div>

		</>
	)
}

export default TaskManage;