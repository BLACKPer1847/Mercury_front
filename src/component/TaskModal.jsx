import { useState } from 'react';
import Modal from 'react-bootstrap/Modal';
import Button from 'react-bootstrap/Button';
import Form from 'react-bootstrap/Form';
import Nav from 'react-bootstrap/Nav';

import TaskForm from './TaskForm';
import TemplatePicker from './TemplatePicker';
import useTaskForm from './useTaskForm';

/*
 * 添加/编辑待办弹窗：只负责 Modal 外壳和底部按钮。
 * 字段与校验复用 TaskForm / useTaskForm，提交成功后关闭弹窗。
 * 新增（非编辑）时提供两个页签：
 *   - 手动填写：原来的表单
 *   - 从模板选择：浏览管理员发布的活动并接取（接取后自动生成一条待办）
 */
export default function TaskModal({ show, onHide, onSubmit, onDelete, onClaimTemplate, initialData = null }) {
    const isEdit = !!initialData;
    const [tab, setTab] = useState('manual');

    const { values, setValue, error, submitting, submit } = useTaskForm({
        initialData,
        resetToken: show,       // 每次打开弹窗都按 initialData 重新填充
        onSubmit,
        onSuccess: onHide,
    });

    const handleClaim = async (templateId) => {
        await onClaimTemplate(templateId);
        onHide();
    };

    return (
        <Modal show={show} onHide={onHide} centered backdrop="static">
            {!isEdit && (
                <Modal.Header closeButton>
                    <Nav variant="tabs" activeKey={tab} onSelect={(key) => setTab(key || 'manual')}>
                        <Nav.Item>
                            <Nav.Link eventKey="manual">手动填写</Nav.Link>
                        </Nav.Item>
                        <Nav.Item>
                            <Nav.Link eventKey="template">从模板选择</Nav.Link>
                        </Nav.Item>
                    </Nav>
                </Modal.Header>
            )}

            <Form onSubmit={submit}>
                {isEdit && (
                    <Modal.Header closeButton>
                        <Modal.Title>编辑待办</Modal.Title>
                    </Modal.Header>
                )}

                <Modal.Body>
                    {!isEdit && tab === 'template' ? (
                        <TemplatePicker onClaim={handleClaim} />
                    ) : (
                        <TaskForm values={values} onChange={setValue} error={error} />
                    )}
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
                    {!( !isEdit && tab === 'template') && (
                        <Button variant="primary" type="submit" disabled={submitting}>
                            {submitting ? '提交中...' : (isEdit ? '保存' : '添加')}
                        </Button>
                    )}
                </Modal.Footer>
            </Form>
        </Modal>
    )
}
