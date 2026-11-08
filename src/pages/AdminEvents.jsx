// 管理事件页（仅管理员）：维护活动模板、批量发布、管理爬虫对象

import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import styles from './AdminEvents.module.css';
import Alert from 'react-bootstrap/Alert';
import Badge from 'react-bootstrap/Badge';
import Button from 'react-bootstrap/Button';
import Form from 'react-bootstrap/Form';
import Spinner from 'react-bootstrap/Spinner';

import PageHeader from '../component/PageHeader';
import Pagination from '../component/Pagination';
import TemplateFormModal from '../component/TemplateFormModal';
import CrawlSourceModal from '../component/CrawlSourceModal';
import { adminApi, auth } from '../api/client';

const STATUS_LABEL = { draft: '草稿', published: '已发布', archived: '已下架' };
const STATUS_VARIANT = { draft: 'secondary', published: 'success', archived: 'dark' };
const TYPE_LABEL = { daily: '每日', longterm: '长期' };
const RECURRENCE_LABEL = { once: '一次性', daily: '每天重置' };

const PAGE_SIZE = 20;

function AdminEvents() {
  const navigate = useNavigate();

  const [items, setItems] = useState([]);
  const [total, setTotal] = useState(0);
  const [pages, setPages] = useState(1);
  const [page, setPage] = useState(1);

  const [statusFilter, setStatusFilter] = useState('all');
  const [gameFilter, setGameFilter] = useState('');
  const [keyword, setKeyword] = useState('');
  const [appliedKeyword, setAppliedKeyword] = useState('');

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  const [selectedIds, setSelectedIds] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState(null);
  const [showCrawl, setShowCrawl] = useState(false);
  const [busyId, setBusyId] = useState(null);

  const fetchTemplates = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await adminApi.listTemplates({
        status: statusFilter,
        game_name: gameFilter.trim(),
        keyword: appliedKeyword,
        page,
        limit: PAGE_SIZE,
      });
      setItems(data.items || []);
      setTotal(data.total || 0);
      setPages(data.pages || 1);
      setSelectedIds([]);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTemplates();
  }, [page, statusFilter, gameFilter, appliedKeyword]);

  // 游戏下拉选项：从当前页数据里收集，够用且不需要额外接口
  const games = [...new Set(items.map(item => item.game_name).filter(Boolean))];

  const toggleSelect = (id) => {
    setSelectedIds(prev => (
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
    ));
  };

  const allSelected = items.length > 0 && selectedIds.length === items.length;
  const toggleSelectAll = () => {
    setSelectedIds(allSelected ? [] : items.map(item => item.id));
  };

  const handleSearch = (event) => {
    event.preventDefault();
    setPage(1);
    setAppliedKeyword(keyword.trim());
  };

  const handleBatchPublish = async () => {
    setError('');
    setMessage('');
    try {
      const data = await adminApi.batchPublish(selectedIds);
      setMessage(data.message);
      await fetchTemplates();
    } catch (err) {
      setError(err.message);
    }
  };

  const handleStatusChange = async (template, status) => {
    setError('');
    setMessage('');
    setBusyId(template.id);
    try {
      await adminApi.updateTemplateStatus(template.id, status);
      await fetchTemplates();
    } catch (err) {
      setError(err.message);
    } finally {
      setBusyId(null);
    }
  };

  const openCreate = () => {
    setEditingTemplate(null);
    setShowForm(true);
  };

  const openEdit = (template) => {
    setEditingTemplate(template);
    setShowForm(true);
  };

  const formatDate = (value) => (value ? value.replaceAll('-', '/') : '');

  const handleExit = () => {
    auth.logout();
    navigate('/login');
  };

  return (
    <div className={styles.page}>
      <PageHeader
        showBack
        onBack={() => navigate('/dashboard')}
        actions={[
          { icon: 'bi-plus-lg', label: '新建活动', variant: 'success', onClick: openCreate },
          { icon: 'bi-diagram-3', label: '管理爬虫对象', variant: 'secondary', onClick: () => setShowCrawl(true) },
          { icon: 'bi-box-arrow-right', label: '登出', variant: 'dark', onClick: handleExit },
        ]}
      />

      {error && <Alert variant="danger">{error}</Alert>}
      {message && <Alert variant="success" dismissible onClose={() => setMessage('')}>{message}</Alert>}

      <div className={styles.toolbar}>
        <Form onSubmit={handleSearch} className={styles.filters}>
          <Form.Select
            value={statusFilter}
            onChange={(e) => { setPage(1); setStatusFilter(e.target.value); }}
            style={{ maxWidth: '9rem' }}
          >
            <option value="all">全部状态</option>
            <option value="draft">草稿</option>
            <option value="published">已发布</option>
            <option value="archived">已下架</option>
          </Form.Select>

          <Form.Control
            type="text"
            value={gameFilter}
            onChange={(e) => { setPage(1); setGameFilter(e.target.value); }}
            placeholder="按游戏筛选"
            style={{ maxWidth: '10rem' }}
          />

          <Form.Control
            type="text"
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
            placeholder="搜索活动名称"
            style={{ maxWidth: '14rem' }}
          />
          <Button variant="outline-primary" type="submit">搜索</Button>
        </Form>

        <Button
          variant="primary"
          onClick={handleBatchPublish}
          disabled={selectedIds.length === 0}
        >
          批量发布{selectedIds.length > 0 ? `（${selectedIds.length}）` : ''}
        </Button>
      </div>

      {loading ? (
        <div className="text-center py-5"><Spinner animation="border" /></div>
      ) : items.length === 0 ? (
        <div className={styles.empty}>还没有活动，点「新建活动」创建，或等爬虫导入草稿。</div>
      ) : (
        <>
          <div className={styles.tableWrap}>
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
                  <th>游戏</th>
                  <th>活动名称</th>
                  <th>类型</th>
                  <th>开始</th>
                  <th>结束</th>
                  <th>状态</th>
                  <th>接取</th>
                  <th>来源</th>
                  <th>操作</th>
                </tr>
              </thead>
              <tbody>
                {items.map(template => (
                  <tr key={template.id} className={selectedIds.includes(template.id) ? 'table-active' : ''}>
                    <td>
                      <input
                        type="checkbox"
                        className="form-check-input"
                        checked={selectedIds.includes(template.id)}
                        onChange={() => toggleSelect(template.id)}
                        aria-label={`选择 ${template.title}`}
                      />
                    </td>
                    <td>{template.game_name}</td>
                    <td>
                      {template.title}
                      <div className={styles.subText}>
                        {RECURRENCE_LABEL[template.recurrence]}
                        {template.source_url && ' · 有来源'}
                      </div>
                    </td>
                    <td>{TYPE_LABEL[template.type]}</td>
                    <td>{formatDate(template.start_date) || '—'}</td>
                    <td>
                      {template.end_date ? formatDate(template.end_date) : (
                        <Badge bg="warning" text="dark">未设置</Badge>
                      )}
                    </td>
                    <td>
                      <Badge bg={STATUS_VARIANT[template.status]}>{STATUS_LABEL[template.status]}</Badge>
                    </td>
                    <td>{template.claim_count}</td>
                    <td>
                      <Badge bg={template.source === 'crawler' ? 'info' : 'light'} text="dark">
                        {template.source === 'crawler' ? '爬虫' : '手动'}
                      </Badge>
                    </td>
                    <td>
                      <div className={styles.rowActions}>
                        <Button size="sm" variant="outline-secondary" onClick={() => openEdit(template)}>
                          编辑
                        </Button>
                        {template.status !== 'published' && (
                          <Button
                            size="sm"
                            variant="outline-success"
                            disabled={busyId === template.id}
                            onClick={() => handleStatusChange(template, 'published')}
                          >
                            发布
                          </Button>
                        )}
                        {template.status === 'published' && (
                          <Button
                            size="sm"
                            variant="outline-danger"
                            disabled={busyId === template.id}
                            onClick={() => handleStatusChange(template, 'archived')}
                          >
                            下架
                          </Button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <Pagination currentPage={page} totalPages={pages} onPageChange={setPage} />
          <div className={styles.totalInfo}>共 {total} 个活动</div>
        </>
      )}

      <TemplateFormModal
        show={showForm}
        onHide={() => setShowForm(false)}
        template={editingTemplate}
        games={games}
        onSaved={() => fetchTemplates()}
      />

      <CrawlSourceModal
        show={showCrawl}
        onHide={() => setShowCrawl(false)}
        games={games}
      />
    </div>
  );
}

export default AdminEvents;
