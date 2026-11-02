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

// CSS Modules 的类名必须走映射对象，不能用 'status' + 大写首字母 拼出来
const STATUS_CLASS = {
  pending: styles.statusPending,
  done: styles.statusDone,
  archived: styles.statusArchived,
};

export default function TaskManageRow({ task, onDetailClick }) {
  return (
    <div className={styles.row}>
      <span className={styles.name}>{task.title}</span>
      <span className={`${styles.badgeType} ${task.type === 'daily' ? styles.typeDaily : styles.typeLongterm}`}>
        {TYPE_LABEL[task.type]}
      </span>
      <span className={`${styles.badgeStatus} ${STATUS_CLASS[task.status] ?? ''}`}>
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