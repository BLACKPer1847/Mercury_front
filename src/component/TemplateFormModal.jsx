import { useEffect, useState } from 'react';
import Modal from 'react-bootstrap/Modal';
import Button from 'react-bootstrap/Button';
import Form from 'react-bootstrap/Form';
import Alert from 'react-bootstrap/Alert';

import { adminApi } from '../api/client';

/*
 * 新建 / 编辑活动模板。
 * 时间只精确到日期（date），与后端 templates.start_date / end_date 的 DATE 类型一致。
 * 新建的模板一律落为「草稿」，需要发布后在「从模板选择」里才可见。
 */
const EMPTY_VALUES = {
  game_name: '',
  title: '',
  type: 'daily',
  recurrence: 'once',
  start_date: '',
  end_date: '',
  description: '',
  source_url: '',
};

function templateToValues(template) {
  if (!template) return EMPTY_VALUES;
  return {
    game_name: template.game_name || '',
    title: template.title || '',
    type: template.type || 'daily',
    recurrence: template.recurrence || 'once',
    start_date: template.start_date || '',
    end_date: template.end_date || '',
    description: template.description || '',
    source_url: template.source_url || '',
  };
}

export default function TemplateFormModal({ show, onHide, template = null, games = [], onSaved }) {
  const isEdit = !!template;
  const [values, setValues] = useState(EMPTY_VALUES);
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);
  const [syncTip, setSyncTip] = useState('');

  useEffect(() => {
    if (show) {
      setValues(templateToValues(template));
      setError('');
      setSaving(false);
      setSyncTip('');
    }
  }, [show, template]);

  const setValue = (field, value) => {
    setValues(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');
    setSyncTip('');

    if (!values.title.trim()) {
      setError('活动名称不能为空');
      return;
    }
    if (!values.game_name.trim()) {
      setError('游戏名称不能为空');
      return;
    }
    if (values.start_date && values.end_date && values.start_date > values.end_date) {
      setError('开始日期不能晚于结束日期');
      return;
    }

    const payload = {
      game_name: values.game_name.trim(),
      title: values.title.trim(),
      type: values.type,
      // 长期任务没有「每天重置」，切换类型时后端也会拒绝这种组合
      recurrence: values.type === 'longterm' && values.recurrence === 'daily' ? 'once' : values.recurrence,
      start_date: values.start_date || null,
      end_date: values.end_date || null,
      description: values.description.trim() || null,
      source_url: values.source_url.trim() || null,
    };

    setSaving(true);
    try {
      if (isEdit) {
        const data = await adminApi.updateTemplate(template.id, payload);
        if (onSaved) onSaved(data);
        const synced = data.synced_tasks || 0;
        if (synced > 0) {
          setSyncTip(`已同步 ${synced} 条已接取任务的截止日期，用户会在首页看到更新`);
          return;   // 停留一下让管理员看到提示
        }
      } else {
        const data = await adminApi.createTemplate(payload);
        if (onSaved) onSaved(data);
      }
      onHide();
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const games_ = [...new Set([...games, values.game_name].filter(Boolean))];

  return (
    <Modal show={show} onHide={onHide} centered backdrop="static" size="lg">
      <Form onSubmit={handleSubmit}>
        <Modal.Header closeButton>
          <Modal.Title>{isEdit ? '编辑活动' : '新建活动'}</Modal.Title>
        </Modal.Header>

        <Modal.Body>
          {error && <Alert variant="danger">{error}</Alert>}
          {syncTip && <Alert variant="success">{syncTip}</Alert>}

          <Form.Group className="mb-3">
            <Form.Label>游戏名称</Form.Label>
            <Form.Control
              type="text"
              value={values.game_name}
              onChange={(e) => setValue('game_name', e.target.value)}
              list="admin-game-options"
              placeholder="例如：鸣潮"
              autoFocus
            />
            <datalist id="admin-game-options">
              {games_.map(game => <option key={game} value={game} />)}
            </datalist>
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>活动名称</Form.Label>
            <Form.Control
              type="text"
              value={values.title}
              onChange={(e) => setValue('title', e.target.value)}
              placeholder="例如：3.7 版本限时活动"
            />
          </Form.Group>

          <div className="row">
            <Form.Group className="mb-3 col-md-6">
              <Form.Label>任务类型</Form.Label>
              <Form.Select value={values.type} onChange={(e) => setValue('type', e.target.value)}>
                <option value="daily">每日任务</option>
                <option value="longterm">长期任务</option>
              </Form.Select>
            </Form.Group>

            <Form.Group className="mb-3 col-md-6">
              <Form.Label>重置规则</Form.Label>
              <Form.Select
                value={values.type === 'longterm' ? 'once' : values.recurrence}
                onChange={(e) => setValue('recurrence', e.target.value)}
                disabled={values.type === 'longterm'}
              >
                <option value="once">一次性（完成即结束）</option>
                <option value="daily">每天重置（签到类）</option>
              </Form.Select>
              <Form.Text className="text-muted">
                每天重置的活动结束后会自动归档，不会无限循环。
              </Form.Text>
            </Form.Group>
          </div>

          <div className="row">
            <Form.Group className="mb-3 col-md-6">
              <Form.Label>开始日期（可留空）</Form.Label>
              <Form.Control
                type="date"
                value={values.start_date}
                onChange={(e) => setValue('start_date', e.target.value)}
              />
            </Form.Group>

            <Form.Group className="mb-3 col-md-6">
              <Form.Label>结束日期 / 截止日（可留空）</Form.Label>
              <Form.Control
                type="date"
                value={values.end_date}
                onChange={(e) => setValue('end_date', e.target.value)}
              />
              <Form.Text className="text-muted">
                接取后作为任务的截止日期；修改后会同步给已接取且未完成的任务。
              </Form.Text>
            </Form.Group>
          </div>

          <Form.Group className="mb-3">
            <Form.Label>活动描述（选填）</Form.Label>
            <Form.Control
              as="textarea"
              rows={3}
              value={values.description}
              onChange={(e) => setValue('description', e.target.value)}
              placeholder="活动规则、奖励等补充说明..."
            />
          </Form.Group>

          <Form.Group className="mb-1">
            <Form.Label>来源链接（选填）</Form.Label>
            <Form.Control
              type="text"
              value={values.source_url}
              onChange={(e) => setValue('source_url', e.target.value)}
              placeholder="https://..."
            />
          </Form.Group>
        </Modal.Body>

        <Modal.Footer>
          <Button variant="secondary" onClick={onHide} disabled={saving}>取消</Button>
          <Button variant="primary" type="submit" disabled={saving}>
            {saving ? '保存中...' : (isEdit ? '保存' : '创建为草稿')}
          </Button>
        </Modal.Footer>
      </Form>
    </Modal>
  );
}
