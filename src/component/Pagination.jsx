import Button from 'react-bootstrap/Button';
import styles from './Pagination.module.css';

export default function Pagination({ currentPage, totalPages, onPageChange }) {
  if (totalPages <= 1) return null;

  // 生成要显示的页码：当前页附近 2 页
  const pages = [];
  const start = Math.max(1, currentPage - 2);
  const end = Math.min(totalPages, currentPage + 2);
  for (let i = start; i <= end; i++) {
    pages.push(i);
  }

  return (
    <div className={styles.pagination}>
      <Button
        variant="outline-secondary"
        size="sm"
        disabled={currentPage === 1}
        onClick={() => onPageChange(currentPage - 1)}
      >
        上一页
      </Button>

      {start > 1 && (
        <>
          <Button variant="outline-secondary" size="sm" onClick={() => onPageChange(1)}>1</Button>
          {start > 2 && <span className={styles.ellipsis}>...</span>}
        </>
      )}

      {pages.map(p => (
        <Button
          key={p}
          variant={p === currentPage ? 'primary' : 'outline-secondary'}
          size="sm"
          onClick={() => onPageChange(p)}
        >
          {p}
        </Button>
      ))}

      {end < totalPages && (
        <>
          {end < totalPages - 1 && <span className={styles.ellipsis}>...</span>}
          <Button variant="outline-secondary" size="sm" onClick={() => onPageChange(totalPages)}>{totalPages}</Button>
        </>
      )}

      <Button
        variant="outline-secondary"
        size="sm"
        disabled={currentPage === totalPages}
        onClick={() => onPageChange(currentPage + 1)}
      >
        下一页
      </Button>
    </div>
  );
}