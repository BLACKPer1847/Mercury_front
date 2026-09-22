// Dashboard page


import  { useState, useEffect } from 'react';
import { useNavigate } from "react-router-dom";

import styles from "./Dashboard.module.css";
import Button from 'react-bootstrap/Button';
import Card from 'react-bootstrap/Card';
import Alert from 'react-bootstrap/Alert';
import { taskApi,auth } from '../api/client';



function DashBoard() {
  const navigate = useNavigate();
  
  if (!auth.isLoggedIn()) {
    navigate('/login')
    return
  }

  const handleAddition =()=>{

  }

  const handleExit =()=>{
    auth.logout()
    navigate('/login')
    return
  }

  return (

    <>
    <div className={styles['dashboard-page']}>
      {/* 头部工具栏 */}
      <div className={styles['header-container']}>
        <Button variant="success" onClick={handleAddition}>
          <i class="bi bi-file-earmark-plus"></i> 添加待办
        </Button>
        <Button variant="secondary">
          <i class="bi bi-gear"></i> 管理事件
        </Button>
        <Button variant="secondary">
          <i class="bi bi-clipboard2-data"></i> 管理待办
        </Button>
        <Button variant="dark" onClick={handleExit}>
          <i class="bi bi-box-arrow-right"></i> 登出
        </Button>
        
      </div>

      {/* 页面主体 */}
      <div className={styles['main-container']}>
        {/* 左侧日历区域 */}
        <div className={styles['calender-container']}>
          <Alert variant='secondary'>
          日历功能在初版不会涉及，此处是留待开发区域
          </Alert>
        </div>

        {/* 右侧任务列表区域 */}
        <div className={styles['quest-list-container']}>

        </div>
      </div>

      {/* 页尾 */}
      <div className={styles['tail-container']}>

      </div>
    </div> 

    </>

  )
}

export default DashBoard;