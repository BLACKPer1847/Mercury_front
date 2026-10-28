import styles from "./TaskList.module.css";
import TaskItem from "./TaskItem";

// onComplete,onDetailClick需要调用Api，业务逻辑不放到组件里
// badgeText / action 是可选展示：截断列表时用来显示真实总数和"查看全部"入口
export default function TaskList({ title, tasks, onComplete, onDetailClick, badgeText, action }) {

	return (
		<div className={styles.panel}>
			<div className={styles.header}>
				<h2>{title}</h2>
				<div className={styles.meta}>
					<span className={styles.badge}>{badgeText ?? `${tasks.length} 个任务`}</span>
					{action && tasks.length > 0 && (
						<button type="button" className={styles.more} onClick={action.onClick}>
							{action.label}
						</button>
					)}
				</div>
			</div>

			<div className={styles.list}>
				{tasks.length === 0 ? (
					<div className={styles.empty}><i className="bi bi-balloon"></i> 暂无{title}</div>
				) : (
					tasks.map((task,index) => (
						<TaskItem
							key={task.id}
							task={task}
							index = {index}
							onComplete={onComplete}
							onDetailClick={onDetailClick}
						/>
					))
				)}
			</div>
		</div>
	);
}