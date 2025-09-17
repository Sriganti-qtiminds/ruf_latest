import React, { useEffect, useState } from 'react';
import '../glassmorphic.css';
import Modal from './Modal';
import useAppStore from "../../../store/appstore";
import { createPortal } from 'react-dom';

// Import extracted components
import ProjectForm from './Project/ProjectForm';
import MainTaskForm from './Project/MainTaskForm';
import SubTaskForm from './Project/SubTaskForm';
import ProjectsView from './Project/ProjectsView';
import MainTasksView from './Project/MainTasksView';
import SubTasksView from './Project/SubTasksView';
import MediaModal from './Project/MediaModal';
import DeleteModal from './Project/DeleteModal';

// Import custom hooks
import { useProjectData } from '../hooks/useProjectData';
import { useProjectForms } from '../hooks/useProjectForms';
import { useProjectModals } from '../hooks/useProjectModals';

// Import utilities and constants
import { 
  getNameById, 
  getVendorNameById, 
  getCustomerNameById, 
  getTotalWeeksFromProject, 
  generateWeekOptions,
  categorizeFiles,
  getChangedValues,
  buildKeyValuePayload
} from '../utils/projectUtils';
import { 
  approvalStatuses, 
  getStatusColor, 
  formatDate, 
  formatShortDate, 
  normalizeDateTime 
} from '../constants/projectConstants';

function Projects({ setSearchData, setSearchFields }) {
  // Use custom hooks
  const {
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
  } = useProjectData();

  const {
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
  } = useProjectForms();

  const {
    showAddProject,
    showAddMainTask,
    showAddSubTask,
    showEditModal,
    showDeleteModal,
    showMediaModal,
    showProjectDeleteForm,
    showMainTaskDeleteForm,
    showSubTaskDeleteForm,
    selectedItem,
    modalType,
    deleteSelection,
    deleteList,
    isDropdownDeleteMode,
    deleteProjectId,
    deleteTaskId,
    selectedSubTaskForMedia,
    mediaUploadType,
    setShowAddProject,
    setShowAddMainTask,
    setShowAddSubTask,
    setShowEditModal,
    setShowDeleteModal,
    setShowMediaModal,
    setShowProjectDeleteForm,
    setShowMainTaskDeleteForm,
    setShowSubTaskDeleteForm,
    setSelectedItem,
    setModalType,
    setDeleteSelection,
    setDeleteList,
    setIsDropdownDeleteMode,
    setDeleteProjectId,
    setDeleteTaskId,
    setSelectedSubTaskForMedia,
    setMediaUploadType,
    closeAllModals,
    openAddModal,
    openEditModal,
    openDeleteModal
  } = useProjectModals();

  // Local state
  const [currentView, setCurrentView] = useState('projects');
  const [selectedProject, setSelectedProject] = useState(null);
  const [selectedMainTask, setSelectedMainTask] = useState(null);
  const [currentProjectIndex, setCurrentProjectIndex] = useState(0);
  const [hoveredProject, setHoveredProject] = useState(null);
  const [lastHoveredProject, setLastHoveredProject] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  
  // Autocomplete states
  const [customerSearchQuery, setCustomerSearchQuery] = useState('');
  const [showCustomerDropdown, setShowCustomerDropdown] = useState(false);
  const [filteredCustomers, setFilteredCustomers] = useState([]);

  // Original values for change tracking
  const [originalMainTaskValues, setOriginalMainTaskValues] = useState({});
  const [originalSubTaskValues, setOriginalSubTaskValues] = useState({});

  // Get store data
  const { users, siteManagers, vendors, fetchUsersAndSiteManagers, fetchVendors } = useAppStore();

  useEffect(() => {
    fetchProjects();
    fetchUsersAndSiteManagers();
    fetchVendors();
    fetchPaymentPlans();
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

  // Handle customer search for autocomplete
  useEffect(() => {
    if (customerSearchQuery.trim() === '') {
      setFilteredCustomers([]);
      setShowCustomerDropdown(false);
      return;
    }

    const filtered = users.filter(user => 
      user.name?.toLowerCase().includes(customerSearchQuery.toLowerCase()) ||
      user.id?.toString().includes(customerSearchQuery)
    ).slice(0, 10); // Limit to 10 results

    setFilteredCustomers(filtered);
    setShowCustomerDropdown(filtered.length > 0);
  }, [customerSearchQuery, users]);

  // Navigation handlers
  const handleProjectSelect = (project) => {
    setSelectedProject(project);
    setCurrentView('mainTasks');
    fetchMainTasks(project.id);
  };

  const handleMainTaskSelect = (mainTask) => {
    console.log('Main task selected:', mainTask);
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

  // Function to handle media upload for subtask
  const handleMediaUpload = async (files, uploadType) => {
    if (!selectedSubTaskForMedia || !files.length) return;
    
    try {
      const categorizedFiles = categorizeFiles(Array.from(files));
      const formData = new FormData();
      
      // Add subtask data
      const subTaskPayload = {
        id: selectedSubTaskForMedia.id,
        approval_status: selectedSubTaskForMedia.approval_status,
        approval_id: selectedSubTaskForMedia.approval_id,
        week_no: selectedSubTaskForMedia.week_no
      };
      
      formData.append('subTaskData', JSON.stringify(subTaskPayload));
      
      // Add files based on type and extension
      if (uploadType === 'before') {
        categorizedFiles.images.forEach(file => {
          formData.append('beforeImages', file);
        });
        categorizedFiles.videos.forEach(file => {
          formData.append('beforeVideos', file);
        });
      } else if (uploadType === 'after') {
        categorizedFiles.images.forEach(file => {
          formData.append('afterImages', file);
        });
        categorizedFiles.videos.forEach(file => {
          formData.append('afterVideos', file);
        });
      }
      
      const response = await fetch(`${import.meta.env.VITE_API_URL}/subtask/updateStudioSubTask`, {
        method: 'PUT',
        body: formData
      });
      
      if (response.ok) {
        alert('Media uploaded successfully!');
        setShowMediaModal(false);
        setSelectedSubTaskForMedia(null);
        setMediaUploadType('');
        // Refresh subtasks data
        fetchSubTasks();
      } else {
        alert('Failed to upload media');
      }
    } catch (error) {
      console.error('Error uploading media:', error);
      alert('Error uploading media');
    }
  };

  const handleAdd = (type) => {
    openAddModal(type);
    
    // Reset customer search query for new projects
    if (type === 'project') {
      setCustomerSearchQuery('');
    }
    
    // Pre-fill forms with context data
    if (type === 'mainTask' && selectedProject) {
      setMainTaskForm(prev => ({ ...prev, project_id: selectedProject.id }));
    }
    if (type === 'subTask' && selectedMainTask) {
      setSubTaskForm(prev => ({ 
        ...prev, 
        main_task: selectedMainTask.id,
        vendor_id: selectedMainTask.vendor_id // Auto-fill vendor ID from selected main task
      }));
    }
  };

  const handleEdit = (item, type) => {
    openEditModal(item, type);
    
    // Pre-fill form with item data if an item is selected
    if (item) {
      switch (type) {
        case 'project':
          setProjectForm(item);
          // Set customer search query for autocomplete
          if (item.cust_id) {
            const customerName = getCustomerNameById(item.cust_id, users);
            setCustomerSearchQuery(customerName || item.cust_id.toString());
          } else {
            setCustomerSearchQuery('');
          }
          break;
        case 'mainTask':
          setMainTaskForm(item);
          setOriginalMainTaskValues({ ...item });
          break;
        case 'subTask':
          setSubTaskForm(item);
          setOriginalSubTaskValues({ ...item });
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
            project_id: selectedProject ? selectedProject.id : '',
            main_task_name: '',
            vendor_id: '',
            task_cost: ''
          });
          break;
        case 'subTask':
          // For sub tasks, pre-fill main_task and vendor_id if a main task is selected
          setSubTaskForm({
            main_task: selectedMainTask ? selectedMainTask.id : '',
            vendor_id: selectedMainTask ? selectedMainTask.vendor_id : '', // Auto-fill vendor ID from selected main task
            percent_complete: '',
            approver_id: '',
            approval_id: '',
            approval_status: '',
            sub_task_name: '',
            sub_task_description: '',
            week_no: ''
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
          // Build FormData for project including documents
          const projectFormData = new FormData();
          const projectPayloadEntries = Object.entries({
            ...projectForm,
            signup_date: normalizeDateTime(projectForm.signup_date),
            tnt_start_date: normalizeDateTime(projectForm.tnt_start_date),
            est_end_date: normalizeDateTime(projectForm.est_end_date),
            act_end_date: normalizeDateTime(projectForm.act_end_date),
          })
            .filter(([_, v]) => v !== undefined)
            .map(([key, value]) => ({ key, value }));
          if (showEditModal && selectedItem?.id != null) {
            projectPayloadEntries.push({ key: 'id', value: selectedItem.id });
          }
          projectFormData.append('projectData', JSON.stringify(projectPayloadEntries));
          // Attach documents
          projectDocuments.forEach((file) => {
            projectFormData.append('documents', file);
          });
          body = projectFormData;
          break;
        case 'mainTask':
          method = showEditModal ? 'PUT' : 'POST';
          
          // For edit mode, get the ID and add it to URL
          let mainTaskId = null;
          if (showEditModal) {
            if (selectedItem?.id != null) {
              mainTaskId = selectedItem.id;
            } else if (mainTaskForm.id != null) {
              mainTaskId = mainTaskForm.id;
            } else {
              console.error('No ID found for editing main task');
              alert('Error: No main task selected for editing');
              return;
            }
          }
          
          url = showEditModal
            ? `${import.meta.env.VITE_API_URL}/maintask/updateStudioMainTask`
            : `${import.meta.env.VITE_API_URL}/maintask/addNewStudioMainTask`;
          
          // Only include the specific fields required
          const mainTaskPayload = {
            project_id: mainTaskForm.project_id,
            main_task_name: mainTaskForm.main_task_name,
            vendor_id: mainTaskForm.vendor_id,
            task_cost: mainTaskForm.task_cost
          };
          
          // For edit mode, include the ID in the payload
          if (showEditModal && mainTaskId) {
            mainTaskPayload.id = mainTaskId;
          }
          
          console.log('Main Task Form Data:', mainTaskForm);
          console.log('Selected Item:', selectedItem);
          console.log('Main Task Payload (filtered):', mainTaskPayload);
          
          const keyValuePayload = buildKeyValuePayload(mainTaskPayload, 'mainTaskData');
          console.log('Key-Value Payload:', keyValuePayload);
          
          body = JSON.stringify(keyValuePayload);
          console.log('Final API Body:', body);
          break;
        case 'subTask':
          method = showEditModal ? 'PUT' : 'POST';
          url = showEditModal
            ? `${import.meta.env.VITE_API_URL}/subtask/updateStudioSubTask`
            : `${import.meta.env.VITE_API_URL}/subtask/addNewStudioSubTask`;
          
          // Create FormData for sub tasks with file uploads
          const formData = new FormData();
          
          // Create sub task payload as raw array format
          const subTaskData = {
            main_task: subTaskForm.main_task,
            vendor_id: subTaskForm.vendor_id,
            approver_id: subTaskForm.approver_id,
            approval_status: subTaskForm.approval_status,
            sub_task_name: subTaskForm.sub_task_name,
            sub_task_description: subTaskForm.sub_task_description,
            week_no: subTaskForm.week_no
          };
          
          // For edit mode, include the ID
          if (showEditModal && selectedItem?.id != null) {
            subTaskData.id = selectedItem.id;
          }
          
          // Convert to key-value pair array format (not wrapped in object)
          const subTaskPayload = Object.entries(subTaskData)
            .filter(([_, v]) => v !== undefined)
            .map(([k, v]) => ({ key: k, value: v }));
          
          formData.append('subTaskData', JSON.stringify(subTaskPayload));
          console.log('SubTask Payload:', JSON.stringify(subTaskPayload));
          
          // Add files to FormData
          subTaskFiles.beforeImages.forEach((file, index) => {
            formData.append('beforeImages', file);
          });
          subTaskFiles.afterImages.forEach((file, index) => {
            formData.append('afterImages', file);
          });
          subTaskFiles.beforeVideos.forEach((file, index) => {
            formData.append('beforeVideos', file);
          });
          subTaskFiles.afterVideos.forEach((file, index) => {
            formData.append('afterVideos', file);
          });
          
          body = formData;
          break;
      }

      const isFormData = body instanceof FormData;
      const response = await fetch(url, {
        method: method || 'POST',
        headers: isFormData ? {} : { 'Content-Type': 'application/json' },
        body
      });

      if (response.ok) {
        console.log('Form submitted successfully!');
        // Refresh data based on current view
        if (currentView === 'projects') {
          fetchProjects();
        } else if (currentView === 'mainTasks') {
          fetchMainTasks(selectedProject.id);
        } else if (currentView === 'subTasks') {
          fetchSubTasks(selectedMainTask.id);
        }
        
        // Close modals and reset forms
        closeAllModals();
        resetForms(selectedMainTask);
      } else {
        const errorData = await response.json();
        console.error('Form submission failed:', errorData);
        alert(`Failed to save: ${errorData.message || 'Unknown error'}`);
      }
    } catch (error) {
      console.error('Error saving:', error);
    }
  };

  // Render form modal
  const renderFormModal = () => {
    const isEdit = showEditModal;
    const title = `${isEdit ? 'Edit' : 'Add'} ${modalType === 'project' ? 'Project' : modalType === 'mainTask' ? 'Main Task' : 'Sub Task'}`;
    
    return (
      <Modal title={title} onClose={() => {
        closeAllModals();
        resetForms(selectedMainTask);
        setCustomerSearchQuery('');
        setShowCustomerDropdown(false);
      }}>
        <form onSubmit={(e) => handleFormSubmit(e, modalType)} className="space-y-4">
          {modalType === 'project' && (
            <ProjectForm
              projectForm={projectForm}
              handleFormChange={handleFormChange}
              customerSearchQuery={customerSearchQuery}
              setCustomerSearchQuery={setCustomerSearchQuery}
              showCustomerDropdown={showCustomerDropdown}
              setShowCustomerDropdown={setShowCustomerDropdown}
              filteredCustomers={filteredCustomers}
              siteManagers={siteManagers}
              projectDocuments={projectDocuments}
              setProjectDocuments={setProjectDocuments}
            />
          )}

          {modalType === 'mainTask' && (
            <MainTaskForm
              mainTaskForm={mainTaskForm}
              handleFormChange={handleFormChange}
              showEditModal={showEditModal}
              mainTasks={mainTasks}
              selectedItem={selectedItem}
              setSelectedItem={setSelectedItem}
              setMainTaskForm={setMainTaskForm}
              selectedProject={selectedProject}
              vendors={vendors}
            />
          )}

          {modalType === 'subTask' && (
            <SubTaskForm
              subTaskForm={subTaskForm}
              handleFormChange={handleFormChange}
              showEditModal={showEditModal}
              selectedItem={selectedItem}
              selectedMainTask={selectedMainTask}
              getVendorNameById={(id) => getVendorNameById(id, vendors)}
              getCustomerNameById={(id) => getCustomerNameById(id, users)}
              users={users}
              siteManagers={siteManagers}
              vendors={vendors}
              approvalStatuses={approvalStatuses}
              generateWeekOptions={() => generateWeekOptions(getTotalWeeksFromProject(selectedProject))}
              getTotalWeeksFromProject={() => getTotalWeeksFromProject(selectedProject)}
              subTaskFiles={subTaskFiles}
              setSubTaskFiles={setSubTaskFiles}
            />
          )}

          <div className="flex gap-3 mt-4">
            <button
              type="button"
              onClick={() => {
                closeAllModals();
                resetForms(selectedMainTask);
                setCustomerSearchQuery('');
                setShowCustomerDropdown(false);
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
        closeAllModals();
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

  return (
    <>
      {currentView === 'projects' && (
        <ProjectsView
          projects={projects}
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          currentProjectIndex={currentProjectIndex}
          setCurrentProjectIndex={setCurrentProjectIndex}
          hoveredProject={hoveredProject}
          lastHoveredProject={lastHoveredProject}
          setHoveredProject={setHoveredProject}
          setLastHoveredProject={setLastHoveredProject}
          paymentPlans={paymentPlans}
          showProjectDeleteForm={showProjectDeleteForm}
          setShowProjectDeleteForm={setShowProjectDeleteForm}
          deleteProjectId={deleteProjectId}
          setDeleteProjectId={setDeleteProjectId}
          handleProjectSelect={handleProjectSelect}
          handleEdit={handleEdit}
          handleDelete={handleDelete}
          formatDate={formatDate}
          formatShortDate={formatShortDate}
          getStatusColor={getStatusColor}
          getNameById={(id) => getNameById(id, siteManagers)}
        />
      )}

      {currentView === 'mainTasks' && (
        <MainTasksView
          mainTasks={mainTasks}
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          selectedProject={selectedProject}
          handleBackToProjects={handleBackToProjects}
          handleAdd={handleAdd}
          handleEdit={handleEdit}
          handleMainTaskSelect={handleMainTaskSelect}
          getVendorNameById={(id) => getVendorNameById(id, vendors)}
          setMainTasks={setMainTasks}
          setSelectedItem={setSelectedItem}
        />
      )}

      {currentView === 'subTasks' && (
        <SubTasksView
          subTasks={subTasks}
          mainTasks={mainTasks}
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          selectedMainTask={selectedMainTask}
          showSubTaskDeleteForm={showSubTaskDeleteForm}
          setShowSubTaskDeleteForm={setShowSubTaskDeleteForm}
          deleteTaskId={deleteTaskId}
          setDeleteTaskId={setDeleteTaskId}
          handleBackToMainTasks={handleBackToMainTasks}
          handleAdd={handleAdd}
          handleEdit={handleEdit}
          getVendorNameById={(id) => getVendorNameById(id, vendors)}
          getCustomerNameById={(id) => getCustomerNameById(id, users)}
          getStatusColor={getStatusColor}
          approvalStatuses={approvalStatuses}
          setSubTasks={setSubTasks}
          setSelectedItem={setSelectedItem}
          setSelectedSubTaskForMedia={setSelectedSubTaskForMedia}
          setShowMediaModal={setShowMediaModal}
        />
      )}
      
      {/* Modals */}
      {(showAddProject || showAddMainTask || showAddSubTask || showEditModal) && renderFormModal()}
      {showDeleteModal && (
        <DeleteModal
          isDropdownDeleteMode={isDropdownDeleteMode}
          modalType={modalType}
          deleteSelection={deleteSelection}
          setDeleteSelection={setDeleteSelection}
          deleteList={deleteList}
          selectedItem={selectedItem}
          handleConfirmDelete={handleConfirmDelete}
          closeAllModals={closeAllModals}
        />
      )}
      {showMediaModal && (
        <MediaModal
          selectedSubTaskForMedia={selectedSubTaskForMedia}
          setShowMediaModal={setShowMediaModal}
          setSelectedSubTaskForMedia={setSelectedSubTaskForMedia}
          setMediaUploadType={setMediaUploadType}
          handleMediaUpload={handleMediaUpload}
        />
      )}
    </>
  );
}

export default Projects;
