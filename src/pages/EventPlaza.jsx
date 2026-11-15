import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import Alert from 'react-bootstrap/Alert';
import Badge from 'react-bootstrap/Badge';
import Button from 'react-bootstrap/Button';
import Form from 'react-bootstrap/Form';
import Spinner from 'react-bootstrap/Spinner';

import styles from './EventPlaza.module.css';
import ConfirmModal from '../component/ConfirmModal';
import PageHeader from '../component/PageHeader';
import { templateApi } from '../api/client';

/*
 * 活动广场：只展示管理员已发布（published）的活动。
 * 列表第一层是游戏，点开才展开该游戏的活动；
 * 「添加为待办」与「活动详情」本版先占位，取消接取已可用。
 */
const PAGE_LIMIT = 200;

// 只取本地日期（YYYY-MM-DD），和后端 date 字段直接做字符串比较
function todayString() {
  const now = new Date();
  const local = new Date(now.getTime() - now.getTimezoneOffset() * 60000);
  return local.toISOString().slice(0, 10);
}

function formatRange(template) {
  const start = template.start_date ? template.start_date.replaceAll('-', '/') : '';
  const end = template.end_date ? template.end_date.replaceAll('-', '/') : '';
  if (start && end) return `${start} ~ ${end}`;
  if (end) return `截止 ${end}`;
  if (start) return `${start} 开始`;
  return '未设置时间';
}

export default function EventPlaza() {
  const navigate = useNavigate();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showExpired, setShowExpired] = useState(false);
  const [expandedGames, setExpandedGames] = useState([]);
  const [cancelTarget, setCancelTarget] = useState(null);
  const [cancelling, setCancelling] = useState(false);

  const today = todayString();

  const fetchTemplates = async () => {
    setLoading(true);
    setError('');
    try {
      const params = { limit: PAGE_LIMIT };
      if (showExpired) params.include_expired = '1';
      const data = await templateApi.getAll(params);
      setItems(data.items || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTemplates();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [showExpired]);

  // 后端已按「游戏名 → 结束日期」排好序，这里只做分组，顺序保持不变
  const groups = useMemo(() => {
    const map = new Map();
    items.forEach(item => {
      const game = item.game_name || '未分类';
      if (!map.has(game)) map.set(game, []);
      map.get(game).push(item);
    });
    return Array.from(map, ([game, list]) => ({ game, list }));
  }, [items]);

  const toggleGame = (game) => {
    setExpandedGames(prev =>
      prev.includes(game) ? prev.filter(name => name !== game) : [...prev, game]
    );
  };

  const handleCancelClaim = async () => {
    if (!cancelTarget) return;
    setCancelling(true);
    setError('');
    try {
      await templateApi.cancelClaim(cancelTarget.id);
      setCancelTarget(null);
      await fetchTemplates();
    } catch (err) {
      setError(err.message);
    } finally {
      setCancelling(false);
    }
  };

  return (
    <>
      <div className={styles.page}>
        <PageHeader
          showBack={true}
          onBack={() => navigate('/dashboard')}
          actions={[
            { icon: 'bi-clipboard2-data', label: '管理待办', variant: 'secondary', onClick: () => navigate('/taskmanage') },
            { icon: 'bi-box-arrow-right', label: '登出', variant: 'dark', onClick: () => navigate('/login') },
          ]}
        />

        <div className={styles.body}>
          <div className={styles.toolbar}>
            <div>
              <div className={styles.title}>活动广场</div>
              <div className={styles.subtitle}>管理员公开的活动，按游戏分组</div>
            </div>

            <Form.Check
              type="switch"
              id="show-expired-switch"
              className={styles.switch}
              label="显示已结束（近 30 天）"
              checked={showExpired}
              onChange={(e) => setShowExpired(e.target.checked)}
            />
          </div>

          {error && <Alert variant="danger">{error}</Alert>}

          {loading ? (
            <div className="text-center py-5">
              <Spinner animation="border" />
            </div>
          ) : groups.length === 0 ? (
            <div className={styles.empty}>暂时没有公开的活动</div>
          ) : (
            groups.map(({ game, list }) => {
              const open = expandedGames.includes(game);
              return (
                <div key={game} className={styles.group}>
                  <button type="button" className={styles.groupHeader} onClick={() => toggleGame(game)}>
                    <i className="bi bi-controller" />
                    <span className={styles.gameName}>{game}</span>
                    <span className={styles.gameCount}>{list.length} 个活动</span>
                    <i className={`bi bi-chevron-down ${styles.chevron} ${open ? styles.chevronOpen : ''}`} />
                  </button>

                  {open && (
                    <div className={styles.list}>
                      {list.map(template => {
                        const expired = Boolean(template.end_date) && template.end_date < today;
                        return (
                          <div
                            key={template.id}
                            className={`${styles.item} ${expired ? styles.itemExpired : ''}`}
                          >
                            <div className={styles.itemMain}>
                              <div className={styles.itemTitle}>
                                {template.title}
                                {template.claimed && (
                                  <Badge bg="success" className={styles.badge}>已接取</Badge>
                                )}
                                {expired && (
                                  <Badge bg="secondary" className={styles.badge}>已结束</Badge>
                                )}
                              </div>
                              <div className={styles.meta}>{formatRange(template)}</div>
                              {template.description && (
                                <div className={styles.desc}>{template.description}</div>
                              )}
                            </div>

                            <div className={styles.actions}>
                              {template.claimed ? (
                                <Button
                                  size="sm"
                                  variant="outline-danger"
                                  onClick={() => setCancelTarget(template)}
                                >
                                  取消接取
                                </Button>
                              ) : (
                                <Button
                                  size="sm"
                                  variant="success"
                                  disabled
                                  title="功能开发中"
                                >
                                  添加为待办
                                </Button>
                              )}
                              <Button
                                size="sm"
                                variant="outline-secondary"
                                disabled
                                title="功能开发中"
                              >
                                活动详情
                              </Button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>

      <ConfirmModal
        show={!!cancelTarget}
        title="取消接取"
        message={cancelTarget ? `确认取消接取「${cancelTarget.title}」？由它派生的待办会被删除，且无法恢复。` : ''}
        confirmText="我确定"
        cancelText="再想想"
        variant="danger"
        loading={cancelling}
        onConfirm={handleCancelClaim}
        onCancel={() => setCancelTarget(null)}
      />
    </>
  );
}
