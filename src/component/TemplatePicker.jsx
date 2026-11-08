import { useEffect, useState } from 'react';
import Alert from 'react-bootstrap/Alert';
import Badge from 'react-bootstrap/Badge';
import Button from 'react-bootstrap/Button';
import Spinner from 'react-bootstrap/Spinner';

import { templateApi } from '../api/client';

/*
 * 「添加待办 → 从模板选择」的列表：
 * 只展示已发布的活动，接取后由调用方刷新任务列表。
 */
function formatRange(template) {
  const start = template.start_date ? template.start_date.replaceAll('-', '/') : '';
  const end = template.end_date ? template.end_date.replaceAll('-', '/') : '';
  if (start && end) return `${start} ~ ${end}`;
  if (end) return `截止 ${end}`;
  if (start) return `${start} 开始`;
  return '未设置时间';
}

export default function TemplatePicker({ onClaim }) {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [claimingId, setClaimingId] = useState(null);

  const fetchTemplates = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await templateApi.getAll({ limit: 50 });
      setItems(data.items || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTemplates();
  }, []);

  const handleClaim = async (template) => {
    setError('');
    setClaimingId(template.id);
    try {
      await onClaim(template.id);
    } catch (err) {
      setError(err.message);
    } finally {
      setClaimingId(null);
    }
  };

  if (loading) {
    return (
      <div className="text-center py-4">
        <Spinner animation="border" />
      </div>
    );
  }

  return (
    <>
      {error && <Alert variant="danger">{error}</Alert>}

      {items.length === 0 ? (
        <p className="text-muted mb-0">暂时没有已发布的活动。</p>
      ) : (
        <div className="d-flex flex-column gap-2">
          {items.map(template => (
            <div
              key={template.id}
              className="border rounded p-3 d-flex justify-content-between align-items-start gap-3"
            >
              <div>
                <div className="d-flex align-items-center gap-2 mb-1">
                  <Badge bg="primary">{template.game_name}</Badge>
                  <span className="fw-semibold">{template.title}</span>
                </div>
                <div className="text-muted small">{formatRange(template)}</div>
                {template.description && (
                  <div className="text-muted small mt-1">{template.description}</div>
                )}
              </div>

              <Button
                size="sm"
                variant={template.claimed ? 'outline-secondary' : 'success'}
                disabled={template.claimed || claimingId === template.id}
                onClick={() => handleClaim(template)}
              >
                {template.claimed ? '已接取' : (claimingId === template.id ? '接取中...' : '接取')}
              </Button>
            </div>
          ))}
        </div>
      )}
    </>
  );
}
