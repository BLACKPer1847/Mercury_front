import styles from "./TaskItem.module.css";
import  { useState, useEffect } from 'react';

function getDaysLeft(deadline) {
	if (!deadline) return null;
	const diff = Math.ceil((new Date(deadline) - new Date()) / (1000 * 60 * 60 * 24));
	return diff;
}

function getColorClass(days) {
	if (days === null) return '';
	if (days <= 1) return styles.urgent;
	if (days <= 3) return styles.warning;
	return styles.normal;
}

export default function TaskItem({ task, index, onComplete, onDetailClick }) {
	const showCountdown = task.type === 'longterm';
	const [exiting, setExiting] = useState(false);
	const daysLeft = isLongterm ? getDaysLeft(task.deadline) : null;
	
	const handleComplete = () => {
    setExiting(true);                      // 先触发退出动画
    setTimeout(() => {
      onComplete(task.id);                 // 动画结束后通知父组件
    }, 500);
  };

	return (
		<div  
			className={`${styles.item} ${exiting ? styles.exiting : ''}`}
      style={{ animationDelay: `${index * 80}ms` }}
		>
			<input
        type="radio"
        className={styles.radio}
        onChange={() => handleComplete(task.id)}
				disabled={exiting}
      />
			<div className={styles.content}>
				<h3 className={styles.title}>{task.title}</h3>
				{showCountdown && (
					<p className={`${styles.desc} ${getColorClass(daysLeft)}`}>
						剩余天数：{daysLeft}
					</p>
				)}
			</div>
			<button
				className={styles.btnDetail}
				onClick={() => onDetailClick(task.id)}
			>
				<i className="bi bi-info-circle"></i>
			</button>
		</div>
	);

}