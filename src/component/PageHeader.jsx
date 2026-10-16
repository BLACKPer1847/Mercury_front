import styles from './PageHeader.module.css'

import Button from 'react-bootstrap/Button';

export default function PageHeader({ showBack = false, onBack, actions = [] }) {
  return (
    <div className={styles.header}>
      {showBack && (
        <Button variant="outline-secondary" onClick={onBack}>
          <i className="bi bi-arrow-left"></i> 返回
        </Button>
      )}
      <div className={styles.actions}>
        {actions.map((action, index) => (
          <Button
            key={index}
            variant={action.variant || 'secondary'}
            onClick={action.onClick}
          >
            {action.icon && <i className={`bi ${action.icon}`}></i>} {action.label}
          </Button>
        ))}
      </div>
    </div>
  );
}