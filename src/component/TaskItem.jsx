import styles from "./TaskItem.module.css";
import  { useState } from 'react';
import { diffInDays } from '../utils/date';

// 剩余天数按日历天算（今天=0、明天=1、已过期为负数），
// 和 TaskForm/TaskEdit 共用 utils/date 的解析规则，不再直接 new Date(deadline)
function getDaysLeft(deadline) {
	return diffInDays(deadline);
}

function getColorClass(days) {
	if (days === null) return '';
	if (days <= 1) return styles.urgent;
	if (days <= 3) return styles.warning;
	return styles.normal;
}

export default function TaskItem({ task, index, onComplete, onDetailClick }) {
	const showCountdown = task.type === 'longterm' || Boolean(task.deadline);
	const [exiting, setExiting] = useState(false);
	const daysLeft = showCountdown ? getDaysLeft(task.deadline) : null;
	
	// 不再使用纯乐观更新，如果更新失败动画会回滚
	const handleComplete = async() => {
    setExiting(true);                    // 立即播放动画

	// 等动画播完再调 API，避免动画被截断
  	await new Promise(resolve => setTimeout(resolve, 600));
	
	try {
		await onComplete(task.id);         // 同时发请求
		// 成功：父组件会更新 tasks，任务自然消失
	} catch (err) {
		// 失败：等动画播完，取消 exiting 状态，任务“滑回来”
		setExiting(false);
    	alert('操作失败：' + err.message);
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
						{daysLeft == null
							? "永久任务"
							: daysLeft < 0
								? `已过期 ${-daysLeft} 天`
								: `剩余天数：${daysLeft}`}
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