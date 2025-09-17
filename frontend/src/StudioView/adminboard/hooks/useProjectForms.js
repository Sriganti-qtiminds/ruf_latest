import { useState } from 'react';

export const useProjectForms = () => {
  const [projectForm, setProjectForm] = useState({
    project_name: '',
    site_mgr_id: '',
    budget_cat: '',
    cust_id: '',
    cust_flat: '',
    cust_community: '',
    cust_address: '',
    total_cost: '',
    total_paid: '',
    total_balance: '',
    signup_date: '',
    signup_percentage: '',
    weeks_planned: '',
    weeks_buffer: '',
    weeks_total: '',
    tnt_start_date: '',
    est_end_date: '',
    act_end_date: '',
    current_status: ''
  });

  const [mainTaskForm, setMainTaskForm] = useState({
    project_id: '',
    main_task_name: '',
    vendor_id: '',
    task_cost: '',
    total_task_cost: ''
  });

  const [subTaskForm, setSubTaskForm] = useState({
    main_task: '',
    vendor_id: '',
    percent_complete: '',
    approver_id: '',
    approval_status: '',
    approval_id: '',
    sub_task_name: '',
    sub_task_description: '',
    week_no: ''
  });

  const [subTaskFiles, setSubTaskFiles] = useState({
    beforeImages: [],
    afterImages: [],
    beforeVideos: [],
    afterVideos: []
  });

  const [projectDocuments, setProjectDocuments] = useState([]);

  const handleFormChange = (formType, field, value) => {
    switch (formType) {
      case 'project':
        setProjectForm(prev => ({ ...prev, [field]: value }));
        break;
      case 'mainTask':
        setMainTaskForm(prev => ({ ...prev, [field]: value }));
        break;
      case 'subTask':
        setSubTaskForm(prev => ({ ...prev, [field]: value }));
        break;
    }
  };

  const resetForms = (selectedMainTask) => {
    setProjectForm({
      project_name: '',
      site_mgr_id: '',
      budget_cat: '',
      cust_id: '',
      cust_flat: '',
      cust_community: '',
      cust_address: '',
      total_cost: '',
      total_paid: '',
      total_balance: '',
      signup_date: '',
      signup_percentage: '',
      weeks_planned: '',
      weeks_buffer: '',
      weeks_total: '',
      tnt_start_date: '',
      est_end_date: '',
      act_end_date: '',
      current_status: '',
      documents_path: ''
    });
    setProjectDocuments([]);
    
    setMainTaskForm({
      project_id: '',
      main_task_name: '',
      vendor_id: '',
      task_cost: '',
      total_task_cost: ''
    });
    
    setSubTaskForm({
      main_task: selectedMainTask ? selectedMainTask.id : '',
      vendor_id: selectedMainTask ? selectedMainTask.vendor_id : '',
      percent_complete: '',
      approver_id: '',
      approval_id: '',
      approval_status: '',
      sub_task_name: '',
      sub_task_description: '',
      week_no: ''
    });

    // Reset file uploads
    setSubTaskFiles({
      beforeImages: [],
      afterImages: [],
      beforeVideos: [],
      afterVideos: []
    });
  };

  return {
    projectForm,
    mainTaskForm,
    subTaskForm,
    subTaskFiles,
    projectDocuments,
    setProjectForm,
    setMainTaskForm,
    setSubTaskForm,
    setSubTaskFiles,
    setProjectDocuments,
    handleFormChange,
    resetForms
  };
};
