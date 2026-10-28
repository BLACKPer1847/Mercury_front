import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';

import Form from 'react-bootstrap/Form';
import Button from 'react-bootstrap/Button';
import Alert from 'react-bootstrap/Alert';
import Spinner from 'react-bootstrap/Spinner';

import styles from './TaskEdit.module.css';
import PageHeader from '../component/PageHeader';
import ConfirmModal from '../component/ConfirmModal';
import TaskForm from '../component/TaskForm';
import useTaskForm from '../component/useTaskForm';
import { taskApi, auth } from '../api/client';

// token 失效的判断与其它页面保持一致：登出并跳回登录页
function isAuthError(err) {
  return err.message.includes('token') || err.message.includes('401');
}

// 后端时间戳是 datetime.utcnow() 的 naive 格式（无时区标记），
// 补上 Z 再转本地时间，否则浏览器会按本地时间解析，相差 8 小时
function formatDateTime(iso) {
  if (!iso) return '—';
  const hasZone = /(?:Z|[+-]\d{2}:?\d{2})$/.test(iso);
  const date = new Date(hasZone ? iso : `${iso}Z`);
  if (Number.isNaN(date.getTime())) return '—';
  return date.toLocaleString('zh-CN', { hour12: false });
}

/*
 * 表单区单独成组件：等任务数据拉回来之后再挂载，
 * useTaskForm 的 useState 初始化才能直接拿到 initialData。
 */
function EditForm({ task, onSave, onDeleteClick }) {
  const { values, setValue, error, submitting, submit } = useTaskForm({
    initialData: task,
    resetToken: task.id,
    onSubmit: onSave,
  });

  return (
    <Form onSubmit={submit}>
      <TaskForm
        values={values}
        onChange={setValue}
        error={error}
        showStatus
        showStar
      />

      <div className={styles.actions}>
        <Button variant="outline-danger" onClick={onDeleteClick} disabled={submitting}>
          删除
        </Button>
        <div className={styles.spacer} />
        <Button variant="primary" type="submit" disabled={submitting}>
          {submitting ? '保存中...' : '保存修改'}
        </Button>
      </div>
    </Form>
  );
}

function TaskEdit() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [task, setTask] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');          // 页面级错误（加载、删除）
  const [success, setSuccess] = useState('');      // 保存成功提示
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [deleting, setDeleting] = useState(false);

  // silent = true 时不显示整页 loading，避免保存后刷新数据把表单换成 Spinner
  const loadTask = async (silent = false) => {
    if (!silent) setLoading(true);
    try {
      const data = await taskApi.getOne(id);
      setTask(data);
      return data;
    } catch (err) {
      if (isAuthError(err)) {
        auth.logout();
        navigate('/login');
        return null;
      }
      setError(err.message);
      return null;
    } finally {
      if (!silent) setLoading(false);
    }
  };

  useEffect(() => {
    loadTask();
  }, [id]);

  const handleSave = async (payload) => {
    setError('');
    setSuccess('');
    try {
      await taskApi.update(id, payload);
      setSuccess('保存成功');
      // 重新拉一次单条，同步 updated_at 等后端字段（不重置表单内容）
      await loadTask(true);
    } catch (err) {
      if (isAuthError(err)) {
        auth.logout();
        navigate('/login');
        return;
      }
      throw err;    // 抛给 useTaskForm，在表单顶部显示
    }
  };

  const handleDelete = async () => {
    setDeleting(true);
    try {
      await taskApi.remove(id);
      navigate('/taskmanage');
    } catch (err) {
      setConfirmDelete(false);
      if (isAuthError(err)) {
        auth.logout();
        navigate('/login');
        return;
      }
      setError(err.message);
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className={styles.page}>
      <PageHeader showBack={true} onBack={() => navigate('/taskmanage')} />

      <div className={styles.body}>
        {loading ? (
          <Spinner animation="border" />
        ) : !task ? (
          <Alert variant="danger">{error || '任务不存在'}</Alert>
        ) : (
          <div className={styles.card}>
            <h2 className={styles.title}>编辑待办</h2>
            <p className={styles.meta}>
              #{task.id} · 创建于 {formatDateTime(task.created_at)} · 最近更新 {formatDateTime(task.updated_at)}
            </p>

            {error && <Alert variant="danger">{error}</Alert>}
            {success && (
              <Alert variant="success" dismissible onClose={() => setSuccess('')}>
                {success}
              </Alert>
            )}

            <EditForm
              task={task}
              onSave={handleSave}
              onDeleteClick={() => setConfirmDelete(true)}
            />
          </div>
        )}
      </div>

      <ConfirmModal
        show={confirmDelete}
        title="确认删除"
        message={`确定要删除「${task?.title || ''}」吗？此操作不可恢复。`}
        confirmText="删除"
        variant="danger"
        loading={deleting}
        onConfirm={handleDelete}
        onCancel={() => setConfirmDelete(false)}
      />
    </div>
  );
}

export default TaskEdit;
