import React, { useEffect, useState } from 'react';
import '../glassmorphic.css';
import Modal from './Modal';

function Projects({ setSearchData, setSearchFields }) {
  const [projects, setProjects] = useState([]);
  const [mainTasks, setMainTasks] = useState([]);
  const [subTasks, setSubTasks] = useState([]);
  const [currentView, setCurrentView] = useState('projects'); // 'projects', 'mainTasks', 'subTasks'
  const [selectedProject, setSelectedProject] = useState(null);
  const [selectedMainTask, setSelectedMainTask] = useState(null);
  const [currentProjectIndex, setCurrentProjectIndex] = useState(0);
  const [hoveredProject, setHoveredProject] = useState(null);
  const [lastHoveredProject, setLastHoveredProject] = useState(null);
  const [deleteSelection, setDeleteSelection] = useState(null);
  const [deleteList, setDeleteList] = useState([]);
  const [isDropdownDeleteMode, setIsDropdownDeleteMode] = useState(false);
  const [showProjectDeleteForm, setShowProjectDeleteForm] = useState(false);
  const [showMainTaskDeleteForm, setShowMainTaskDeleteForm] = useState(false);
  const [showSubTaskDeleteForm, setShowSubTaskDeleteForm] = useState(false);
  const [deleteProjectId, setDeleteProjectId] = useState(null); // Selected project ID for deletion
  const [deleteTaskId, setDeleteTaskId] = useState(null); // Selected task ID for deletion


  // Modal states
  const [showAddProject, setShowAddProject] = useState(false);
  const [showAddMainTask, setShowAddMainTask] = useState(false);
  const [showAddSubTask, setShowAddSubTask] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [modalType, setModalType] = useState(''); // 'project', 'mainTask', 'subTask'

  // Search state
  const [searchQuery, setSearchQuery] = useState('');

  // Form states
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
    current_status: '',
    documents_path: ''
  });

  const [mainTaskForm, setMainTaskForm] = useState({
    week_no: '',
    project_id: '',
    main_task_name: '',
    vendor_id: '',
    start_date: '',
    end_date: '',
    task_cost: '',
    sgst_pct: '',
    cgst_pct: '',
    total_task_cost: '',
    signup_pct: ''
  });

  const [subTaskForm, setSubTaskForm] = useState({
    main_task: '',
    vendor_id: '',
    percent_complete: '',
    approver_id: '',
    media_path: '',
    approval_status: '',
    sub_task_name: '',
    sub_task_description: '',
    start_date: '',
    end_date: ''
  });

  // Vendor type mapping
  const vendorTypes = {
    1: 'Company',
    2: 'Electrician',
    3: 'Plumber',
    4: 'False Ceiling',
    5: 'Carpentry',
    6: 'Lighting',
    7: 'Tiles',
    8: 'Glassware',
    9: 'Artwork',
    10: 'Gardening',
    11: 'Polishing',
    12: 'Cleaning',
    13: 'Sanitary',
    14: 'Masonry',
    15: 'Iron Mesh',
    16: 'Painter',
    17: 'Kitchen Work',
    18: 'Designer'
  };

  // Approval status mapping
  const approvalStatuses = {
    0: 'Pending',
    1: 'Approved',
    2: 'Rejected'
  };

  useEffect(() => {
    fetchProjects();
  }, []);

  useEffect(() => {
    if (setSearchData && setSearchFields) {
      setSearchData(projects);
      setSearchFields(['id', 'project_name', 'cust_flat', 'cust_community']);
    }
  }, [projects, setSearchData, setSearchFields]);

  // Reset project carousel index when search changes
  useEffect(() => {
    setCurrentProjectIndex(0);
  }, [searchQuery]);

  const buildKeyValuePayload = (data, rootKey) => {
    const entries = Object.entries(data)
      .filter(([_, v]) => v !== undefined)
      .map(([k, v]) => ({ key: k, value: v }));
    return { [rootKey]: entries };
  };

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
    fetch(`${import.meta.env.VITE_API_URL}/subtask/getAllStudioSubTasks`)
      .then((res) => res.json())
      .then((data) => {
        const result = data.result || data.data || [];
        const filtered = Array.isArray(result)
          ? result.filter((t) => t.main_task?.toString() === mainTaskId?.toString())
          : [];
        setSubTasks(filtered);
      })
      .catch(() => setSubTasks([]));
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return '-';
    const d = new Date(dateStr);
    return d.toLocaleDateString() + ' ' + d.toLocaleTimeString();
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 1: return 'bg-green-100 text-green-800';
      case 0: return 'bg-yellow-100 text-yellow-800';
      case 2: return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  // Navigation handlers
  const handleProjectSelect = (project) => {
    setSelectedProject(project);
    setCurrentView('mainTasks');
    fetchMainTasks(project.id);
  };

  const handleMainTaskSelect = (mainTask) => {
    setSelectedMainTask(mainTask);
    setCurrentView('subTasks');
    fetchSubTasks(mainTask.id);
  };

  const handleBackToProjects = () => {
    setCurrentView('projects');
    setSelectedProject(null);
    setSelectedMainTask(null);
    setMainTasks([]);
    setSubTasks([]);
  };

  const handleBackToMainTasks = () => {
    setCurrentView('mainTasks');
    setSelectedMainTask(null);
    setSelectedItem(null);
    setSubTasks([]);
  };

  // Carousel navigation functions
  const handleNextProject = () => {
    setCurrentProjectIndex((prev) => {
      const nextIndex = prev + 4;
      return nextIndex >= projects.length ? 0 : nextIndex;
    });
  };

  const handlePreviousProject = () => {
    setCurrentProjectIndex((prev) => {
      const prevIndex = prev - 4;
      return prevIndex < 0 ? Math.max(0, projects.length - 4) : prevIndex;
    });
  };

  // Form handlers
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

  const handleAdd = (type) => {
    setModalType(type);
    setShowAddProject(type === 'project');
    setShowAddMainTask(type === 'mainTask');
    setShowAddSubTask(type === 'subTask');
    
    // Pre-fill forms with context data
    if (type === 'mainTask' && selectedProject) {
      setMainTaskForm(prev => ({ ...prev, project_id: selectedProject.id }));
    }
    if (type === 'subTask' && selectedMainTask) {
      setSubTaskForm(prev => ({ ...prev, main_task: selectedMainTask.id }));
    }
  };

  const handleEdit = (item, type) => {
    setSelectedItem(item);
    setModalType(type);
    setShowEditModal(true);
    
    // Pre-fill form with item data if an item is selected
    if (item) {
      switch (type) {
        case 'project':
          setProjectForm(item);
          break;
        case 'mainTask':
          setMainTaskForm(item);
          break;
        case 'subTask':
          setSubTaskForm(item);
          break;
      }
    } else {
      // If no item is selected, reset the form
      switch (type) {
        case 'project':
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
          break;
        case 'mainTask':
          // For main tasks, pre-fill project_id if a project is selected
          setMainTaskForm({
            week_no: '',
            project_id: selectedProject ? selectedProject.id : '',
            main_task_name: '',
            vendor_id: '',
            start_date: '',
            end_date: '',
            task_cost: '',
            sgst_pct: '',
            cgst_pct: '',
            total_task_cost: '',
            signup_pct: ''
          });
          break;
        case 'subTask':
          // For sub tasks, pre-fill main_task if a main task is selected
          setSubTaskForm({
            main_task: selectedMainTask ? selectedMainTask.id : '',
            vendor_id: '',
            percent_complete: '',
            approver_id: '',
            media_path: '',
            approval_status: '',
            sub_task_name: '',
            sub_task_description: '',
            start_date: '',
            end_date: ''
          });
          break;
      }
    }
  };

  const handleDelete = (item, type) => {
    setSelectedItem(null);
    setModalType(type);
    setDeleteSelection(null);

    if (type === 'mainTask') {
      setDeleteList(mainTasks.map(task => ({ id: task.id, name: task.main_task_name || `Main Task #${task.id}` })));
      setIsDropdownDeleteMode(true);
      setShowDeleteModal(true);
    } else if (type === 'subTask') {
      setDeleteList(subTasks.map(task => ({ id: task.id, name: task.sub_task_name || `Sub Task #${task.id}` })));
      setIsDropdownDeleteMode(true);
      setShowDeleteModal(true);
    } else {
      setSelectedItem(item);
      setIsDropdownDeleteMode(false);
      setShowDeleteModal(true);
    }
  };
  const normalizeDateTime = (value) => {
    if (!value) return value;
    // If already contains a space, assume server-ready
    if (typeof value === 'string' && value.includes('T')) {
      return value.replace('T', ' ') + (value.length === 16 ? ':00' : '');
    }
    return value;
  };

  const handleFormSubmit = async (e, type) => {
    e.preventDefault();
    
    try {
      let url, method, body;
      
      switch (type) {
        case 'project':
          method = showEditModal ? 'PUT' : 'POST';
          url = showEditModal
            ? `${import.meta.env.VITE_API_URL}/project/updatestudioproject`
            : `${import.meta.env.VITE_API_URL}/project/addstudioproject`;
          // Ensure datetime fields are normalized
          const projectPayload = {
            ...projectForm,
            signup_date: normalizeDateTime(projectForm.signup_date),
            tnt_start_date: normalizeDateTime(projectForm.tnt_start_date),
            est_end_date: normalizeDateTime(projectForm.est_end_date),
            act_end_date: normalizeDateTime(projectForm.act_end_date),
          };
          if (showEditModal && selectedItem?.id != null) {
            projectPayload.id = selectedItem.id;
          }
          body = JSON.stringify(buildKeyValuePayload(projectPayload, 'projectData'));
          break;
        case 'mainTask':
          method = showEditModal ? 'PUT' : 'POST';
          url = showEditModal
            ? `${import.meta.env.VITE_API_URL}/maintask/updateStudioMainTask`
            : `${import.meta.env.VITE_API_URL}/maintask/addNewStudioMainTask`;
          const mainTaskPayload = { ...mainTaskForm };
          if (showEditModal && selectedItem?.id != null) {
            mainTaskPayload.id = selectedItem.id;
          }
          body = JSON.stringify(buildKeyValuePayload(mainTaskPayload, 'mainTaskData'));
          break;
        case 'subTask':
          method = showEditModal ? 'PUT' : 'POST';
          url = showEditModal
            ? `${import.meta.env.VITE_API_URL}/subtask/updateStudioSubTask`
            : `${import.meta.env.VITE_API_URL}/subtask/addNewStudioSubTask`;
          const subTaskPayload = {
            ...subTaskForm,
            start_date: normalizeDateTime(subTaskForm.start_date),
            end_date: normalizeDateTime(subTaskForm.end_date),
          };
          if (showEditModal && selectedItem?.id != null) {
            subTaskPayload.id = selectedItem.id;
          }
          body = JSON.stringify(buildKeyValuePayload(subTaskPayload, 'subTaskData'));
          break;
      }

      const response = await fetch(url, {
        method: method || 'POST',
        headers: { 'Content-Type': 'application/json' },
        body
      });

      if (response.ok) {
        // Refresh data based on current view
        if (currentView === 'projects') {
          fetchProjects();
        } else if (currentView === 'mainTasks') {
          fetchMainTasks(selectedProject.id);
        } else if (currentView === 'subTasks') {
          fetchSubTasks(selectedMainTask.id);
        }
        
        // Close modals and reset forms
        setShowAddProject(false);
        setShowAddMainTask(false);
        setShowAddSubTask(false);
        setShowEditModal(false);
        resetForms();
      }
    } catch (error) {
      console.error('Error saving:', error);
    }
  };

  const resetForms = () => {
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
    
    setMainTaskForm({
      week_no: '',
      project_id: '',
      main_task_name: '',
      vendor_id: '',
      start_date: '',
      end_date: '',
      task_cost: '',
      sgst_pct: '',
      cgst_pct: '',
      total_task_cost: '',
      signup_pct: ''
    });
    
    setSubTaskForm({
      main_task: '',
      vendor_id: '',
      percent_complete: '',
      approver_id: '',
      media_path: '',
      approval_status: '',
      sub_task_name: '',
      sub_task_description: '',
      start_date: '',
      end_date: ''
    });
    
    // Clear selected item for dropdown
    setSelectedItem(null);
  };

  // Render Projects View
  const renderProjectsView = () => {
    // Filter projects by search
    const query = searchQuery.trim().toLowerCase();
    const filteredProjects = query
      ? projects.filter((p) => {
          const values = [
            p.id,
            p.project_name,
            p.cust_flat,
            p.cust_community,
            p.cust_address,
            p.cust_id,
            p.site_mgr_id,
            p.documents_path,
          ]
            .filter(Boolean)
            .map((v) => String(v).toLowerCase());
          return values.some((v) => v.includes(query));
        })
      : projects;
    // Get 4 projects starting from currentProjectIndex
    const visibleProjects = filteredProjects.slice(currentProjectIndex, currentProjectIndex + 4);
    const totalPages = Math.ceil(filteredProjects.length / 4) || 1;
    const currentPage = Math.min(Math.floor(currentProjectIndex / 4) + 1, totalPages);
    const canPaginate = filteredProjects.length > 4;
    const gotoPrev = () => {
      setCurrentProjectIndex((prev) => {
        const prevIndex = prev - 4;
        return prevIndex < 0 ? Math.max(0, filteredProjects.length - 4) : prevIndex;
      });
    };
    const gotoNext = () => {
      setCurrentProjectIndex((prev) => {
        const nextIndex = prev + 4;
        return nextIndex >= filteredProjects.length ? 0 : nextIndex;
      });
    };
    
    return (
      <div className="flex-1 w-full h-full">
        <div className="flex justify-between items-center mb-8 px-8 pt-8 gap-4">
          <div className="flex items-center gap-4 flex-1">
            <h2 className="text-3xl font-bold">Projects</h2>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search projects..."
              className="flex-1 max-w-md border rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
            />
          </div>
          <button
            className="bg-[#E07A5F] text-white px-5 py-2 rounded-lg shadow hover:scale-105 transition-transform font-medium text-lg"
            onClick={() => handleAdd('project')}
          >
            + Add Project
          </button>
        </div>

        {/* Carousel Section */}
        <div className="px-8 mb-8">
          <div className="flex items-center justify-center gap-2 overflow-x-auto px-2 sm:px-8">
            <button
              onClick={gotoPrev}
              disabled={!canPaginate}
              className="p-3 rounded-full bg-gray-200 hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <i className="ri-arrow-left-line text-xl"></i>
            </button>
            
                         <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 w-full">
               {visibleProjects.map((project) => (
                 <div
                   key={project.id}
                   className="bg-white rounded-xl shadow-lg p-4 cursor-pointer transition-all duration-300 border border-gray-100 flex flex-col gap-4 hover:shadow-2xl hover:border-blue-500 hover:bg-blue-50 min-h-[280px] border border-gray-300"
                   onClick={() => handleProjectSelect(project)}
                   onMouseEnter={() => {
                     console.log('Mouse enter project:', project.id);
                     setHoveredProject(project);
                     setLastHoveredProject(project);
                   }}
                   onMouseLeave={() => {
                     console.log('Mouse leave project:', project.id);
                     setHoveredProject(null);
                   }}
                 >
                   {/* Basic Info (Always Visible) */}
                   <div className="text-center flex-1 flex flex-col justify-center">
                     <div className="font-bold text-xl text-gray-800 mb-3">{project.user_name}</div>
                     <div className="font-semibold text-lg text-gray-700 mb-2">{project.project_name || 'N/A'}</div>
                     <div className="text-gray-600 text-sm mb-4">{project.cust_flat || 'N/A'} - {project.cust_community || 'N/A'}</div>
                     <div className="text-xl font-bold text-blue-600 mb-1">
                       {project.signup_percentage != null ? project.signup_percentage + '%' : '0%'}
                     </div>
                     <div className="text-sm text-gray-500">Signup Percentage</div>
                   </div>


                   <div className="lg:hidden flex flex-col gap-1 mb-2 text-xs text-left">
                     <div><span className="font-semibold text-gray-700">Customer Name:</span> <span className="text-gray-600">{project.user_name}</span></div>
                     <div><span className="font-semibold text-gray-700">Total Weeks:</span> <span className="text-gray-600">{project.weeks_planned}</span></div>
                   </div>
                                      {/* Action Buttons */}
                                      <div className="flex gap-3 mt-4">
                     <button
                       className="flex-1 py-3 px-4 rounded-lg bg-blue-500 text-white hover:bg-blue-600 transition-colors text-base font-medium"
                       onClick={(e) => { e.stopPropagation(); handleProjectSelect(project); }}
                     >
                       <i className="ri-folder-open-line mr-2"></i> Tasks
                     </button>
                   </div>
                 </div>
               ))}
              
                             {/* Fill empty slots if less than 4 projects */}
               {visibleProjects.length < 4 && Array.from({ length: 4 - visibleProjects.length }).map((_, index) => (
                 <div key={`empty-${index}`} className="bg-gray-100 rounded-xl p-8 flex items-center justify-center min-h-[280px]">
                   <div className="text-center text-gray-400">
                     <i className="ri-folder-line text-4xl mb-3"></i>
                     <p className="text-base">No Project</p>
                   </div>
                 </div>
               ))}
            </div>

            <button
              onClick={gotoNext}
              disabled={!canPaginate}
              className="p-3 rounded-full bg-gray-200 hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <i className="ri-arrow-right-line text-xl"></i>
            </button>
          </div>

          {/* Carousel Indicators */}
           {filteredProjects.length > 4 && (
            <div className="flex justify-center mt-6 gap-2">
              {Array.from({ length: totalPages }).map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentProjectIndex(index * 4)}
                  className={`w-3 h-3 rounded-full transition-colors ${
                    index === Math.floor(currentProjectIndex / 4) ? 'bg-blue-500' : 'bg-gray-300'
                  }`}
                />
              ))}
            </div>
          )}

                     {/* Page Info */}
           {filteredProjects.length > 4 && (
             <div className="text-center mt-4 text-gray-600">
               Page {currentPage} of {totalPages} ({filteredProjects.length} found)
             </div>
           )}
         </div>

         {/* Project Details Section - Shows when a project is hovered */}
         {console.log('Current hoveredProject:', hoveredProject)}
         {/* Show details for currently hovered project or last hovered project */}
         {(hoveredProject || lastHoveredProject) && (
           <div className="px-2 sm:px-8 mb-4 hidden lg:block">
             <div className="bg-white rounded-xl shadow-lg p-3 border border-gray-200">
               <div className="flex items-center justify-between mb-4">
                 <h3 className="text-lg font-bold text-gray-800">
                   Project #{(hoveredProject || lastHoveredProject).id} Details
                 </h3>
                 <div className="flex items-center gap-2">

                   <button
                     className="py-2 px-3 rounded-md bg-green-500 text-white hover:bg-green-600 transition-colors text-sm font-medium"
                     onClick={() => handleEdit((hoveredProject || lastHoveredProject), 'project')}
                   >
                     <i className="ri-edit-line mr-1"></i> Edit
                   </button>
                   <button
                     className="py-2 px-3 rounded-md bg-red-500 text-white hover:bg-red-600 transition-colors text-sm font-medium"
                     onClick={() => {
                       setShowProjectDeleteForm(true);
                       setDeleteProjectId(null);
                     }}
                   >
                     <i className="ri-delete-bin-line mr-1"></i> Delete
                   </button>
                   {showProjectDeleteForm && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
              <div className="bg-white border border-red-400 rounded-lg p-6 max-w-md w-full mx-auto shadow-xl">
                <h3 className="text-xl font-bold text-red-700 mb-4">Delete Project</h3>
                <label className="block mb-2 font-semibold text-gray-700">Select Project to Delete</label>
                <select
                  className="w-full border rounded p-2 mb-4"
                  value={deleteProjectId || ''}
                  onChange={(e) => setDeleteProjectId(e.target.value)}
                  autoFocus
                >
                  <option value="" disabled>Select a project</option>
                  {projects.map(project => (
                    <option key={project.id} value={project.id}>{project.project_name || `Project #${project.id}`}</option>
                  ))}
                </select>

                {deleteProjectId && (
                  <div className="mb-4 p-3 bg-red-50 text-red-700 rounded-md">
                    Warning: This action cannot be undone. All data associated with this project will be permanently deleted.
                  </div>
                )}

                <div className="flex justify-end gap-3 mt-6">
                  <button
                    className="py-2 px-6 rounded-lg bg-gray-300 hover:bg-gray-400 text-gray-800 font-medium"
                    onClick={() => {
                      setShowProjectDeleteForm(false);
                      setDeleteProjectId(null);
                    }}
                  >
                    Cancel
                  </button>
                  <button
                    className={`py-2 px-6 rounded-lg bg-red-600 hover:bg-red-700 text-white font-medium ${!deleteProjectId ? 'opacity-50 cursor-not-allowed' : ''}`}
                    disabled={!deleteProjectId}
                    onClick={async () => {
                      if (!deleteProjectId) return;
                      try {
                        const res = await fetch(`${import.meta.env.VITE_API_URL}/project/deletestudioproject?id=${deleteProjectId}`, {
                          method: 'DELETE',
                        });
                        if (res.ok) {
                          setProjects(prev => prev.filter(p => p.id.toString() !== deleteProjectId));
                          setShowProjectDeleteForm(false);
                          setDeleteProjectId(null);
                          // If we're viewing this project's tasks, go back to projects view
                          if (selectedProject && selectedProject.id.toString() === deleteProjectId) {
                            handleBackToProjects();
                          }
                        } else {
                          alert('Failed to delete project.');
                        }
                      } catch (err) {
                        alert('Error deleting project.');
                      }
                    }}
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          )}
                 </div>
               </div>
               
               <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                 {/* Basic Information */}
                 <div className="space-y-2 text-sm">
                   <h4 className="font-semibold text-gray-700 border-b pb-1">Basic Information</h4>
                   <div className="space-y-1">
                     <div className="flex justify-between">
                       <span className="text-gray-600">Project Name:</span>
                       <span className="font-medium">{(hoveredProject || lastHoveredProject).project_name}</span>
                     </div>
                     <div className="flex justify-between">
                       <span className="text-gray-600">Customer Name:</span>
                       <span className="font-medium">{(hoveredProject || lastHoveredProject).user_name || '-'}</span>
                     </div>
                     <div className="flex justify-between">
                       <span className="text-gray-600">Customer Address:</span>
                       <span className="font-medium">{(hoveredProject || lastHoveredProject).cust_address}</span>
                     </div>
                   </div>
                 </div>

                 {/* Project Details */}
                 <div className="space-y-2 text-sm">
                   <h4 className="font-semibold text-gray-700 border-b pb-1">Project Details</h4>
                   <div className="space-y-1">
                     <div className="flex justify-between">
                       <span className="text-gray-600">Budget Category:</span>
                       <span className="font-medium">{(hoveredProject || lastHoveredProject).budget_cat || 'N/A'}</span>
                     </div>
                     <div className="flex justify-between">
                       <span className="text-gray-600">Planned Weeks:</span>
                       <span className="font-medium">{(hoveredProject || lastHoveredProject).weeks_planned || 'N/A'}</span>
                     </div>
                     <div className="flex justify-between">
                       <span className="text-gray-600">Buffer Weeks:</span>
                       <span className="font-medium">{(hoveredProject || lastHoveredProject).weeks_buffer || 'N/A'}</span>
                     </div>
                     <div className="flex justify-between">
                       <span className="text-gray-600">Total Weeks:</span>
                       <span className="font-medium">{(hoveredProject || lastHoveredProject).weeks_total || 'N/A'}</span>
                     </div>
                     <div className="flex justify-between">
                       <span className="text-gray-600">Total Cost:</span>
                       <span className="font-medium">
                         {(hoveredProject || lastHoveredProject).total_cost != null ? `₹${(hoveredProject || lastHoveredProject).total_cost.toLocaleString()}` : 'N/A'}
                       </span>
                     </div>
                     <div className="flex justify-between">
                       <span className="text-gray-600">Total Paid:</span>
                       <span className="font-medium">
                         {(hoveredProject || lastHoveredProject).total_paid != null ? `₹${(hoveredProject || lastHoveredProject).total_paid.toLocaleString()}` : 'N/A'}
                       </span>
                     </div>
                     <div className="flex justify-between">
                       <span className="text-gray-600">Balance:</span>
                       <span className="font-medium">
                         {(hoveredProject || lastHoveredProject).total_balance != null ? `₹${(hoveredProject || lastHoveredProject).total_balance.toLocaleString()}` : 'N/A'}
                       </span>
                     </div>
                     <div className="flex justify-between">
                       <span className="text-gray-600">Status:</span>
                       <span className="font-medium">{(hoveredProject || lastHoveredProject).current_status || 'N/A'}</span>
                     </div>
                   </div>
                 </div>

                 {/* Management & Documents */}
                 <div className="space-y-2 text-sm">
                   <h4 className="font-semibold text-gray-700 border-b pb-1">Management & Documents</h4>
                   <div className="space-y-1">
                     <div className="flex justify-between">
                       <span className="text-gray-600">Site Manager:</span>
                       <span className="font-medium">{(hoveredProject || lastHoveredProject).site_mgr_id || 'N/A'}</span>
                     </div>
                     <div className="flex justify-between">
                       <span className="text-gray-600">Signup Date:</span>
                       <span className="font-medium">{formatDate((hoveredProject || lastHoveredProject).signup_date)}</span>
                     </div>
                     <div className="flex justify-between">
                       <span className="text-gray-600">Start Date:</span>
                       <span className="font-medium">{formatDate((hoveredProject || lastHoveredProject).tnt_start_date)}</span>
                     </div>
                     <div className="flex justify-between">
                       <span className="text-gray-600">Est. End Date:</span>
                       <span className="font-medium">{formatDate((hoveredProject || lastHoveredProject).est_end_date)}</span>
                     </div>
                     <div className="flex justify-between">
                       <span className="text-gray-600">Documents:</span>
                       <span className="font-medium">
                         {(hoveredProject || lastHoveredProject).documents_path ? (
                           <a 
                             href={(hoveredProject || lastHoveredProject).documents_path} 
                             target="_blank" 
                             rel="noopener noreferrer" 
                             className="text-blue-600 underline hover:text-blue-800"
                           >
                             View Documents
                           </a>
                         ) : (
                           'N/A'
                         )}
                       </span>
                     </div>
                   </div>
                 </div>
               </div>

               {/* Address Section */}
                                <div className="mt-3 p-2 bg-gray-50 rounded-lg">
                   <h4 className="font-semibold text-gray-700 mb-1">Customer Address</h4>
                   <p className="text-xs text-gray-600">
                     {(hoveredProject || lastHoveredProject).cust_address || 'No address available'}
                   </p>
                 </div>
             </div>
           </div>
         )}
       </div>
     );
   };

  // Render Main Tasks View
  const renderMainTasksView = () => (
    <div className="flex-1 w-full h-full">
      <div className="flex items-center gap-4 mb-8 px-2 sm:px-8 pt-8">
      <button
        className="bg-gray-200 hover:bg-gray-300 text-gray-800 px-4 py-2 rounded-lg font-semibold shadow"
        onClick={handleBackToProjects}
      >
        <span className="inline text-xl ">←</span>
        <span className="hidden lg:inline "> Back to Projects</span>
      </button>
        <div className="flex items-center gap-4 flex-1">
          <h2 className="text-base sm:text-lg md:text-xl font-bold">Main Tasks for {selectedProject?.project_name || selectedProject?.id}</h2>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search main tasks..."
            className="flex-1 max-w-md border rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
          />
        </div>
        <div className="flex items-center gap-2 ml-auto">
          <button
            className="bg-[#E07A5F] text-white px-5 py-2 rounded-lg shadow hover:scale-105 transition-transform font-medium text-lg"
            onClick={() => handleAdd('mainTask')}
          >
            <span className="inline ">+</span>
            <span className="hidden lg:inline"> Add Main Tasker</span>
          </button>
          <button
            className="py-2 px-3 rounded-md bg-green-600 text-white hover:bg-green-800 transition-colors text-sm font-medium"
            onClick={() => handleEdit(null, 'mainTask')}
          >
            <i className="ri-edit-line mr-1 "></i>
            <span className="hidden lg:inline"> Edit</span>
          </button>
          <button
            className="py-2 px-3 rounded-md bg-red-500 text-white hover:bg-red-600 transition-colors text-sm font-medium"
            onClick={() => {
              setShowMainTaskDeleteForm(true);
              setDeleteTaskId(null);
            }}
          >
            <i className="ri-delete-bin-line mr-1 "></i>
            <span className="hidden lg:inline"> Delete</span>
          </button>
          {showMainTaskDeleteForm && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
              <div className="bg-white border border-red-400 rounded-lg p-6 max-w-md w-full mx-auto shadow-xl">
                <h3 className="text-xl font-bold text-red-700 mb-4">Delete Main Task</h3>
                <label className="block mb-2 font-semibold text-gray-700">Select Main Task to Delete</label>
                <select
                  className="w-full border rounded p-2 mb-4"
                  value={deleteTaskId || ''}
                  onChange={(e) => setDeleteTaskId(e.target.value)}
                  autoFocus
                >
                  <option value="" disabled>Select a main task</option>
                  {mainTasks.map(task => (
                    <option key={task.id} value={task.id}>{task.main_task_name || `Main Task #${task.id}`}</option>
                  ))}
                </select>

                {deleteTaskId && (
                  <div className="mb-4 p-3 bg-red-50 text-red-700 rounded-md">
                    Warning: This action cannot be undone. All data associated with this main task will be permanently deleted.
                  </div>
                )}

                <div className="flex justify-end gap-3 mt-6">
                  <button
                    className="py-2 px-6 rounded-lg bg-gray-300 hover:bg-gray-400 text-gray-800 font-medium"
                    onClick={() => {
                      setShowMainTaskDeleteForm(false);
                      setDeleteTaskId(null);
                    }}
                  >
                    Cancel
                  </button>
                  <button
                    className={`py-2 px-6 rounded-lg bg-red-600 hover:bg-red-700 text-white font-medium ${!deleteTaskId ? 'opacity-50 cursor-not-allowed' : ''}`}
                    disabled={!deleteTaskId}
                    onClick={async () => {
                      if (!deleteTaskId) return;
                      try {
                        const res = await fetch(`${import.meta.env.VITE_API_URL}/maintask/deleteStudioMainTask?id=${deleteTaskId}`, {
                          method: 'DELETE',
                        });
                        if (res.ok) {
                          setMainTasks(prev => prev.filter(t => t.id.toString() !== deleteTaskId));
                          setShowMainTaskDeleteForm(false);
                          setDeleteTaskId(null);
                          setSelectedItem(null);
                        } else {
                          alert('Failed to delete main task.');
                        }
                      } catch (err) {
                        alert('Error deleting main task.');
                      }
                    }}
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          )}
            
        </div>
      </div>

      {(() => {
        const q = searchQuery.trim().toLowerCase();
        const filtered = q
          ? mainTasks.filter((t) => {
              const values = [
                t.id,
                t.main_task_name,
                t.vendor_id,
                t.week_no,
                t.start_date,
                t.end_date,
              ]
                .filter(Boolean)
                .map((v) => String(v).toLowerCase());
              return values.some((v) => v.includes(q));
            })
          : mainTasks;
        return (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 px-2 sm:px-8 pb-8">
            {filtered.map((mainTask) => (
          <div
            key={mainTask.id}
            className="bg-white rounded-lg shadow p-3 border border-gray-200 flex flex-col gap-1 cursor-pointer hover:scale-105 transition-transform hover:border-blue-500 hover:bg-blue-50 text-sm"
            onClick={() => handleMainTaskSelect(mainTask)}
          >
              <div className="text-gray-700 text-sm mb-0.5">Week: <span className="font-medium">{mainTask.week_no || '-'}</span></div>
              <div className="text-gray-700 text-sm mb-0.5">Vendor: <span className="font-medium">{mainTask.vendor_id || '-'}</span></div>
              <div className="text-gray-700 text-sm mb-0.5">Duration: <span className="font-medium">{formatDate(mainTask.start_date)} - {formatDate(mainTask.end_date)}</span></div>
              <div className="text-gray-700 text-sm mb-0.5">Cost: <span className="font-medium">₹{mainTask.task_cost?.toLocaleString() || '-'}</span></div>
              <div className="text-gray-700 text-sm mb-0.5">Total Cost: <span className="font-medium">₹{mainTask.total_task_cost?.toLocaleString() || '-'}</span></div>
              <div className="text-gray-700 text-sm mb-0.5">Signup %: <span className="font-medium">{mainTask.signup_pct != null ? mainTask.signup_pct + '%' : '-'}</span></div>
              <div className="text-gray-700 text-sm mb-0.5">Tax: <span className="font-medium">SGST: {mainTask.sgst_pct}%, CGST: {mainTask.cgst_pct}%</span></div>
          </div>
            ))}
          </div>
        );
      })()}
    </div>
  );

  // Render Sub Tasks View
  const renderSubTasksView = () => (
    <div className="flex-1 w-full h-full">
      <div className="flex items-center gap-4 mb-8 px-2 sm:px-8 pt-8">
        <button
          className="bg-gray-200 hover:bg-gray-300 text-gray-800 px-4 py-2 rounded-lg font-semibold shadow"
          onClick={handleBackToMainTasks}
        >
          <span className="inline text-xl ">←</span> 
          <span className="hidden lg:inline "> Back to Main Tasks</span>
        </button>
        <div className="flex items-center gap-4 flex-1">
          <h2 className="text-base sm:text-lg md:text-xl  font-bold">Sub Tasks for {selectedMainTask?.main_task_name}</h2>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search sub tasks..."
            className="flex-1 max-w-md border rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
          />
        </div>
        <div className="flex items-center gap-2 ml-auto">
          <button
            className="bg-[#E07A5F] text-white px-5 py-2 rounded-lg shadow hover:scale-105 transition-transform font-medium text-lg"
            onClick={() => handleAdd('subTask')}
          >
            <span className="inline ">+</span>
            <span className="hidden lg:inline"> Add Sub Tasker</span>
          </button>
          <button
            className="py-2 px-3 rounded-md bg-green-500 text-white hover:bg-green-600 transition-colors text-sm font-medium"
            onClick={() => handleEdit(null, 'subTask')}
          >
            <i className="ri-edit-line mr-1 "></i>
            <span className="hidden lg:inline"> Edit</span>
          </button>
          <button
            className="py-2 px-3 rounded-md bg-red-500 text-white hover:bg-red-600 transition-colors text-sm font-medium"
            onClick={() => {
              setShowSubTaskDeleteForm(true);
              setDeleteTaskId(null);
            }}
            disabled={subTasks.length === 0}
          >
            <i className="ri-delete-bin-line mr-1 "></i>
            <span className="hidden lg:inline"> Delete</span>
          </button>
            {showSubTaskDeleteForm && (
  <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
    <div className="bg-white border border-red-400 rounded-lg p-6 max-w-md w-full mx-auto shadow-xl">
      <h3 className=" font-bold text-red-700 mb-4">Delete Sub Task</h3>
      <label className="block mb-2 font-semibold text-gray-700">Select Sub Task to Delete</label>
      <select
        className="w-full border rounded p-2 mb-4"
        value={deleteTaskId || ''}
        onChange={(e) => setDeleteTaskId(e.target.value)}
        autoFocus
      >
        <option value="" disabled>Select a sub task</option>
        {subTasks.map(task => (
          <option key={task.id} value={task.id}>{task.sub_task_name || `Sub Task #${task.id}`}</option>
        ))}
      </select>

      {deleteTaskId && (
        <div className="mb-4 p-3 bg-red-50 text-red-700 rounded-md">
          Warning: This action cannot be undone. All data associated with this sub task will be permanently deleted.
        </div>
      )}

      <div className="flex justify-end gap-3 mt-6">
        <button
          className="py-2 px-6 rounded-lg bg-gray-300 hover:bg-gray-400 text-gray-800 font-medium"
          onClick={() => {
            setShowSubTaskDeleteForm(false);
            setDeleteTaskId(null);
          }}
        >
          Cancel
        </button>
        <button
          className={`py-2 px-6 rounded-lg bg-red-600 hover:bg-red-700 text-white font-medium ${!deleteTaskId ? 'opacity-50 cursor-not-allowed' : ''}`}
          disabled={!deleteTaskId}
          onClick={async () => {
            if (!deleteTaskId) return;
            try {
              const res = await fetch(`${import.meta.env.VITE_API_URL}/subtask/deleteStudioSubTask?id=${deleteTaskId}`, {
                method: 'DELETE',
              });
              if (res.ok) {
                setSubTasks(prev => prev.filter(t => t.id.toString() !== deleteTaskId));
                setShowSubTaskDeleteForm(false);
                setDeleteTaskId(null);
                setSelectedItem(null);
              } else {
                alert('Failed to delete sub task.');
              }
            } catch (err) {
              alert('Error deleting sub task.');
            }
          }}
        >
          Delete
        </button>
      </div>
    </div>
  </div>
)}

        </div>
      </div>
      {(() => {
        const q = searchQuery.trim().toLowerCase();
        const filtered = q
          ? subTasks.filter((t) => {
              const values = [
                t.id,
                t.sub_task_name,
                t.sub_task_description,
                t.vendor_id,
                t.approver_id,
                t.approval_status,
                t.main_task,
              ]
                .filter(Boolean)
                .map((v) => String(v).toLowerCase());
              return values.some((v) => v.includes(q));
            })
          : subTasks;
        return (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 px-2 sm:px-8 pb-8">
            {filtered.map((subTask) => (
          <div
            key={subTask.id}
            className="bg-white rounded-lg shadow p-3 border border-gray-200 flex flex-col gap-1 text-sm"
          >
            <div className="font-bold text-base mb-1">{subTask.sub_task_name || `Sub Task #${subTask.id}`}</div>
            <div className="text-gray-700 text-sm mb-1">Main Task: <span className="font-medium">{subTask.main_task}</span></div>
            <div className="text-gray-700 text-sm mb-1">Description: <span className="font-medium">{subTask.sub_task_description || '-'}</span></div>
            <div className="text-gray-700 text-sm mb-1">Duration: <span className="font-medium">{formatDate(subTask.start_date)} - {formatDate(subTask.end_date)}</span></div>
            <div className="text-gray-700 text-sm mb-1">Vendor: <span className="font-medium">{subTask.vendor_id || '-'}</span></div>
            <div className="text-gray-700 text-sm mb-1">Completed: <span className="font-medium">{subTask.percent_complete != null ? subTask.percent_complete + '%' : '-'}</span></div>
            <div className="text-gray-700 text-sm mb-1">Approver: <span className="font-medium">{subTask.approver_id || '-'}</span></div>
            <div className="text-gray-700 text-sm mb-1">
              Status: <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(subTask.approval_status)}`}>
                {approvalStatuses[subTask.approval_status] || 'Unknown'}
              </span>
            </div>
            <div className="text-gray-700 text-base mb-1">Media: {subTask.media_path ? (
              <a href={subTask.media_path} target="_blank" rel="noopener noreferrer" className="text-blue-600 underline">View</a>
            ) : (
              '-')
            }</div>
          </div>
            ))}
          </div>
        );
      })()}
    </div>
  );

  {/*Render the delete button for main task*/}
  

  // Render form modal
  const renderFormModal = () => {
    const isEdit = showEditModal;
    const title = `${isEdit ? 'Edit' : 'Add'} ${modalType === 'project' ? 'Project' : modalType === 'mainTask' ? 'Main Task' : 'Sub Task'}`;
    
    return (
      <Modal title={title} onClose={() => {
        setShowAddProject(false);
        setShowAddMainTask(false);
        setShowAddSubTask(false);
        setShowEditModal(false);
        resetForms();
        setSelectedItem(null);
      }}>
        <form onSubmit={(e) => handleFormSubmit(e, modalType)} className="space-y-4">
          {modalType === 'project' && (
            <>
              <div>
                <label className="block mb-1 font-semibold">Project Name</label>
                <input
                  className="w-full border rounded-lg p-2"
                  type="text"
                  value={projectForm.project_name}
                  onChange={(e) => handleFormChange('project', 'project_name', e.target.value)}
                  required
                />
              </div>
              <div>
                <label className="block mb-1 font-semibold">Site Manager ID</label>
                <input
                  className="w-full border rounded-lg p-2"
                  type="text"
                  value={projectForm.site_mgr_id}
                  onChange={(e) => handleFormChange('project', 'site_mgr_id', e.target.value)}
                  required
                />
              </div>
              <div>
                <label className="block mb-1 font-semibold">Budget Category</label>
                <input
                  className="w-full border rounded-lg p-2"
                  type="number"
                  value={projectForm.budget_cat}
                  onChange={(e) => handleFormChange('project', 'budget_cat', e.target.value)}
                  required
                />
              </div>
              <div>
                <label className="block mb-1 font-semibold">Customer ID</label>
                <input
                  className="w-full border rounded-lg p-2"
                  type="text"
                  value={projectForm.cust_id}
                  onChange={(e) => handleFormChange('project', 'cust_id', e.target.value)}
                  required
                />
              </div>
              <div>
                <label className="block mb-1 font-semibold">Customer Flat</label>
                <input
                  className="w-full border rounded-lg p-2"
                  type="text"
                  value={projectForm.cust_flat}
                  onChange={(e) => handleFormChange('project', 'cust_flat', e.target.value)}
                  required
                />
              </div>
              <div>
                <label className="block mb-1 font-semibold">Community</label>
                <input
                  className="w-full border rounded-lg p-2"
                  type="text"
                  value={projectForm.cust_community}
                  onChange={(e) => handleFormChange('project', 'cust_community', e.target.value)}
                  required
                />
              </div>
              <div>
                <label className="block mb-1 font-semibold">Address</label>
                <input
                  className="w-full border rounded-lg p-2"
                  type="text"
                  value={projectForm.cust_address}
                  onChange={(e) => handleFormChange('project', 'cust_address', e.target.value)}
                  required
                />
              </div>
              <div>
                <label className="block mb-1 font-semibold">Total Cost</label>
                <input
                  className="w-full border rounded-lg p-2"
                  type="number"
                  step="0.01"
                  value={projectForm.total_cost}
                  onChange={(e) => handleFormChange('project', 'total_cost', e.target.value)}
                  required
                />
              </div>
              <div>
                <label className="block mb-1 font-semibold">Total Paid</label>
                <input
                  className="w-full border rounded-lg p-2"
                  type="number"
                  step="0.01"
                  value={projectForm.total_paid}
                  onChange={(e) => handleFormChange('project', 'total_paid', e.target.value)}
                  required
                />
              </div>
              <div>
                <label className="block mb-1 font-semibold">Total Balance</label>
                <input
                  className="w-full border rounded-lg p-2"
                  type="number"
                  step="0.01"
                  value={projectForm.total_balance}
                  onChange={(e) => handleFormChange('project', 'total_balance', e.target.value)}
                  required
                />
              </div>
              <div>
                <label className="block mb-1 font-semibold">Signup Date</label>
                <input
                  className="w-full border rounded-lg p-2"
                  type="datetime-local"
                  value={projectForm.signup_date ? projectForm.signup_date.replace(' ', 'T').substring(0, 16) : ''}
                  onChange={(e) => handleFormChange('project', 'signup_date', e.target.value.replace('T', ' ') + ':00')}
                  required
                />
              </div>
              <div>
                <label className="block mb-1 font-semibold">Signup Percentage</label>
                <input
                  className="w-full border rounded-lg p-2"
                  type="number"
                  step="0.01"
                  value={projectForm.signup_percentage}
                  onChange={(e) => handleFormChange('project', 'signup_percentage', e.target.value)}
                  required
                />
              </div>
              <div>
                <label className="block mb-1 font-semibold">Weeks Planned</label>
                <input
                  className="w-full border rounded-lg p-2"
                  type="number"
                  value={projectForm.weeks_planned}
                  onChange={(e) => handleFormChange('project', 'weeks_planned', e.target.value)}
                  required
                />
              </div>
              <div>
                <label className="block mb-1 font-semibold">Weeks Buffer</label>
                <input
                  className="w-full border rounded-lg p-2"
                  type="number"
                  value={projectForm.weeks_buffer}
                  onChange={(e) => handleFormChange('project', 'weeks_buffer', e.target.value)}
                  required
                />
              </div>
              <div>
                <label className="block mb-1 font-semibold">Weeks Total</label>
                <input
                  className="w-full border rounded-lg p-2"
                  type="number"
                  value={projectForm.weeks_total}
                  onChange={(e) => handleFormChange('project', 'weeks_total', e.target.value)}
                  required
                />
              </div>
              <div>
                <label className="block mb-1 font-semibold">TNT Start Date</label>
                <input
                  className="w-full border rounded-lg p-2"
                  type="datetime-local"
                  value={projectForm.tnt_start_date ? projectForm.tnt_start_date.replace(' ', 'T').substring(0, 16) : ''}
                  onChange={(e) => handleFormChange('project', 'tnt_start_date', e.target.value.replace('T', ' ') + ':00')}
                  required
                />
              </div>
              <div>
                <label className="block mb-1 font-semibold">Estimated End Date</label>
                <input
                  className="w-full border rounded-lg p-2"
                  type="datetime-local"
                  value={projectForm.est_end_date ? projectForm.est_end_date.replace(' ', 'T').substring(0, 16) : ''}
                  onChange={(e) => handleFormChange('project', 'est_end_date', e.target.value.replace('T', ' ') + ':00')}
                  required
                />
              </div>
              <div>
                <label className="block mb-1 font-semibold">Actual End Date</label>
                <input
                  className="w-full border rounded-lg p-2"
                  type="datetime-local"
                  value={projectForm.act_end_date ? projectForm.act_end_date.replace(' ', 'T').substring(0, 16) : ''}
                  onChange={(e) => handleFormChange('project', 'act_end_date', e.target.value.replace('T', ' ') + ':00')}
                />
              </div>
              <div>
                <label className="block mb-1 font-semibold">Current Status</label>
                <input
                  className="w-full border rounded-lg p-2"
                  type="number"
                  value={projectForm.current_status}
                  onChange={(e) => handleFormChange('project', 'current_status', e.target.value)}
                  required
                />
              </div>
              <div>
                <label className="block mb-1 font-semibold">Documents Path</label>
                <input
                  className="w-full border rounded-lg p-2"
                  type="url"
                  value={projectForm.documents_path}
                  onChange={(e) => handleFormChange('project', 'documents_path', e.target.value)}
                />
              </div>
            </>
          )}

          {modalType === 'mainTask' && (
            <>
              {showEditModal && (
                <div className="mb-4">
                  <label className="block mb-1 font-semibold">Select Main Task to Edit</label>
                  <select 
                    className="w-full border rounded-lg p-2"
                    onChange={(e) => {
                      const selectedId = e.target.value;
                      const task = mainTasks.find(task => task.id.toString() === selectedId);
                      if (task) {
                        setSelectedItem(task);
                        setMainTaskForm(task);
                      }
                    }}
                    value={selectedItem?.id || ''}
                  >
                    <option value="">Select Main Task</option>
                    {mainTasks.map(task => (
                      <option key={task.id} value={task.id}>{task.main_task_name || `Main Task #${task.id}`}</option>
                    ))}
                  </select>
                </div>
              )}
              <div>
                <label className="block mb-1 font-semibold">Week Number</label>
                <input
                  className="w-full border rounded-lg p-2"
                  type="number"
                  value={mainTaskForm.week_no}
                  onChange={(e) => handleFormChange('mainTask', 'week_no', e.target.value)}
                  required
                />
              </div>
              <div>
                <label className="block mb-1 font-semibold">Project ID</label>
                <input
                  className="w-full border rounded-lg p-2"
                  type="number"
                  value={mainTaskForm.project_id}
                  onChange={(e) => handleFormChange('mainTask', 'project_id', e.target.value)}
                  required
                  readOnly={!!selectedProject || showEditModal}
                />
              </div>
              <div>
                <label className="block mb-1 font-semibold">Main Task Name</label>
                <input
                  className="w-full border rounded-lg p-2"
                  type="text"
                  value={mainTaskForm.main_task_name}
                  onChange={(e) => handleFormChange('mainTask', 'main_task_name', e.target.value)}
                  required
                />
              </div>
              <div>
                <label className="block mb-1 font-semibold">Vendor ID</label>
                <input
                  className="w-full border rounded-lg p-2"
                  type="text"
                  value={mainTaskForm.vendor_id}
                  onChange={(e) => handleFormChange('mainTask', 'vendor_id', e.target.value)}
                  required
                />
              </div>
              <div>
                <label className="block mb-1 font-semibold">Start Date</label>
                <input
                  className="w-full border rounded-lg p-2"
                  type="date"
                  value={mainTaskForm.start_date}
                  onChange={(e) => handleFormChange('mainTask', 'start_date', e.target.value)}
                  required
                />
              </div>
              <div>
                <label className="block mb-1 font-semibold">End Date</label>
                <input
                  className="w-full border rounded-lg p-2"
                  type="date"
                  value={mainTaskForm.end_date}
                  onChange={(e) => handleFormChange('mainTask', 'end_date', e.target.value)}
                  required
                />
              </div>
              <div>
                <label className="block mb-1 font-semibold">Task Cost</label>
                <input
                  className="w-full border rounded-lg p-2"
                  type="number"
                  step="0.01"
                  value={mainTaskForm.task_cost}
                  onChange={(e) => handleFormChange('mainTask', 'task_cost', e.target.value)}
                  required
                  readOnly={showEditModal}
                />
              </div>
              <div>
                <label className="block mb-1 font-semibold">SGST Percentage</label>
                <input
                  className="w-full border rounded-lg p-2"
                  type="number"
                  step="0.1"
                  value={mainTaskForm.sgst_pct}
                  onChange={(e) => handleFormChange('mainTask', 'sgst_pct', e.target.value)}
                  required
                  readOnly={showEditModal}
                />
              </div>
              <div>
                <label className="block mb-1 font-semibold">CGST Percentage</label>
                <input
                  className="w-full border rounded-lg p-2"
                  type="number"
                  step="0.1"
                  value={mainTaskForm.cgst_pct}
                  onChange={(e) => handleFormChange('mainTask', 'cgst_pct', e.target.value)}
                  required
                  readOnly={showEditModal}
                />
              </div>
              <div>
                <label className="block mb-1 font-semibold">Total Task Cost</label>
                <input
                  className="w-full border rounded-lg p-2"
                  type="number"
                  step="0.01"
                  value={mainTaskForm.total_task_cost}
                  onChange={(e) => handleFormChange('mainTask', 'total_task_cost', e.target.value)}
                  required
                  readOnly={showEditModal}
                />
              </div>
              <div>
                <label className="block mb-1 font-semibold">Signup Percentage</label>
                <input
                  className="w-full border rounded-lg p-2"
                  type="number"
                  step="0.1"
                  value={mainTaskForm.signup_pct}
                  onChange={(e) => handleFormChange('mainTask', 'signup_pct', e.target.value)}
                  required
                  readOnly={showEditModal}
                />
              </div>
            </>
          )}

          {modalType === 'subTask' && (
            <>
              {showEditModal && (
                <div className="mb-4">
                  <label className="block mb-1 font-semibold">Select Sub Task to Edit</label>
                  <select 
                    className="w-full border rounded-lg p-2"
                    onChange={(e) => {
                      const selectedId = e.target.value;
                      const task = subTasks.find(task => task.id.toString() === selectedId);
                      if (task) {
                        setSelectedItem(task);
                        setSubTaskForm(task);
                      }
                    }}
                    value={selectedItem?.id || ''}
                  >
                    <option value="">Select Sub Task</option>
                    {subTasks.map(task => (
                      <option key={task.id} value={task.id}>{task.sub_task_name || `Sub Task #${task.id}`}</option>
                    ))}
                  </select>
                </div>
              )}
              <div>
                <label className="block mb-1 font-semibold">Main Task ID</label>
                <input
                  className="w-full border rounded-lg p-2"
                  type="number"
                  value={subTaskForm.main_task}
                  onChange={(e) => handleFormChange('subTask', 'main_task', e.target.value)}
                  required
                  readOnly={!!selectedMainTask || showEditModal}
                />
              </div>
              <div>
                <label className="block mb-1 font-semibold">Sub Task Name</label>
                <input
                  className="w-full border rounded-lg p-2"
                  type="text"
                  value={subTaskForm.sub_task_name}
                  onChange={(e) => handleFormChange('subTask', 'sub_task_name', e.target.value)}
                  required
                />
              </div>
              <div>
                <label className="block mb-1 font-semibold">Sub Task Description</label>
                <textarea
                  className="w-full border rounded-lg p-2"
                  value={subTaskForm.sub_task_description}
                  onChange={(e) => handleFormChange('subTask', 'sub_task_description', e.target.value)}
                  required
                />
              </div>
              <div>
                <label className="block mb-1 font-semibold">Start Date</label>
                <input
                  className="w-full border rounded-lg p-2"
                  type="datetime-local"
                  value={subTaskForm.start_date}
                  onChange={(e) => handleFormChange('subTask', 'start_date', e.target.value)}
                  required
                  readOnly={showEditModal}
                />
              </div>
              <div>
                <label className="block mb-1 font-semibold">End Date</label>
                <input
                  className="w-full border rounded-lg p-2"
                  type="datetime-local"
                  value={subTaskForm.end_date}
                  onChange={(e) => handleFormChange('subTask', 'end_date', e.target.value)}
                  required
                  readOnly={showEditModal}
                />
              </div>
              <div>
                <label className="block mb-1 font-semibold">Vendor ID</label>
                <input
                  className="w-full border rounded-lg p-2"
                  type="text"
                  value={subTaskForm.vendor_id}
                  onChange={(e) => handleFormChange('subTask', 'vendor_id', e.target.value)}
                  required
                />
              </div>
              <div>
                <label className="block mb-1 font-semibold">Percent Complete</label>
                <input
                  className="w-full border rounded-lg p-2"
                  type="number"
                  step="0.1"
                  min="0"
                  max="100"
                  value={subTaskForm.percent_complete}
                  onChange={(e) => handleFormChange('subTask', 'percent_complete', e.target.value)}
                  required
                />
              </div>
              <div>
                <label className="block mb-1 font-semibold">Approver ID</label>
                <input
                  className="w-full border rounded-lg p-2"
                  type="text"
                  value={subTaskForm.approver_id}
                  onChange={(e) => handleFormChange('subTask', 'approver_id', e.target.value)}
                  required
                />
              </div>
              <div>
                <label className="block mb-1 font-semibold">Media Path</label>
                <input
                  className="w-full border rounded-lg p-2"
                  type="text"
                  value={subTaskForm.media_path}
                  onChange={(e) => handleFormChange('subTask', 'media_path', e.target.value)}
                />
              </div>
              <div>
                <label className="block mb-1 font-semibold">Approval Status</label>
                <select
                  className="w-full border rounded-lg p-2"
                  value={subTaskForm.approval_status}
                  onChange={(e) => handleFormChange('subTask', 'approval_status', e.target.value)}
                  required
                >
                  <option value="">Select Status</option>
                  {Object.entries(approvalStatuses).map(([key, value]) => (
                    <option key={key} value={key}>{value}</option>
                  ))}
                </select>
              </div>
            </>
          )}

          <div className="flex gap-3 mt-4">
            <button
              type="button"
              onClick={() => {
                setShowAddProject(false);
                setShowAddMainTask(false);
                setShowAddSubTask(false);
                setShowEditModal(false);
                resetForms();
                setSelectedItem(null);
              }}
              className="flex-1 bg-gray-300 text-gray-800 py-2 rounded-lg font-semibold hover:bg-gray-400 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 bg-blue-600 text-white py-2 rounded-lg font-semibold hover:bg-blue-700 transition"
            >
              {isEdit ? 'Update' : 'Add'}
            </button>
          </div>
        </form>
      </Modal>
    );
  };

  // Handle delete confirmation
  const handleConfirmDelete = async () => {
    try {
      let url, id;
      
      if (isDropdownDeleteMode) {
        // For main tasks and sub tasks in dropdown mode
        id = deleteSelection;
        if (modalType === 'mainTask') {
          url = `${import.meta.env.VITE_API_URL}/maintask/deleteStudioMainTask?id=${id}`;
        } else if (modalType === 'subTask') {
          url = `${import.meta.env.VITE_API_URL}/subtask/deleteStudioSubTask?id=${id}`;
        }
      } else {
        // For projects or direct item deletion
        id = selectedItem.id;
        if (modalType === 'project') {
          url = `${import.meta.env.VITE_API_URL}/project/deletestudioproject?id=${id}`;
        } else if (modalType === 'mainTask') {
          url = `${import.meta.env.VITE_API_URL}/maintask/deleteStudioMainTask?id=${id}`;
        } else if (modalType === 'subTask') {
          url = `${import.meta.env.VITE_API_URL}/subtask/deleteStudioSubTask?id=${id}`;
        }
      }

      if (!url) {
        console.error('Invalid delete operation');
        return;
      }

      const response = await fetch(url, {
        method: 'DELETE',
      });

      if (response.ok) {
        // Update the UI based on what was deleted
        if (modalType === 'project') {
          setProjects(prev => prev.filter(p => p.id !== id));
          // If we're viewing this project's tasks, go back to projects view
          if (selectedProject && selectedProject.id === id) {
            handleBackToProjects();
          }
        } else if (modalType === 'mainTask') {
          setMainTasks(prev => prev.filter(t => t.id.toString() !== id.toString()));
          // If we're viewing this main task's subtasks, go back to main tasks view
          if (selectedMainTask && selectedMainTask.id.toString() === id.toString()) {
            handleBackToMainTasks();
          }
        } else if (modalType === 'subTask') {
          setSubTasks(prev => prev.filter(t => t.id.toString() !== id.toString()));
        }
        
        // Reset state
        setShowDeleteModal(false);
        setIsDropdownDeleteMode(false);
        setDeleteSelection(null);
        setSelectedItem(null);
      } else {
        const errorData = await response.json();
        console.error('Delete failed:', errorData);
        alert(`Failed to delete: ${errorData.message || 'Unknown error'}`); 
      }
    } catch (error) {
      console.error('Error during delete:', error);
      alert('An error occurred while trying to delete. Please try again.');
    }
  };

  // Render delete confirmation modal
  const renderDeleteModal = () => (
  <Modal title="Delete Confirmation" onClose={() => { setShowDeleteModal(false); setIsDropdownDeleteMode(false); setDeleteSelection(null); }}>
    {isDropdownDeleteMode ? (
      <>
        <div className="mb-4">
          <label className="block mb-2 font-semibold text-gray-700">
            Select {modalType === 'mainTask' ? 'Main Task' : 'Sub Task'} to Delete
          </label>
          <select
            className="w-full border rounded-lg p-2"
            value={deleteSelection || ''}
            onChange={e => setDeleteSelection(e.target.value)}
          >
            <option value="" disabled>Select one</option>
            {deleteList.map(item => (
              <option key={item.id} value={item.id}>{item.name}</option>
            ))}
          </select>
        </div>

        {deleteSelection && (
          <div className="mb-4 text-red-600 font-semibold">
            Warning: Are you sure you want to delete this {modalType === 'mainTask' ? 'Main Task' : 'Sub Task'}?
          </div>
        )}

        <div className="flex justify-center gap-4">
          <button
            className="bg-gray-300 text-gray-800 px-4 py-2 rounded-lg font-semibold hover:bg-gray-400 transition"
            onClick={() => {
              setIsDropdownDeleteMode(false);
              setDeleteSelection(null);
              setSelectedItem(null);
              setShowDeleteModal(false);
            }}
          >
            Cancel
          </button>
          <button
            className={`bg-red-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-red-700 transition ${!deleteSelection ? 'opacity-50 cursor-not-allowed' : ''}`}
            disabled={!deleteSelection}
            onClick={handleConfirmDelete}
          >
            Delete
          </button>
        </div>
      </>
    ) : (
      <>
        <div className="text-center mb-6">
          Are you sure you want to delete this {modalType === 'project' ? 'project' : modalType === 'mainTask' ? 'main task' : 'sub task'}?
          {selectedItem && (
            <div className="font-semibold mt-2">
              {modalType === 'project' ? selectedItem.project_name : 
               modalType === 'mainTask' ? selectedItem.main_task_name || `Main Task #${selectedItem.id}` : 
               selectedItem.sub_task_name || `Sub Task #${selectedItem.id}`}
            </div>
          )}
        </div>
        <div className="flex justify-center gap-4">
          <button
            className="bg-gray-300 text-gray-800 px-4 py-2 rounded-lg font-semibold hover:bg-gray-400 transition"
            onClick={() => setShowDeleteModal(false)}
          >
            Cancel
          </button>
          <button
            className="bg-red-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-red-700 transition"
            onClick={handleConfirmDelete}
          >
            Delete
          </button>
        </div>
      </>
    )}
  </Modal>
);

  return (
    <>
      {currentView === 'projects' && renderProjectsView()}
      {currentView === 'mainTasks' && renderMainTasksView()}
      {currentView === 'subTasks' && renderSubTasksView()}
      
      {/* Modals */}
      {(showAddProject || showAddMainTask || showAddSubTask || showEditModal) && renderFormModal()}
      {showDeleteModal && renderDeleteModal()}
    </>
  );
}

export default Projects;



