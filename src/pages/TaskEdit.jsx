import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { taskApi, auth } from '../api/client';
import PageHeader from '../component/PageHeader';

function TaskEdit() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [task, setTask] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchTask = async () => {
      try {
        const data = await taskApi.getOne(id);
        setTask(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchTask();
  }, [id]);

  const handleBack = () => navigate('/taskmanage');

  return (
    <div>
      <PageHeader showBack={true} onBack={handleBack} />
      {loading ? <p>加载中...</p> : error ? <p>{error}</p> : (
        <pre>{JSON.stringify(task, null, 2)}</pre>
      )}
    </div>
  );
}

export default TaskEdit;