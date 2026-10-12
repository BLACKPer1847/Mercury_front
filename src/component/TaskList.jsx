import styles from "./TaskList.module.css";
import TaskItem from "./TaskItem";

// onComplete,onDetailClick需要调用Api，业务逻辑不放到组件里
export default function TaskList({ title, tasks, onComplete, onDetailClick }) {

	return (
		<div className={styles.panel}>
			<div className={styles.header}>
				<h2>{title}</h2>
				<span className={styles.badge}>{tasks.length} 个任务</span>
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