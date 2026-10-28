/*
 * TaskForm 的表单模型与状态逻辑：
 * - 任务对象 <-> 表单值 <-> 提交 payload 的转换（空 deadline / 空描述统一转 null）
 * - 输入校验、提交中状态、错误信息
 * 展示在 TaskForm.jsx，API 调用由使用方（TaskModal / TaskEdit）通过 onSubmit 注入，
 * 这样弹窗和编辑页共用同一套字段规则，不会出现两处校验不一致。
 */

import { useEffect, useState } from 'react';

export const TYPE_OPTIONS = [
  { value: 'daily', label: '每日任务' },
  { value: 'longterm', label: '长期任务' },
];

export const STATUS_OPTIONS = [
  { value: 'pending', label: '待办' },
  { value: 'done', label: '已完成' },
  { value: 'archived', label: '已归档' },
];

// 'YYYY-MM-DD' -> Date
// 按本地时区构造，避免 new Date('2026-10-01') 被当成 UTC 零点导致日期少一天
export function parseDate(str) {
  if (!str) return null;
  const [y, m, d] = str.split('-').map(Number);
  return new Date(y, m - 1, d);
}

// Date -> 'YYYY-MM-DD'
export function formatDate(date) {
  if (!date) return '';
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

// 后端返回的任务对象 -> 表单值（字段缺失时给出可用的初值）
export function taskToFormValues(task) {
  return {
    title: task?.title || '',
    type: task?.type || 'daily',
    status: task?.status || 'pending',
    deadline: task?.deadline || '',
    description: task?.description || '',
    is_starred: Boolean(task?.is_starred),
  };
}

// 表单值 -> 提交给后端的 payload
// 1. 非长期任务不提交截止日期（与后端"type=daily 时 deadline 无意义"一致）
// 2. 空字符串统一转 null，交给后端 or None 兜底
export function formValuesToPayload(values) {
  return {
    title: values.title.trim(),
    type: values.type,
    status: values.status,
    deadline: values.type === 'longterm' && values.deadline ? values.deadline : null,
    description: values.description.trim() || null,
    is_starred: values.is_starred,
  };
}

export default function useTaskForm({ initialData = null, resetToken, onSubmit, onSuccess } = {}) {
  const [values, setValues] = useState(() => taskToFormValues(initialData));
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // resetToken 变化时（弹窗被打开 / 切换到另一条任务）重新初始化表单。
  // 这里刻意只依赖 resetToken：保存成功后页面会重新拉取任务数据，
  // initialData 会变成新对象，若跟着重置会覆盖用户正在编辑的内容。
  useEffect(() => {
    setValues(taskToFormValues(initialData));
    setError('');
    setSubmitting(false);
  }, [resetToken]);

  // 更新单个字段（受控组件直接把新值传回来，Select/Switch/DatePicker 都适用）
  const setValue = (field, value) => {
    setValues(prev => ({ ...prev, [field]: value }));
  };

  // 提交：先本地校验，再把错误交给 onSubmit 抛出的 message 展示
  const submit = async (event) => {
    if (event) event.preventDefault();
    setError('');

    if (!values.title.trim()) {
      setError('任务名称不能为空');
      return;
    }

    setSubmitting(true);
    try {
      await onSubmit(formValuesToPayload(values));
      if (onSuccess) onSuccess();
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  return { values, setValue, error, setError, submitting, submit };
}
