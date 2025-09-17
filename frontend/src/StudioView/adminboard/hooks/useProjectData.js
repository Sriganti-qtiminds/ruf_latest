import { useState, useEffect } from 'react';

export const useProjectData = () => {
  const [projects, setProjects] = useState([]);
  const [mainTasks, setMainTasks] = useState([]);
  const [subTasks, setSubTasks] = useState([]);
  const [paymentPlans, setPaymentPlans] = useState([]);

  const fetchProjects = () => {
    fetch(`${import.meta.env.VITE_API_URL}/project/getAllstudioprojects`)
      .then((res) => res.json())
      .then((data) => {
        const result = data.result || data.data || [];
        setProjects(Array.isArray(result) ? result : []);
      })
      .catch(() => setProjects([]));
  };

  const fetchMainTasks = (projectId) => {
    fetch(`${import.meta.env.VITE_API_URL}/maintask/getAllStudioMainTasks`)
      .then((res) => res.json())
      .then((data) => {
        const result = data.result || data.data || [];
        const filtered = Array.isArray(result)
          ? result.filter((t) => t.project_id?.toString() === projectId?.toString())
          : [];
        setMainTasks(filtered);
      })
      .catch(() => setMainTasks([]));
  };

  const fetchSubTasks = (mainTaskId) => {
    console.log('Fetching sub tasks for main task ID:', mainTaskId);
    
    fetch(`${import.meta.env.VITE_API_URL}/subtask/getAllStudioSubTasks`)
      .then((res) => res.json())
      .then((data) => {
        console.log('Raw API response for sub tasks:', data);
        const result = data.result || data.data || [];
        console.log('All sub tasks from API:', result);
        
        const filtered = Array.isArray(result)
          ? result.filter((t) => {
              console.log(`Checking sub task ${t.id}: main_task=${t.main_task}, main_task_id=${t.main_task_id}, looking for=${mainTaskId}`);
              // Try multiple possible field names
              return t.main_task?.toString() === mainTaskId?.toString() || 
                     t.main_task_id?.toString() === mainTaskId?.toString() ||
                     t.maintask_id?.toString() === mainTaskId?.toString();
            })
          : [];
        
        console.log('Filtered sub tasks for main task', mainTaskId, ':', filtered);
        setSubTasks(filtered);
      })
      .catch((error) => {
        console.error('Error fetching sub tasks:', error);
        setSubTasks([]);
      });
  };

  const fetchPaymentPlans = () => {
    fetch(`${import.meta.env.VITE_API_URL}/userpayment/getAllUserPaymentPlans`)
      .then((res) => res.json())
      .then((data) => {
        const result = data.result || data.data || [];
        setPaymentPlans(Array.isArray(result) ? result : []);
      })
      .catch(() => setPaymentPlans([]));
  };

  return {
    projects,
    mainTasks,
    subTasks,
    paymentPlans,
    setProjects,
    setMainTasks,
    setSubTasks,
    fetchProjects,
    fetchMainTasks,
    fetchSubTasks,
    fetchPaymentPlans
  };
};
