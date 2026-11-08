import { useEffect, useState } from 'react';
import Modal from 'react-bootstrap/Modal';
import Button from 'react-bootstrap/Button';
import Alert from 'react-bootstrap/Alert';
import Spinner from 'react-bootstrap/Spinner';

import { adminApi } from '../api/client';
import ConfirmModal from './ConfirmModal';
import CrawlSourceAddModal from './CrawlSourceAddModal';

/*
 * 管理爬虫对象弹窗：
 * - 单击一行选中，再次单击取消选中，可以多选
 * - 底部「增加」打开新增弹窗；「删除」删除选中的对象（物理删除，二次确认）
 */
export default function CrawlSourceModal({ show, onHide, games = [] }) {
  const [items, setItems] = useState([]);
  const [selectedIds, setSelectedIds] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showAdd, setShowAdd] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const fetchSources = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await adminApi.listCrawlSources();
      setItems(data.items || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (show) {
      setSelectedIds([]);
      fetchSources();
    }
  }, [show]);

  const toggleSelect = (id) => {
    setSelectedIds(prev => (
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
    ));
  };

  const allSelected = items.length > 0 && selectedIds.length === items.length;
  const toggleSelectAll = () => {
    setSelectedIds(allSelected ? [] : items.map(item => item.id));
  };

  const handleDelete = async () => {
    setDeleting(true);
    setError('');
    try {
      await adminApi.deleteCrawlSources(selectedIds);
      setSelectedIds([]);
      setConfirmDelete(false);
      await fetchSources();
    } catch (err) {
      setError(err.message);
      setConfirmDelete(false);
    } finally {
      setDeleting(false);
    }
  };

  const selectedNames = items
    .filter(item => selectedIds.includes(item.id))
    .map(item => `${item.display_name}（${item.platform_uid}）`)
    .join('、');

  return (
    <>
      <Modal show={show} onHide={onHide} centered backdrop="static" size="lg">
        <Modal.Header closeButton>
          <Modal.Title>管理爬虫对象</Modal.Title>
        </Modal.Header>

        <Modal.Body>
          {error && <Alert variant="danger">{error}</Alert>}

          {loading ? (
            <div className="text-center py-4">
              <Spinner animation="border" />
            </div>
          ) : items.length === 0 ? (
            <p className="text-muted mb-0">还没有爬虫对象，点「增加」添加游戏官方的 B 站账号。</p>
          ) : (
            <div className="table-responsive">
              <table className="table table-hover align-middle mb-0">
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
                    <th>名称</th>
                    <th>平台 / UID</th>
                    <th>游戏</th>
                    <th>抓取间隔</th>
                    <th>最近抓取</th>
                  </tr>
                </thead>
                <tbody>
                  {items.map(item => (
                    <tr
                      key={item.id}
                      onClick={() => toggleSelect(item.id)}
                      style={{ cursor: 'pointer' }}
                      className={selectedIds.includes(item.id) ? 'table-active' : ''}
                    >
                      <td onClick={(e) => e.stopPropagation()}>
                        <input
                          type="checkbox"
                          className="form-check-input"
                          checked={selectedIds.includes(item.id)}
                          onChange={() => toggleSelect(item.id)}
                          aria-label={`选择 ${item.display_name}`}
                        />
                      </td>
                      <td>{item.display_name}</td>
                      <td>{item.platform} / {item.platform_uid}</td>
                      <td>{item.game_name}</td>
                      <td>{item.crawl_interval} 分钟</td>
                      <td className="text-muted">
                        {item.last_crawled_at ? item.last_crawled_at.replace('T', ' ').slice(0, 16) : '未抓取'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Modal.Body>

        <Modal.Footer>
          <Button variant="outline-primary" onClick={() => setShowAdd(true)} style={{ marginRight: 'auto' }}>
            <i className="bi bi-plus-lg"></i> 增加
          </Button>
          <Button
            variant="outline-danger"
            onClick={() => setConfirmDelete(true)}
            disabled={selectedIds.length === 0}
          >
            <i className="bi bi-trash"></i> 删除
          </Button>
          <Button variant="secondary" onClick={onHide}>关闭</Button>
        </Modal.Footer>
      </Modal>

      <CrawlSourceAddModal
        show={showAdd}
        onHide={() => setShowAdd(false)}
        games={games}
        onCreated={fetchSources}
      />

      <ConfirmModal
        show={confirmDelete}
        title="确认删除"
        message={`确认删除爬虫对象「${selectedNames}」？已抓取的模板不受影响。`}
        confirmText="删除"
        variant="danger"
        loading={deleting}
        onConfirm={handleDelete}
        onCancel={() => setConfirmDelete(false)}
      />
    </>
  );
}
