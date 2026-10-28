import Form from 'react-bootstrap/Form';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';

import { STATUS_OPTIONS, TYPE_OPTIONS, formatDate, parseDate } from './useTaskForm';

/*
 * 待办表单的字段区（纯展示的受控组件）：
 * values / onChange 由 useTaskForm 提供，这里不发请求、不持有业务状态。
 * showStatus / showStar 用来按场景开关字段：
 *   - 弹窗（Dashboard 添加/编辑）：不显示，保持原有交互
 *   - 编辑页（TaskEdit）：显示，管理页需要的状态和星标在这里改
 */
export default function TaskForm({ values, onChange, error = '', showStatus = false, showStar = false }) {
  const { title, type, status, deadline, description, is_starred } = values;

  return (
    <>
      {error && <p className="text-danger">{error}</p>}

      <Form.Group className="mb-3">
        <Form.Label>任务名称</Form.Label>
        <Form.Control
          type="text"
          value={title}
          onChange={(e) => onChange('title', e.target.value)}
          placeholder="输入任务名称"
          autoFocus
        />
      </Form.Group>

      <Form.Group className="mb-3">
        <Form.Label>待办任务类型</Form.Label>
        <Form.Select value={type} onChange={(e) => onChange('type', e.target.value)}>
          {TYPE_OPTIONS.map(option => (
            <option key={option.value} value={option.value}>{option.label}</option>
          ))}
        </Form.Select>
      </Form.Group>

      {showStatus && (
        <Form.Group className="mb-3">
          <Form.Label>任务状态</Form.Label>
          <Form.Select value={status} onChange={(e) => onChange('status', e.target.value)}>
            {STATUS_OPTIONS.map(option => (
              <option key={option.value} value={option.value}>{option.label}</option>
            ))}
          </Form.Select>
          <Form.Text className="text-muted">
            每日任务每天 0 点自动把「已完成」重置为「待办」；长期任务过期后自动归档。
          </Form.Text>
        </Form.Group>
      )}

      {type === 'longterm' && (
        <Form.Group className="mb-3">
          <Form.Label>截止日期（可留空）</Form.Label>
          <DatePicker
            selected={deadline ? parseDate(deadline) : null}
            onChange={(date) => onChange('deadline', date ? formatDate(date) : '')}
            dateFormat="yyyy/MM/dd"
            placeholderText="yyyy/MM/dd"
            isClearable
            className="form-control"
          />
        </Form.Group>
      )}

      {showStar && (
        <Form.Group className="mb-3">
          <Form.Label>星标</Form.Label>
          <Form.Check
            type="switch"
            id="task-star"
            label="标记为星标（长期任务列表会优先展示）"
            checked={is_starred}
            onChange={(e) => onChange('is_starred', e.target.checked)}
          />
        </Form.Group>
      )}

      <Form.Group className="mb-3">
        <Form.Label>任务描述（选填）</Form.Label>
        <Form.Control
          as="textarea"
          rows={4}
          value={description}
          onChange={(e) => onChange('description', e.target.value)}
          placeholder="补充说明..."
        />
      </Form.Group>
    </>
  );
}
