import React, { useState } from 'react';
import PaymentPlanView from './PaymentPlanView';

const ProjectsView = ({
  projects,
  searchQuery,
  setSearchQuery,
  currentProjectIndex,
  setCurrentProjectIndex,
  hoveredProject,
  lastHoveredProject,
  setHoveredProject,
  setLastHoveredProject,
  paymentPlans,
  showProjectDeleteForm,
  setShowProjectDeleteForm,
  deleteProjectId,
  setDeleteProjectId,
  handleProjectSelect,
  handleEdit,
  handleDelete,
  formatDate,
  formatShortDate,
  getStatusColor,
  getNameById,
}) => {
  // Expanded view state
  const [expandedProject, setExpandedProject] = useState(null);
  const [expandedView, setExpandedView] = useState(null); // 'details', 'documents', or 'invoices'
  const [documents, setDocuments] = useState([]);
  const [documentsLoading, setDocumentsLoading] = useState(false);
  const [documentsError, setDocumentsError] = useState(null);
  const [invoices, setInvoices] = useState([]);
  const [invoicesLoading, setInvoicesLoading] = useState(false);
  const [invoicesError, setInvoicesError] = useState(null);
  
  // Payment plan view state
  const [showPaymentPlan, setShowPaymentPlan] = useState(false);
  const [selectedProjectForPaymentPlan, setSelectedProjectForPaymentPlan] = useState(null);


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

  // Handle documents button click
  const handleDocumentsClick = (project) => {
    if (expandedProject?.id === project.id && expandedView === 'documents') {
      // If same project and same view, close it
      setExpandedProject(null);
      setExpandedView(null);
    } else {
      // Open documents view
      setExpandedProject(project);
      setExpandedView('documents');
      fetchDocuments(project);
    }
  };

  // Handle details button click
  const handleDetailsClick = (project) => {
    if (expandedProject?.id === project.id && expandedView === 'details') {
      // If same project and same view, close it
      setExpandedProject(null);
      setExpandedView(null);
    } else {
      // Open details view
      setExpandedProject(project);
      setExpandedView('details');
    }
  };

  // Fetch documents for a project
  const fetchDocuments = async (project) => {
    if (!project) return;
    
    setDocumentsLoading(true);
    setDocumentsError(null);
    
    try {
      const formattedId = project.project_formatted_id || 
                         project.formatted_id || 
                         project.project_id || 
                         project.id;
      
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/project/getProjectDocuments?project_formatted_id=${formattedId}`
      );
      
      if (!response.ok) {
        throw new Error(`Failed to fetch documents: ${response.status}`);
      }
      
      const data = await response.json();
      console.log("Documents API Response:", data);
      
      // Handle backend format: { success, data: [{ documents: [...] }] }
      const docs = data?.data?.[0]?.documents && Array.isArray(data.data[0].documents)
        ? data.data[0].documents
        : [];
      
      setDocuments(docs);
    } catch (err) {
      console.error("Error fetching documents:", err);
      setDocumentsError(err.message);
    } finally {
      setDocumentsLoading(false);
    }
  };

  // Fetch invoices for a project
  const fetchInvoices = async (project) => {
    if (!project) return;
    
    setInvoicesLoading(true);
    setInvoicesError(null);
    
    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/invoice/getinvoiceInfo?proj_id=${project.id}`
      );
      
      if (!response.ok) {
        throw new Error(`Failed to fetch invoices: ${response.status}`);
      }
      
      const data = await response.json();
      console.log("Invoices API Response:", data);
      
      if (data.success && data.result) {
        setInvoices(data.result);
      } else {
        setInvoices([]);
      }
    } catch (err) {
      console.error("Error fetching invoices:", err);
      setInvoicesError(err.message);
    } finally {
      setInvoicesLoading(false);
    }
  };

  // Handle payment plan button click
  const handlePaymentPlanClick = (project) => {
    setSelectedProjectForPaymentPlan(project);
    setShowPaymentPlan(true);
  };

  // Close payment plan view
  const closePaymentPlan = () => {
    setShowPaymentPlan(false);
    setSelectedProjectForPaymentPlan(null);
  };

  // Handle invoice button click
  const handleInvoiceClick = (project) => {
    if (expandedProject?.id === project.id && expandedView === 'invoices') {
      // If same project and same view, close it
      setExpandedProject(null);
      setExpandedView(null);
    } else {
      // Open invoices view
      setExpandedProject(project);
      setExpandedView('invoices');
      fetchInvoices(project);
    }
  };

  // Project Details Content Component
  const ProjectDetailsContent = ({ project, getNameById, formatDate, formatShortDate, getStatusColor }) => {
    return (
      <div className="grid grid-cols-1 gap-6">
        {/* Project Details Card */}
        <div className="bg-white rounded-xl shadow-lg p-3 border border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold text-gray-800">Project Information</h3>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {/* Basic Information */}
            <div className="space-y-2 text-sm">
              <h4 className="font-semibold text-gray-700 border-b pb-1">Basic Information</h4>
              <div className="space-y-1">
                <div className="flex justify-between">
                  <span className="text-gray-600">Project Name:</span>
                  <span className="font-medium">{project.project_name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Customer Name:</span>
                  <span className="font-medium">{project.customer_name || '-'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Customer Address:</span>
                  <span className="font-medium">{project.cust_address}</span>
                </div>
              </div>
            </div>

            {/* Project Details */}
            <div className="space-y-2 text-sm">
              <h4 className="font-semibold text-gray-700 border-b pb-1">Project Details</h4>
              <div className="space-y-1">
                <div className="flex justify-between">
                  <span className="text-gray-600">Budget Category:</span>
                  <span className="font-medium">{project.budget_cat || 'N/A'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Planned Weeks:</span>
                  <span className="font-medium">{project.weeks_planned || 'N/A'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Buffer Weeks:</span>
                  <span className="font-medium">{project.no_of_weeks - project.weeks_planned || 'N/A'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Total Weeks:</span>
                  <span className="font-medium">{project.no_of_weeks || 'N/A'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Total Cost:</span>
                  <span className="font-medium">
                    {project.total_cost != null ? `₹${project.total_cost.toLocaleString()}` : 'N/A'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Total Paid:</span>
                  <span className="font-medium">
                    {project.total_paid != null ? `₹${project.total_paid.toLocaleString()}` : 'N/A'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Balance:</span>
                  <span className="font-medium">
                    {project.total_balance != null ? `₹${project.total_balance.toLocaleString()}` : 'N/A'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Status:</span>
                  <span className="font-medium">{project.current_status || 'N/A'}</span>
                </div>
              </div>
            </div>

            {/* Management & Documents */}
            <div className="space-y-2 text-sm">
              <h4 className="font-semibold text-gray-700 border-b pb-1">Management & Documents</h4>
              <div className="space-y-1">
                <div className="flex justify-between">
                  <span className="text-gray-600">Site Manager:</span>
                  <span className="font-medium">
                    {getNameById(project.site_mgr_id)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Signup Date:</span>
                  <span className="font-medium">{formatDate(project.signup_date)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Start Date:</span>
                  <span className="font-medium">{formatDate(project.tnt_start_date)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Est. End Date:</span>
                  <span className="font-medium">{formatDate(project.est_end_date)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Documents:</span>
                  <span className="font-medium">
                    {project?.documents_path?.files?.pdfs?.length > 0 ? (
                      <div className="relative group">
                        <button className="text-blue-600 underline hover:text-blue-800">
                          View Documents ▼
                        </button>
                        <div className="absolute hidden group-hover:block bg-white shadow-lg rounded-md p-2 z-10">
                          {project.documents_path.files.pdfs.map((pdf, index) => (
                            <a 
                              key={index}
                              href={pdf.url} 
                              target="_blank" 
                              rel="noopener noreferrer" 
                              className="block whitespace-nowrap text-blue-600 hover:text-blue-800 text-sm py-1 px-2"
                            >
                              Document {index + 1}
                            </a>
                          ))}
                        </div>
                      </div>
                    ) : (
                      'N/A'
                    )}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

      </div>
    );
  };

  // Project Documents Content Component
  const ProjectDocumentsContent = ({ documents, loading, error, onRefresh }) => {
    const handleDownload = async (doc) => {
      try {
        const fileUrl = doc.url;
        if (!fileUrl) {
          alert('No download URL available for this document');
          return;
        }

        const response = await fetch(fileUrl);
        const blob = await response.blob();
        const link = document.createElement("a");
        link.href = URL.createObjectURL(blob);
        link.download = doc.name || "document";
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(link.href);
      } catch (error) {
        console.error("Error downloading document:", error);
        alert("Failed to download document. Please try again.");
      }
    };

    const handleView = (doc) => {
      const fileUrl = doc.url;
      if (!fileUrl) {
        alert('No view URL available for this document');
        return;
      }
      window.open(fileUrl, "_blank");
    };

    const getFileIcon = (fileName) => {
      if (!fileName) return "ri-file-line";
      const extension = fileName.split(".").pop()?.toLowerCase();
      switch (extension) {
        case "pdf": return "ri-file-pdf-line";
        case "doc": case "docx": return "ri-file-word-line";
        case "xls": case "xlsx": return "ri-file-excel-line";
        case "ppt": case "pptx": return "ri-file-ppt-line";
        case "jpg": case "jpeg": case "png": case "gif": case "bmp": case "svg": return "ri-image-line";
        case "txt": return "ri-file-text-line";
        case "zip": case "rar": case "7z": return "ri-file-zip-line";
        case "mp4": case "avi": case "mov": case "wmv": return "ri-video-line";
        case "mp3": case "wav": case "flac": return "ri-music-line";
        default: return "ri-file-line";
      }
    };

    const canViewInBrowser = (fileName) => {
      if (!fileName) return false;
      const extension = fileName.split(".").pop()?.toLowerCase();
      const viewableTypes = ["pdf", "jpg", "jpeg", "png", "gif", "bmp", "svg", "txt", "mp4", "mp3"];
      return viewableTypes.includes(extension);
    };

    if (loading) {
      return (
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading documents...</p>
          </div>
        </div>
      );
    }

    if (error) {
      return (
        <div className="text-center py-12">
          <div className="text-red-500 text-6xl mb-4">
            <i className="ri-error-warning-line"></i>
          </div>
          <h3 className="text-xl font-semibold text-gray-800 mb-2">Error Loading Documents</h3>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={onRefresh}
            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
          >
            Try Again
          </button>
        </div>
      );
    }

    if (documents.length === 0) {
      return (
        <div className="text-center py-12">
          <div className="text-gray-400 text-6xl mb-4">
            <i className="ri-file-line"></i>
          </div>
          <h3 className="text-xl font-semibold text-gray-800 mb-2">No Documents Found</h3>
          <p className="text-gray-600">No documents are available for this project yet.</p>
        </div>
      );
    }

    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between mb-4">
          <p className="text-gray-600">
            {documents.length} document{documents.length !== 1 ? "s" : ""} found
          </p>
          <button
            onClick={onRefresh}
            className="px-3 py-1 text-sm bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
          >
            <i className="ri-refresh-line mr-1"></i> Refresh
          </button>
        </div>

        <div className="grid gap-4">
          {documents.map((doc, index) => (
            <div
              key={doc.id || index}
              className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="text-2xl text-blue-500">
                    <i className={getFileIcon(doc.name)}></i>
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-medium text-gray-800 truncate">
                      {doc.name || `Document ${index + 1}`}
                    </h4>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => handleDownload(doc)}
                    className="px-3 py-1 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors text-sm flex items-center"
                  >
                    <i className="ri-download-line mr-1"></i> 
                  </button>
                  <button
                    onClick={() => handleView(doc)}
                    className="px-3 py-1 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors text-sm flex items-center"
                    title={canViewInBrowser(doc.name) ? "View in browser" : "Download to view"}
                  >
                    <i className={canViewInBrowser(doc.name) ? "ri-eye-line" : "ri-eye-line"}></i>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  // Project Invoices Content Component
  const ProjectInvoicesContent = ({ invoices, loading, error, onRefresh }) => {
    const getInvoiceStatusText = (status) => {
      switch (status) {
        case 1: return 'Active';
        case 0: return 'Inactive';
        default: return 'Unknown';
      }
    };

    const getInvoiceStatusColor = (status) => {
      switch (status) {
        case 1: return 'text-green-600 bg-green-100';
        case 0: return 'text-red-600 bg-red-100';
        default: return 'text-gray-600 bg-gray-100';
      }
    };

    const formatCurrency = (amount) => {
      if (amount == null) return 'N/A';
      return `₹${Number(amount).toLocaleString()}`;
    };

    const formatDate = (dateString) => {
      if (!dateString) return 'N/A';
      return new Date(dateString).toLocaleDateString('en-IN', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });
    };

    if (loading) {
      return (
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading invoices...</p>
          </div>
        </div>
      );
    }

    if (error) {
      return (
        <div className="text-center py-12">
          <div className="text-red-500 text-6xl mb-4">
            <i className="ri-error-warning-line"></i>
          </div>
          <h3 className="text-xl font-semibold text-gray-800 mb-2">Error Loading Invoices</h3>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={onRefresh}
            className="px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors"
          >
            Try Again
          </button>
        </div>
      );
    }

    if (invoices.length === 0) {
      return (
        <div className="text-center py-12">
          <div className="text-gray-400 text-6xl mb-4">
            <i className="ri-file-list-3-line"></i>
          </div>
          <h3 className="text-xl font-semibold text-gray-800 mb-2">No Invoices Found</h3>
          <p className="text-gray-600">No invoices are available for this project yet.</p>
        </div>
      );
    }

    return (
      <div className="space-y-6">
        {/* Summary Card */}
        <div className="bg-gradient-to-r from-orange-50 to-orange-100 rounded-xl p-6 border border-orange-200">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold text-gray-800 flex items-center">
              <i className="ri-bar-chart-line mr-2 text-orange-600"></i>
              Invoice Summary
            </h3>
            <button
              onClick={onRefresh}
              className="px-3 py-1 text-sm bg-white hover:bg-gray-50 rounded-lg transition-colors border border-orange-200"
            >
              <i className="ri-refresh-line mr-1"></i> Refresh
            </button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-600">{invoices.length}</div>
              <div className="text-sm text-gray-600">Total Invoices</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">
                {invoices.filter(inv => inv.inv_status === 1).length}
              </div>
              <div className="text-sm text-gray-600">Active Invoices</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">
                {formatCurrency(invoices.reduce((sum, inv) => sum + (inv.wkly_cost_amt || 0), 0))}
              </div>
              <div className="text-sm text-gray-600">Total Amount</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">
                {formatCurrency(invoices.reduce((sum, inv) => sum + (inv.pen_amt || 0), 0))}
              </div>
              <div className="text-sm text-gray-600">Total Penalties</div>
            </div>
          </div>
        </div>

        {/* Invoices List */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-800 flex items-center">
            <i className="ri-list-check mr-2"></i>
            Invoice Details ({invoices.length})
          </h3>
          
          {invoices.map((invoice, index) => (
            <div
              key={invoice.id || index}
              className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow"
            >
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h4 className="text-lg font-semibold text-gray-800 flex items-center">
                    <i className="ri-file-text-line mr-2 text-orange-500"></i>
                    Invoice #{invoice.id} - Week {invoice.wk_no}
                  </h4>
                  <p className="text-gray-600 mt-1">{invoice.project_name}</p>
                </div>
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${getInvoiceStatusColor(invoice.inv_status)}`}>
                  {getInvoiceStatusText(invoice.inv_status)}
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {/* Financial Details */}
                <div className="space-y-3">
                  <h5 className="font-semibold text-gray-700 border-b pb-1 flex items-center">
                    <i className="ri-money-dollar-circle-line mr-1 text-green-500"></i>
                    Financial Details
                  </h5>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Weekly Cost %:</span>
                      <span className="font-medium">{invoice.wkly_cost_pct}%</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Weekly Amount:</span>
                      <span className="font-medium">{formatCurrency(invoice.wkly_cost_amt)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Penalty Amount:</span>
                      <span className="font-medium text-red-600">{formatCurrency(invoice.pen_amt)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Actual Amount:</span>
                      <span className="font-medium">{formatCurrency(invoice.amt_act)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Total with Tax:</span>
                      <span className="font-medium text-blue-600">{formatCurrency(invoice.total_with_tax)}</span>
                    </div>
                  </div>
                </div>

                {/* Tax Details */}
                <div className="space-y-3">
                  <h5 className="font-semibold text-gray-700 border-b pb-1 flex items-center">
                    <i className="ri-percent-line mr-1 text-purple-500"></i>
                    Tax Details
                  </h5>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">GST Central %:</span>
                      <span className="font-medium">{invoice.gst_cen_pct}%</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">GST State %:</span>
                      <span className="font-medium">{invoice.gst_sta_pct}%</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Total GST:</span>
                      <span className="font-medium">{(invoice.gst_cen_pct || 0) + (invoice.gst_sta_pct || 0)}%</span>
                    </div>
                  </div>
                </div>

                {/* Other Details */}
                <div className="space-y-3">
                  <h5 className="font-semibold text-gray-700 border-b pb-1 flex items-center">
                    <i className="ri-information-line mr-1 text-orange-500"></i>
                    Other Details
                  </h5>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Receiver Cat ID:</span>
                      <span className="font-medium">{invoice.rcvr_cat_id}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Payer Cat ID:</span>
                      <span className="font-medium">{invoice.pyr_cat_id}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Due Date:</span>
                      <span className="font-medium">{formatDate(invoice.pymt_due_date)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Payment Date:</span>
                      <span className="font-medium">{formatDate(invoice.pymt_act_date)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Invoice Info:</span>
                      <span className="font-medium">{invoice.inv_info || 'N/A'}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="flex-1 w-full h-full">
      {/* Header */}
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
          className="py-2 px-3 rounded-md bg-red-500 text-white hover:bg-red-600 transition-colors text-sm font-medium"
          onClick={() => {
            setShowProjectDeleteForm(true);
            setDeleteProjectId(null);
          }}
        >
          <i className="ri-delete-bin-line mr-1"></i> Delete
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
                className="bg-white rounded-xl shadow-lg p-4 cursor-pointer transition-all duration-300 border border-gray-100 flex flex-col gap-4 min-h-[280px] border border-gray-300"
                onClick={() => handleProjectSelect(project)}
              >
                {/* Basic Info (Always Visible) */}
                <div className="text-center flex-1 flex flex-col justify-center">
                  <div className="font-bold text-xl text-gray-800 mb-3">{project.customer_name}</div>
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
                <div className="grid grid-cols-2 gap-2 mt-4">
                  <button
                    className="py-2 px-3 rounded-lg bg-blue-500 text-white hover:bg-blue-600 transition-colors text-sm font-medium"
                    onClick={(e) => { e.stopPropagation(); handleProjectSelect(project); }}
                  >
                    <i className="ri-folder-open-line mr-1"></i> Tasks
                  </button>
                  <button
                    className="py-2 px-3 rounded-lg bg-green-500 text-white hover:bg-green-600 transition-colors text-sm font-medium"
                    onClick={(e) => { e.stopPropagation(); handleDocumentsClick(project); }}
                  >
                    <i className="ri-file-text-line mr-1"></i> Documents
                  </button>
                  <button
                    className="py-2 px-3 rounded-lg bg-purple-500 text-white hover:bg-purple-600 transition-colors text-sm font-medium"
                    onClick={(e) => { e.stopPropagation(); handlePaymentPlanClick(project); }}
                  >
                    <i className="ri-money-dollar-circle-line mr-1"></i> Payment Plan
                  </button>
                  <button
                    className="py-2 px-3 rounded-lg bg-orange-500 text-white hover:bg-orange-600 transition-colors text-sm font-medium"
                    onClick={(e) => { e.stopPropagation(); handleInvoiceClick(project); }}
                  >
                    <i className="ri-file-list-3-line mr-1"></i> Invoices
                  </button>
                  <button
                    className="py-2 px-3 rounded-lg bg-gray-500 text-white hover:bg-gray-600 transition-colors text-sm font-medium col-span-2"
                    onClick={(e) => { e.stopPropagation(); handleDetailsClick(project); }}
                  >
                    <i className="ri-information-line mr-1"></i> Details
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

      {/* Payment Plan View */}
      {showPaymentPlan && selectedProjectForPaymentPlan && (
        <PaymentPlanView
          project={selectedProjectForPaymentPlan}
          paymentPlans={paymentPlans}
          formatShortDate={formatShortDate}
          getStatusColor={getStatusColor}
          onClose={closePaymentPlan}
        />
      )}


      {/* Expanded View - Details, Documents, or Invoices */}
      {expandedProject && (
        <div className="px-8 mb-8">
          <div className="bg-white rounded-xl shadow-lg border border-gray-200">
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <div>
                <h2 className="text-2xl font-bold text-gray-800">
                  {expandedView === 'details' ? 'Project Details' : 
                   expandedView === 'documents' ? 'Project Documents' : 'Project Invoices'}
                </h2>
                <p className="text-gray-600 mt-1">
                  {expandedProject.project_name || `Project #${expandedProject.id}`}
                </p>
              </div>
              <div className="flex items-center gap-2">
                {expandedView === 'details' && (
                  <button
                    className="py-2 px-3 rounded-md bg-green-500 text-white hover:bg-green-600 text-sm font-medium"
                    onClick={() => handleEdit(expandedProject, 'project')}
                  >
                    <i className="ri-edit-line mr-1"></i> Edit
                  </button>
                )}
                <button
                  onClick={() => {
                    setExpandedProject(null);
                    setExpandedView(null);
                  }}
                  className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                  aria-label="Close"
                >
                  <i className="ri-close-line text-2xl text-gray-500"></i>
                </button>
              </div>
            </div>

            {/* Content */}
            <div className="p-6">
              {expandedView === 'details' ? (
                <ProjectDetailsContent 
                  project={expandedProject}
                  getNameById={getNameById}
                  formatDate={formatDate}
                  formatShortDate={formatShortDate}
                  getStatusColor={getStatusColor}
                />
              ) : expandedView === 'documents' ? (
                <ProjectDocumentsContent
                  documents={documents}
                  loading={documentsLoading}
                  error={documentsError}
                  onRefresh={() => fetchDocuments(expandedProject)}
                />
              ) : (
                <ProjectInvoicesContent
                  invoices={invoices}
                  loading={invoicesLoading}
                  error={invoicesError}
                  onRefresh={() => fetchInvoices(expandedProject)}
                />
              )}
            </div>
          </div>
        </div>
      )}

      {/* Project Delete Form Modal */}
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

            <div className="flex justify-end gap-3">
              <button
                className="py-2 px-6 bg-gray-300 rounded-lg"
                onClick={() => {
                  setShowProjectDeleteForm(false);
                  setDeleteProjectId(null);
                }}
              >
                Cancel
              </button>
              <button
                disabled={!deleteProjectId}
                className={`py-2 px-6 rounded-lg text-white font-medium ${
                  deleteProjectId
                    ? "bg-red-600 hover:bg-red-700"
                    : "bg-red-400 cursor-not-allowed"
                }`}
                onClick={async () => {
                  if (!deleteProjectId) return;
                  try {
                    const res = await fetch(
                      `${import.meta.env.VITE_API_URL}/project/deletestudioproject?id=${deleteProjectId}`,
                      { method: "DELETE" }
                    );
                    if (res.ok) {
                      setProjects((prev) =>
                        prev.filter((p) => p.id.toString() !== deleteProjectId)
                      );
                      setShowProjectDeleteForm(false);
                      setDeleteProjectId(null);
                    } else {
                      alert("Failed to delete project.");
                    }
                  } catch {
                    alert("Error deleting project.");
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
  );
};

export default ProjectsView;