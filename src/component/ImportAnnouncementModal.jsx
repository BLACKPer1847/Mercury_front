// 公告导入弹窗：粘贴正文或给链接 → 解析预览 → 管理员改完批量建草稿
//
// 解析只是给一个初值，所以预览里每个字段都能改；不选中的条目不会提交。

import { useState } from 'react';

import Alert from 'react-bootstrap/Alert';
import Badge from 'react-bootstrap/Badge';
import Button from 'react-bootstrap/Button';
import Form from 'react-bootstrap/Form';
import Modal from 'react-bootstrap/Modal';
import Nav from 'react-bootstrap/Nav';
import Spinner from 'react-bootstrap/Spinner';

import styles from './ImportAnnouncementModal.module.css';
import { adminApi } from '../api/client';

const TYPE_OPTIONS = [
  { value: 'longterm', label: '长期任务' },
  { value: 'daily', label: '每日任务' },
];

const RECURRENCE_OPTIONS = [
  { value: 'once', label: '一次性' },
  { value: 'daily', label: '每天重置' },
];

const CATEGORY_LABELS = {
  role: '角色',
  weapon: '武器',
  activity: '活动',
};

// 条目标题里已经带了原生叫法（共鸣者/弧盘/光锥/人形/干员），优先用它
function categoryLabel(item) {
  const prefix = String(item.title || '').split('：')[0];
  if (['共鸣者', '角色', '人形', '干员', '武器', '弧盘', '光锥'].includes(prefix)) {
    return prefix;
  }
  return CATEGORY_LABELS[item.category] || '';
}

// 解析器只认这几套方言；手输容易拼错，统一做成下拉选项
const PRESET_GAMES = ['鸣潮', '异环', '崩坏：星穹铁道', '明日方舟：终末地', '少女前线2：追放'];

function ImportAnnouncementModal({ show, onHide, games = [], onCreated }) {
  const [tab, setTab] = useState('text');
  const [gameName, setGameName] = useState('');
  const [text, setText] = useState('');
  const [url, setUrl] = useState('');

  // 预置游戏在前，已有模板里出现过的其他游戏追加在后面
  const gameOptions = [
    ...PRESET_GAMES,
    ...games.filter(game => !PRESET_GAMES.includes(game)),
  ];

  const [items, setItems] = useState([]);
  const [skipped, setSkipped] = useState(0);
  const [skippedItems, setSkippedItems] = useState([]);
  const [selected, setSelected] = useState([]);
  const [parsedProfile, setParsedProfile] = useState('');

  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [parsing, setParsing] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // 每次打开都从空白开始，避免上一次的预览混进来。
  // 放在 Modal 的 onShow 里重置：在 effect 里连续 setState 会多触发一轮渲染。
  const resetForm = () => {
    setTab('text');
    setText('');
    setUrl('');
    setItems([]);
    setParsedProfile('');
    setSkipped(0);
    setSkippedItems([]);
    setSelected([]);
    setError('');
    setMessage('');
    setParsing(false);
    setSubmitting(false);
  };

  const handleParse = async () => {
    setError('');
    setMessage('');
    setItems([]);
    setParsedProfile('');
    setSkipped(0);
    setSkippedItems([]);
    setSelected([]);

    if (!gameName) {
      setError('请先选择游戏');
      return;
    }
    if (tab === 'text' && !text.trim()) {
      setError('请先粘贴公告正文');
      return;
    }
    if (tab === 'url' && !url.trim()) {
      setError('请先填写公告链接');
      return;
    }

    setParsing(true);
    try {
      const data = tab === 'text'
        ? await adminApi.parseAnnouncement(text, gameName.trim())
        : await adminApi.parseAnnouncementUrl(url.trim(), gameName.trim());
      const parsed = (data.items || []).map(item => ({ ...item }));
      setItems(parsed);
      setParsedProfile(data.profile || '');
      setSkipped(data.skipped || 0);
      setSkippedItems(data.skipped_items || []);
      setSelected(parsed.map((_, index) => index));
      if (parsed.length === 0) {
        setError('没有从这段正文里认出活动，可以换一段或手动创建');
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setParsing(false);
    }
  };

  const updateItem = (index, field, value) => {
    setItems(prev => prev.map((item, i) => {
      if (i !== index) return item;
      const next = { ...item, [field]: value };
      // 长期任务没有「每天重置」，切类型时顺手纠正
      if (field === 'type' && value === 'longterm') next.recurrence = 'once';
      return next;
    }));
  };

  const toggleSelect = (index) => {
    setSelected(prev => (
      prev.includes(index) ? prev.filter(i => i !== index) : [...prev, index]
    ));
  };

  const allSelected = items.length > 0 && selected.length === items.length;
  const toggleSelectAll = () => {
    setSelected(allSelected ? [] : items.map((_, index) => index));
  };

  const handleCreate = async () => {
    setError('');
    setMessage('');
    const picked = selected.map(index => items[index]).filter(Boolean);
    if (picked.length === 0) {
      setError('请至少选中一条');
      return;
    }
    const emptyTitle = picked.some(item => !String(item.title || '').trim());
    if (emptyTitle) {
      setError('有条目没有活动名称');
      return;
    }
    const missingGame = picked.some(item => !String(item.game_name || gameName || '').trim());
    if (missingGame) {
      setError('有条目没有游戏名称，请在顶部填写游戏名');
      return;
    }

    setSubmitting(true);
    try {
      const payload = picked.map(item => ({
        title: String(item.title).trim(),
        game_name: String(item.game_name || gameName).trim(),
        type: item.type,
        recurrence: item.recurrence,
        start_date: item.start_date || null,
        end_date: item.end_date || null,
        description: item.description || null,
      }));
      const data = await adminApi.batchCreateTemplates(gameName.trim(), payload);
      const created = data.created || 0;
      const skippedCount = data.skipped || 0;
      setMessage(`已创建 ${created} 条草稿${skippedCount ? `，跳过 ${skippedCount} 条已有活动` : ''}`);
      setItems([]);
      setSelected([]);
      if (onCreated) onCreated(created);
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal show={show} onHide={onHide} onShow={resetForm} size="xl" centered scrollable>
      <Modal.Header closeButton>
        <Modal.Title>导入公告</Modal.Title>
      </Modal.Header>

      <Modal.Body>
        {error && <Alert variant="danger">{error}</Alert>}
        {message && <Alert variant="success">{message}</Alert>}

        <Form.Group className="mb-3" controlId="importGameName">
          <Form.Label>游戏名称</Form.Label>
          <Form.Select
            value={gameName}
            onChange={(e) => setGameName(e.target.value)}
          >
            <option value="">请选择游戏</option>
            {gameOptions.map(game => <option key={game} value={game}>{game}</option>)}
          </Form.Select>
          <Form.Text muted>
            解析器按游戏切换方言，选错游戏会认不出条目；公告里的条目都会挂到这个游戏下面
          </Form.Text>
        </Form.Group>

        <Nav variant="tabs" activeKey={tab} onSelect={(key) => setTab(key || 'text')} className="mb-3">
          <Nav.Item>
            <Nav.Link eventKey="text">粘贴正文</Nav.Link>
          </Nav.Item>
          <Nav.Item>
            <Nav.Link eventKey="url">公告链接</Nav.Link>
          </Nav.Item>
        </Nav>

        {tab === 'text' ? (
          <Form.Group controlId="importText">
            <Form.Control
              as="textarea"
              rows={8}
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="把公告正文整段粘进来（含活动名与活动时间那几行）"
            />
          </Form.Group>
        ) : (
          <Form.Group controlId="importUrl">
            <Form.Control
              type="url"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://www.bilibili.com/opus/..."
            />
            <Form.Text muted>
              只支持 www.bilibili.com 下的 /opus/、/read/、/video/ 页面；抓不到的正文请改用粘贴。
            </Form.Text>
          </Form.Group>
        )}

        <div className="d-flex align-items-center gap-2 mt-3">
          <Button variant="primary" onClick={handleParse} disabled={parsing}>
            {parsing ? <Spinner animation="border" size="sm" /> : '解析预览'}
          </Button>
          {items.length > 0 && (
            <span className={styles.summary}>
              识别到 {items.length} 条
              {skipped > 0 && `，跳过 ${skipped} 条`}
              {parsedProfile && `（按「${parsedProfile}」规则解析）`}
            </span>
          )}
        </div>

        {skippedItems.length > 0 && (
          <details className={styles.skippedBox}>
            <summary>被跳过的内容（{skippedItems.length} 条）</summary>
            <ul className={styles.skippedList}>
              {skippedItems.map((item, index) => (
                <li key={index}>
                  <span className={styles.skippedTitle}>{item.title}</span>
                  <span className={styles.skippedReason}>{item.reason}</span>
                </li>
              ))}
            </ul>
          </details>
        )}

        {items.length > 0 && (
          <div className={styles.tableWrap}>
            <table className="table table-sm align-middle mb-0">
              <thead>
                <tr>
                  <th style={{ width: '2.5rem' }}>
                    <input
                      type="checkbox"
                      className="form-check-input"
                      checked={allSelected}
                      onChange={toggleSelectAll}
                      aria-label="全选"
                    />
                  </th>
                  <th style={{ minWidth: '14rem' }}>活动名称</th>
                  <th style={{ minWidth: '5rem' }}>类别</th>
                  <th style={{ minWidth: '7rem' }}>类型</th>
                  <th style={{ minWidth: '7rem' }}>重置</th>
                  <th style={{ minWidth: '9rem' }}>开始</th>
                  <th style={{ minWidth: '9rem' }}>结束</th>
                  <th style={{ minWidth: '8rem' }}>提示</th>
                </tr>
              </thead>
              <tbody>
                {items.map((item, index) => (
                  <tr key={index} className={selected.includes(index) ? 'table-active' : ''}>
                    <td>
                      <input
                        type="checkbox"
                        className="form-check-input"
                        checked={selected.includes(index)}
                        onChange={() => toggleSelect(index)}
                        aria-label={`选择第 ${index + 1} 条`}
                      />
                    </td>
                    <td>
                      <Form.Control
                        size="sm"
                        type="text"
                        value={item.title}
                        onChange={(e) => updateItem(index, 'title', e.target.value)}
                      />
                      {item.description && (
                        <div className={styles.desc} title={item.description}>{item.description}</div>
                      )}
                    </td>
                    <td>
                      {categoryLabel(item) && (
                        <Badge bg="light" text="dark" className={styles.categoryBadge}>
                          {categoryLabel(item)}
                        </Badge>
                      )}
                    </td>
                    <td>
                      <Form.Select
                        size="sm"
                        value={item.type}
                        onChange={(e) => updateItem(index, 'type', e.target.value)}
                      >
                        {TYPE_OPTIONS.map(option => (
                          <option key={option.value} value={option.value}>{option.label}</option>
                        ))}
                      </Form.Select>
                    </td>
                    <td>
                      <Form.Select
                        size="sm"
                        value={item.recurrence}
                        disabled={item.type === 'longterm'}
                        onChange={(e) => updateItem(index, 'recurrence', e.target.value)}
                      >
                        {RECURRENCE_OPTIONS.map(option => (
                          <option key={option.value} value={option.value}>{option.label}</option>
                        ))}
                      </Form.Select>
                    </td>
                    <td>
                      <Form.Control
                        size="sm"
                        type="date"
                        value={item.start_date || ''}
                        onChange={(e) => updateItem(index, 'start_date', e.target.value)}
                      />
                    </td>
                    <td>
                      <Form.Control
                        size="sm"
                        type="date"
                        value={item.end_date || ''}
                        onChange={(e) => updateItem(index, 'end_date', e.target.value)}
                      />
                    </td>
                    <td>
                      {item.needs_review ? (
                        <Badge bg="danger" title={(item.warnings || []).join('；')}>
                          待复核
                        </Badge>
                      ) : (item.warnings || []).length === 0 ? (
                        <span className={styles.okMark}>—</span>
                      ) : (
                        <Badge bg="warning" text="dark" title={item.warnings.join('；')}>
                          需确认
                        </Badge>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Modal.Body>

      <Modal.Footer>
        <span className={styles.footerHint}>导入的条目一律先存成草稿，确认后再批量发布。</span>
        <Button variant="outline-secondary" onClick={onHide}>关闭</Button>
        <Button variant="success" onClick={handleCreate} disabled={submitting || selected.length === 0}>
          {submitting ? <Spinner animation="border" size="sm" /> : `创建 ${selected.length} 条草稿`}
        </Button>
      </Modal.Footer>
    </Modal>
  );
}

export default ImportAnnouncementModal;
