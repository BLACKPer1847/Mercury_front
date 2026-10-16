import styles from '../pages/TaskManage.module.css';
import Button from 'react-bootstrap/Button';

const STATUS_LABEL = {
  pending: '待办',
  done: '已完成',
  archived: '已归档',
};

const TYPE_LABEL = {
  daily: '每日任务',
  longterm: '长期任务',
};

export default function TaskManageRow({ task, onDetailClick }) {
  return (
    <div className={styles.row}>
      <span className={styles.name}>{task.title}</span>
      <span className={`${styles.badgeType} ${task.type === 'daily' ? styles.typeDaily : styles.typeLongterm}`}>
        {TYPE_LABEL[task.type]}
      </span>
      <span className={`${styles.badgeStatus} ${styles['status' + task.status.charAt(0).toUpperCase() + task.status.slice(1)]}`}>
        {STATUS_LABEL[task.status]}
      </span>
      <span>{task.deadline || '不适用'}</span>
      <Button
        size="sm"
        variant="outline-primary"
        onClick={() => onDetailClick(task.id)}
      >
        <i className="bi bi-box-arrow-up-right"></i>
      </Button>
    </div>
  );
}