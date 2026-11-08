import { useEffect, useState } from 'react';
import Modal from 'react-bootstrap/Modal';
import Button from 'react-bootstrap/Button';
import Form from 'react-bootstrap/Form';
import Alert from 'react-bootstrap/Alert';

import { adminApi } from '../api/client';

/*
 * 新增爬虫对象：填写游戏官方的 B 站账号（UID + 名称）。
 * 目前只做数据维护，第二阶段爬虫会按这张表的记录去抓公告。
 */
const EMPTY_VALUES = {
  game_name: '',
  platform_uid: '',
  display_name: '',
  crawl_interval: 360,
};

export default function CrawlSourceAddModal({ show, onHide, games = [], onCreated }) {
  const [values, setValues] = useState(EMPTY_VALUES);
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (show) {
      setValues(EMPTY_VALUES);
      setError('');
      setSaving(false);
    }
  }, [show]);

  const setValue = (field, value) => {
    setValues(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');

    if (!values.game_name.trim()) {
      setError('游戏名称不能为空');
      return;
    }
    if (!/^\d{1,12}$/.test(values.platform_uid.trim())) {
      setError('B 站 UID 必须是 1~12 位数字');
      return;
    }
    if (!values.display_name.trim()) {
      setError('显示名称不能为空');
      return;
    }

    setSaving(true);
    try {
      await adminApi.createCrawlSource({
        game_name: values.game_name.trim(),
        platform_uid: values.platform_uid.trim(),
        display_name: values.display_name.trim(),
        crawl_interval: Number(values.crawl_interval) || 360,
      });
      if (onCreated) onCreated();
      onHide();
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const gameOptions = [...new Set([...games, values.game_name].filter(Boolean))];

  return (
    <Modal show={show} onHide={onHide} centered backdrop="static">
      <Form onSubmit={handleSubmit}>
        <Modal.Header closeButton>
          <Modal.Title>新增爬虫对象</Modal.Title>
        </Modal.Header>

        <Modal.Body>
          {error && <Alert variant="danger">{error}</Alert>}

          <Form.Group className="mb-3">
            <Form.Label>游戏名称</Form.Label>
            <Form.Control
              type="text"
              value={values.game_name}
              onChange={(e) => setValue('game_name', e.target.value)}
              list="crawl-game-options"
              placeholder="例如：鸣潮"
              autoFocus
            />
            <datalist id="crawl-game-options">
              {gameOptions.map(game => <option key={game} value={game} />)}
            </datalist>
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>B 站 UID</Form.Label>
            <Form.Control
              type="text"
              value={values.platform_uid}
              onChange={(e) => setValue('platform_uid', e.target.value)}
              placeholder="例如：12345678"
              inputMode="numeric"
            />
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>显示名称</Form.Label>
            <Form.Control
              type="text"
              value={values.display_name}
              onChange={(e) => setValue('display_name', e.target.value)}
              placeholder="例如：鸣潮官方"
            />
          </Form.Group>

          <Form.Group className="mb-1">
            <Form.Label>抓取间隔（分钟）</Form.Label>
            <Form.Control
              type="number"
              min="5"
              max="10080"
              value={values.crawl_interval}
              onChange={(e) => setValue('crawl_interval', e.target.value)}
            />
            <Form.Text className="text-muted">默认 360 分钟（6 小时），5~10080 之间。</Form.Text>
          </Form.Group>
        </Modal.Body>

        <Modal.Footer>
          <Button variant="secondary" onClick={onHide} disabled={saving}>取消</Button>
          <Button variant="primary" type="submit" disabled={saving}>
            {saving ? '保存中...' : '创建'}
          </Button>
        </Modal.Footer>
      </Form>
    </Modal>
  );
}
