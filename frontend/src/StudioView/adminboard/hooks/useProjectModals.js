import { useState } from 'react';

export const useProjectModals = () => {
  const [showAddProject, setShowAddProject] = useState(false);
  const [showAddMainTask, setShowAddMainTask] = useState(false);
  const [showAddSubTask, setShowAddSubTask] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showMediaModal, setShowMediaModal] = useState(false);
  const [showProjectDeleteForm, setShowProjectDeleteForm] = useState(false);
  const [showMainTaskDeleteForm, setShowMainTaskDeleteForm] = useState(false);
  const [showSubTaskDeleteForm, setShowSubTaskDeleteForm] = useState(false);
  
  const [selectedItem, setSelectedItem] = useState(null);
  const [modalType, setModalType] = useState('');
  const [deleteSelection, setDeleteSelection] = useState(null);
  const [deleteList, setDeleteList] = useState([]);
  const [isDropdownDeleteMode, setIsDropdownDeleteMode] = useState(false);
  const [deleteProjectId, setDeleteProjectId] = useState(null);
  const [deleteTaskId, setDeleteTaskId] = useState(null);
  const [selectedSubTaskForMedia, setSelectedSubTaskForMedia] = useState(null);
  const [mediaUploadType, setMediaUploadType] = useState('');

  const closeAllModals = () => {
    setShowAddProject(false);
    setShowAddMainTask(false);
    setShowAddSubTask(false);
    setShowEditModal(false);
    setShowDeleteModal(false);
    setShowMediaModal(false);
    setShowProjectDeleteForm(false);
    setShowMainTaskDeleteForm(false);
    setShowSubTaskDeleteForm(false);
    setSelectedItem(null);
    setDeleteSelection(null);
    setDeleteProjectId(null);
    setDeleteTaskId(null);
    setSelectedSubTaskForMedia(null);
    setMediaUploadType('');
  };

  const openAddModal = (type) => {
    setModalType(type);
    setShowAddProject(type === 'project');
    setShowAddMainTask(type === 'mainTask');
    setShowAddSubTask(type === 'subTask');
  };

  const openEditModal = (item, type) => {
    setSelectedItem(item);
    setModalType(type);
    setShowEditModal(true);
  };

  const openDeleteModal = (item, type) => {
    setSelectedItem(item);
    setModalType(type);
    setShowDeleteModal(true);
  };

  return {
    // Modal states
    showAddProject,
    showAddMainTask,
    showAddSubTask,
    showEditModal,
    showDeleteModal,
    showMediaModal,
    showProjectDeleteForm,
    showMainTaskDeleteForm,
    showSubTaskDeleteForm,
    
    // Modal data
    selectedItem,
    modalType,
    deleteSelection,
    deleteList,
    isDropdownDeleteMode,
    deleteProjectId,
    deleteTaskId,
    selectedSubTaskForMedia,
    mediaUploadType,
    
    // Setters
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
    
    // Helper functions
    closeAllModals,
    openAddModal,
    openEditModal,
    openDeleteModal
  };
};
