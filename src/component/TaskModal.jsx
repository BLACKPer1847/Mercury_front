import Modal from 'react-bootstrap/Modal';
import Button from 'react-bootstrap/Button';
import Form from 'react-bootstrap/Form';

import TaskForm from './TaskForm';
import useTaskForm from './useTaskForm';

/*
 * 添加/编辑待办弹窗：只负责 Modal 外壳和底部按钮。
 * 字段与校验复用 TaskForm / useTaskForm，提交成功后关闭弹窗。
 * 表单结构与拆分前保持一致，避免影响 Dashboard 的现有交互。
 */
export default function TaskModal({ show, onHide, onSubmit, onDelete, initialData = null }) {
    const isEdit = !!initialData;

    const { values, setValue, error, submitting, submit } = useTaskForm({
        initialData,
        resetToken: show,       // 每次打开弹窗都按 initialData 重新填充
        onSubmit,
        onSuccess: onHide,
    });

    return (
        <Modal show={show} onHide={onHide} centered backdrop="static">
            <Form onSubmit={submit}>
                <Modal.Header closeButton>
                    <Modal.Title>{isEdit ? '编辑待办' : '添加待办'}</Modal.Title>
                </Modal.Header>

                <Modal.Body>
                    <TaskForm values={values} onChange={setValue} error={error} />
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
