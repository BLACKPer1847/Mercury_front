// 官方号巡检卡片：把这次要盯的 12 个官方号列出来，点开就是 B 站主页。
// 只负责「提醒人去巡检」，不抓数据：抓取有风险，公告由管理员手动导入。

import { useState } from 'react';

import Badge from 'react-bootstrap/Badge';
import Button from 'react-bootstrap/Button';
import Card from 'react-bootstrap/Card';
import Collapse from 'react-bootstrap/Collapse';

import styles from './InspectionCard.module.css';

const ACCOUNTS = [
  { name: '少女前线制作组', uid: '32472953' },
  { name: '原神', uid: '401742377' },
  { name: '碧蓝航线', uid: '233114659' },
  { name: '崩坏：星穹铁道', uid: '1340190821' },
  { name: '绝区零', uid: '1636034895' },
  { name: '蓝色星原：旅谣', uid: '3546569016085336' },
  { name: '无限大', uid: '3494379073309365' },
  { name: '明日方舟', uid: '161775300' },
  { name: '异环', uid: '3546636978489848' },
  { name: '明日方舟：终末地', uid: '1265652806' },
  { name: '少女前线2：追放制作组', uid: '697654195' },
  { name: '鸣潮', uid: '1955897084' },
];

const STORAGE_KEY = 'mercury_inspection_date';

function todayKey() {
  const now = new Date();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${now.getFullYear()}-${month}-${day}`;
}

function readLastDate() {
  try {
    return localStorage.getItem(STORAGE_KEY) || '';
  } catch {
    return '';
  }
}

function InspectionCard() {
  const [open, setOpen] = useState(false);
  const [lastDate, setLastDate] = useState(readLastDate);
  const [visited, setVisited] = useState([]);

  const today = todayKey();
  const doneToday = lastDate === today;

  const markDone = () => {
    try {
      localStorage.setItem(STORAGE_KEY, today);
    } catch {
      // localStorage 不可用时只是记不住，不影响本次巡检
    }
    setLastDate(today);
  };

  const markVisited = (uid) => {
    setVisited(prev => (prev.includes(uid) ? prev : [...prev, uid]));
  };

  return (
    <Card className={styles.card}>
      <Card.Header className={styles.header}>
        <button
          type="button"
          className={styles.toggle}
          onClick={() => setOpen(prev => !prev)}
          aria-expanded={open}
          aria-controls="inspection-body"
        >
          <i className={`bi ${open ? 'bi-chevron-down' : 'bi-chevron-right'} me-2`} />
          官方号巡检
          <Badge bg="light" text="dark" className="ms-2">{ACCOUNTS.length} 个</Badge>
        </button>

        <div className={styles.headerRight}>
          {lastDate && (
            <span className={styles.lastDate}>
              上次巡检：{lastDate}
            </span>
          )}
          {doneToday ? (
            <Badge bg="success">今天已巡检</Badge>
          ) : (
            <Button size="sm" variant="outline-success" onClick={markDone}>
              标记今日已巡检
            </Button>
          )}
        </div>
      </Card.Header>

      <Collapse in={open}>
        <div id="inspection-body">
          <Card.Body>
            <p className={styles.hint}>
              点名称打开对应 B 站主页，看到新活动公告就用「导入公告」把它录进来。
              巡检完成后点右上角标记一下，方便隔天知道哪些看过了。
            </p>
            <div className={styles.grid}>
              {ACCOUNTS.map(account => (
                <a
                  key={account.uid}
                  className={styles.account}
                  href={`https://space.bilibili.com/${account.uid}`}
                  target="_blank"
                  rel="noreferrer"
                  onClick={() => markVisited(account.uid)}
                >
                  <span className={styles.accountName}>
                    {visited.includes(account.uid) && <i className="bi bi-check2-circle me-1" />}
                    {account.name}
                  </span>
                  <span className={styles.uid}>{account.uid}</span>
                </a>
              ))}
            </div>
          </Card.Body>
        </div>
      </Collapse>
    </Card>
  );
}

export default InspectionCard;
