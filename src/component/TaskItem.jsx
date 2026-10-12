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
	const daysLeft = showCountdown ? getDaysLeft(task.deadline) : null;
	
	// 不再使用纯乐观更新，如果更新失败动画会回滚
	const handleComplete = async() => {
    setExiting(true);                    // 立即播放动画
	try {
		await onComplete(task.id);         // 同时发请求
		// 成功：父组件会更新 tasks，任务自然消失
	} catch (err) {
		// 失败：等动画播完，取消 exiting 状态，任务“滑回来”
		setTimeout(() => {
		setExiting(false);
		alert('操作失败：' + err.message);
		}, 500);
	}
  };

	return (
		<div  
			className={`${styles.item} ${exiting ? styles.exiting : ''}`}
      style={{ animationDelay: `${index * 80}ms` }}
		>
			<input
        	type="radio"
        	className={styles.radio}
        	onChange={handleComplete}
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