import styles from './TaskModal.module.css'

import { useState, useEffect } from 'react';
import Modal from 'react-bootstrap/Modal';
import Button from 'react-bootstrap/Button';
import Form from 'react-bootstrap/Form';
// React日期选择组件
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';

function parseDate(str) {
    if (!str) return null;
    const [y, m, d] = str.split('-').map(Number);
    return new Date(y, m - 1, d);
}

function formatDate(date) {
    if (!date) return '';
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, '0');
    const d = String(date.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
}

export default function TaskModal({ show, onHide, onSubmit, onDelete, initialData = null }) {
    const isEdit = !!initialData;

    const [title, setTitle] = useState('');
    const [type, setType] = useState('daily');
    const [deadline, setDeadline] = useState('');
    const [description, setDescription] = useState('');
    const [error, setError] = useState('');
    const [submitting, setSubmitting] = useState(false);

    // 每次打开时重置或填充表单
    useEffect(() => {
        if (show) {
            setTitle(initialData?.title || '');
            setType(initialData?.type || 'daily');
            setDeadline(initialData?.deadline || '');
            setDescription(initialData?.description || '');
            setError('');
            setSubmitting(false);
        }
    }, [show, initialData]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        // 校验
        if (!title.trim()) {
            setError('任务名称不能为空');
            return;
        }
        /*
        if (type === 'longterm' && !deadline) {
            setError('长期任务必须设置截止日期');
            return;
        }
        */

        setSubmitting(true);
        try {
            await onSubmit({
                title: title.trim(),
                type,
                deadline: type === 'longterm' && deadline ? deadline : null,
                description: description.trim() || null,
            });
            onHide();
        } catch (err) {
            setError(err.message);
        } finally {
            setSubmitting(false);
        }
    }

    return (
        <Modal show={show} onHide={onHide} centered backdrop="static">
            <Form onSubmit={handleSubmit}>
                <Modal.Header closeButton>
                    <Modal.Title>{isEdit ? '编辑待办' : '添加待办'}</Modal.Title>
                </Modal.Header>

                <Modal.Body>
                    {/* 错误显示 */}
                    {error && <p className="text-danger">{error}</p>}

                    <Form.Group className="mb-3">
                        <Form.Label>任务名称</Form.Label>
                        <Form.Control
                            type="text"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            placeholder="输入任务名称"
                            autoFocus
                        />
                    </Form.Group>

                    <Form.Group className="mb-3">
                        <Form.Label>待办任务类型</Form.Label>
                        <Form.Select value={type} onChange={(e) => setType(e.target.value)}>
                            <option value="daily">每日任务</option>
                            <option value="longterm">长期任务</option>
                        </Form.Select>
                    </Form.Group>

                    {type === 'longterm' && (
                        <Form.Group className="mb-3">
                            <Form.Label>截止日期（可留空）</Form.Label>
                            <DatePicker
                                selected={deadline ? parseDate(deadline) : null}
                                onChange={(date) => setDeadline(date ? formatDate(date) : '')}
                                dateFormat="yyyy/MM/dd"
                                placeholderText="yyyy/MM/dd"
                                isClearable
                                className="form-control"
                            />
                        </Form.Group>
                    )}

                    <Form.Group className="mb-3">
                        <Form.Label>任务描述（选填）</Form.Label>
                        <Form.Control
                            as="textarea"
                            rows={4}
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            placeholder="补充说明..."
                        />
                    </Form.Group>
                </Modal.Body>

                <Modal.Footer>
                    {isEdit && (
                        <Button
                        variant="outline-danger"
                        onClick={onDelete}
                        disabled={submitting}
                        style={{ marginRight: 'auto' }}
                        >
                        删除
                        </Button>
                    )}
                    <Button variant="secondary" onClick={onHide} disabled={submitting}>
                        取消
                    </Button>
                    <Button variant="primary" type="submit" disabled={submitting}>
                        {submitting ? '提交中...' : (isEdit ? '保存' : '添加')}
                    </Button>
                </Modal.Footer>
            </Form>
        </Modal>
    )

}