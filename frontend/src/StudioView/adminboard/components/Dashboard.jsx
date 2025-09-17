import React, { useState, useEffect } from 'react';

// Utility to turn [{key, value}...] to object
function parseProjectData(dataArray) {
  return dataArray.reduce((obj, field) => {
    obj[field.key] = field.value;
    return obj;
  }, {});
}

function getStatusLabel(code) {
  switch (parseInt(code, 10)) {
    case 1: return 'Active';
    case 2: return 'Completed';
    case 3: return 'On Hold';
    default: return 'Unknown';
  }
}
function getStatusColor(code) {
  switch (parseInt(code, 10)) {
    case 1: return 'bg-green-100 text-green-800';
    case 2: return 'bg-blue-100 text-blue-800';
    case 3: return 'bg-yellow-100 text-yellow-800';
    default: return 'bg-gray-100 text-gray-800';
  }
}
function getProgressColor(current, total) {
  if (!total || Number(total) === 0) return 'bg-gray-300';
  const percentage = (Number(current) / Number(total)) * 100;
  if (percentage >= 80) return 'bg-green-500';
  if (percentage >= 60) return 'bg-yellow-500';
  if (percentage >= 40) return 'bg-orange-500';
  return 'bg-red-500';
}
function weeksBetween(startDate, endDate) {
  const msInWeek = 7 * 24 * 60 * 60 * 1000;
  const diffMs = endDate.getTime() - startDate.getTime();
  return Math.max(0, Math.floor(diffMs / msInWeek));
}

export default function Dashboard() {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/project/getAllstudioprojects`);
      if (!response.ok) {
        throw new Error('Failed to fetch projects');
      }
      const data = await response.json();
      
      // Handle the response format: {"success": true, "source": "db", "result": []}
      if (data.success && data.result) {
        setProjects(Array.isArray(data.result) ? data.result : []);
      } else {
        setProjects([]);
      }
    } catch (error) {
      console.error('Error fetching projects:', error);
      setError('Failed to load projects. Please try again.');
      setProjects([]);
    } finally {
      setLoading(false);
    }
  };

  
  const today = new Date();
  const startDate = new Date(today.getTime() - 14 * 24 * 60 * 60 * 1000); 

  // Filtering and searching
  const filteredProjects = projects
    .map(project => {
      const weeks_total = Number(project.weeks_total) || 0;
      const weeks_completed = weeksBetween(startDate, today);
      return {
        ...project,
        project_start_date: startDate,
        weeks_completed: Math.min(weeks_completed, weeks_total),
      };
    })
    .filter(project => {
      const statusLabel = getStatusLabel(project.current_status).toLowerCase();
      const matchesFilter =
        filter === 'all' ||
        (filter === 'active' && statusLabel === 'active') ||
        (filter === 'completed' && statusLabel === 'completed');
      const matchesSearch =
        (project.project_name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (project.cust_community || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (project.cust_flat || '').toLowerCase().includes(searchTerm.toLowerCase());
      return matchesFilter && matchesSearch;
    });

  // Summaries
  const totalProjects = filteredProjects.length;
  const activeProjects = filteredProjects.filter(p => getStatusLabel(p.current_status) === 'Active').length;
  const completedProjects = filteredProjects.filter(p => getStatusLabel(p.current_status) === 'Completed').length;
  const totalRevenue = filteredProjects.reduce((sum, p) => sum + Number(p.total_cost || 0), 0);
  const totalPaid = filteredProjects.reduce((sum, p) => sum + Number(p.total_paid || 0), 0);
  const totalBalance = filteredProjects.reduce((sum, p) => sum + Number(p.total_balance || 0), 0);
  const totalWeeklyAmount = filteredProjects.reduce(
    (sum, p) => sum + (p.weeks_total ? Number(p.total_cost) / Number(p.weeks_total) : 0),
    0
  );
  const avgWeeklyAmount = filteredProjects.length > 0 ? totalWeeklyAmount / filteredProjects.length : 0;
  const totalBufferProjects = filteredProjects.filter(p => Number(p.weeks_buffer) > 0).length;
  const totalBufferWeeks = filteredProjects.reduce((sum, p) => sum + Number(p.weeks_buffer || 0), 0);
  const avgBuffer = filteredProjects.length > 0 ? totalBufferWeeks / filteredProjects.length : 0;

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#E07A5F]" />
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="mb-6 flex flex-col gap-2">
        <h1 className="text-2xl font-bold text-gray-800">Dashboard</h1>
        
        {/* Error Message */}
        {error && (
          <div className="p-3 bg-red-100 border border-red-400 text-red-700 rounded">
            {error}
          </div>
        )}
        
        <div className="flex flex-col md:flex-row gap-4">
          {/* Search Bar */}
          <div className="flex-1">
            <div className="relative">
              <input
                type="text"
                placeholder="Search by project, flat or community…"
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className="w-full pl-4 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#E07A5F]"
              />
            </div>
          </div>
          {/* Filters */}
          <div className="flex gap-2">
            {['all', 'active', 'completed'].map(f => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-4 py-2 rounded-lg font-medium ${
                  filter === f ? 'bg-[#E07A5F] text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                {f.charAt(0).toUpperCase() + f.slice(1)}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="bg-white p-4 rounded-lg shadow flex items-center">
          <div className="p-2 bg-blue-100 rounded-lg mr-3">
            <i className="ri-folder-line text-blue-600 text-xl" />
          </div>
          <div>
            <p className="text-sm text-gray-600">Projects</p>
            <p className="text-lg font-semibold text-gray-900">{totalProjects}</p>
            <p className="text-xs text-gray-500">{activeProjects} active, {completedProjects} completed</p>
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow flex items-center">
          <div className="p-2 bg-green-100 rounded-lg mr-3">
            <i className="ri-money-dollar-circle-line text-green-600 text-xl" />
          </div>
          <div>
            <p className="text-sm text-gray-600">Total Invoice</p>
            <p className="text-lg font-semibold text-gray-900">₹{totalRevenue.toLocaleString()}</p>
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow flex items-center">
          <div className="p-2 bg-yellow-100 rounded-lg mr-3">
            <i className="ri-check-line text-yellow-600 text-xl" />
          </div>
          <div>
            <p className="text-sm text-gray-600">Total Paid</p>
            <p className="text-lg font-semibold text-gray-900">₹{totalPaid.toLocaleString()}</p>
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow flex items-center">
          <div className="p-2 bg-red-100 rounded-lg mr-3">
            <i className="ri-time-line text-red-600 text-xl" />
          </div>
          <div>
            <p className="text-sm text-gray-600">Pending Amount</p>
            <p className="text-lg font-semibold text-gray-900">₹{totalBalance.toLocaleString()}</p>
          </div>
        </div>
      </div>

      {/* Projects Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Project</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Client/Flat</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Week Progress</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Payment Progress</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Buffer</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Timeline</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredProjects.length > 0 ? (
                filteredProjects.map((project, i) => {
                  const weeklyAmount = project.weeks_total
                    ? Math.round(Number(project.total_cost) / Number(project.weeks_total))
                    : 0;
                  return (
                    <tr key={i} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="font-semibold">{project.project_name}</span>
                        <div className="text-xs text-gray-400">{project.site_mgr_id && `Mgr ID: ${project.site_mgr_id}`}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        <div>
                          {(project.cust_flat && project.cust_community) &&
                            `${project.cust_flat}, ${project.cust_community}`}
                        </div>
                        <div className="text-xs text-gray-500">{project.cust_address || '—'}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-1 bg-gray-200 rounded-full h-2 mr-2">
                            <div
                              className={`h-2 rounded-full ${getProgressColor(project.weeks_completed, project.no_of_weeks)}`}
                              style={{ width: `${project.no_of_weeks ? (project.weeks_completed / project.no_of_weeks) * 100 : 0}%` }}
                            ></div>
                          </div>
                          <span className="text-sm text-gray-600">
                            {project.weeks_completed}/{project.no_of_weeks || '—'}
                          </span>
                        </div>
                        <div className="text-xs text-gray-500 mt-1">
                          Remaining weeks: {project.weeks_total-project.weeks_completed}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-1 bg-gray-200 rounded-full h-2 mr-2">
                            <div
                              className={`h-2 rounded-full ${getProgressColor(project.total_paid, project.total_cost)}`}
                              style={{
                                width: `${project.total_cost && project.total_paid
                                  ? (Number(project.total_paid) / Number(project.total_cost)) * 100
                                  : 0}%`
                              }}
                            />
                          </div>
                          <span className="text-sm text-gray-600">
                            ₹{Number(project.total_paid).toLocaleString()}
                          </span>
                        </div>
                        <div className="text-xs text-gray-500 mt-1">
                          ₹{Number(project.total_balance).toLocaleString()} pending
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`text-sm font-medium text-green-700 `}>{project.weeks_buffer || 0}</span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(project.current_status)}`}>
                          {getStatusLabel(project.current_status)}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-xs">
                          Start: {project.project_start_date ? project.project_start_date.toLocaleDateString() : '—'}
                        </div>
                        <div className="text-xs">
                          Est. End: {project.est_end_date ? new Date(project.est_end_date).toLocaleDateString() : '—'}
                        </div>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={7} className="text-center py-8 text-gray-400">
                    {error ? 'Error loading projects' : 'No projects found.'}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
      
      {/* Statistics Section */}
       
      {/* Expanded Statistics */}
      <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">
            Weekly Payment Summary
          </h3>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-gray-600">Total Weekly (est):</span>
              <span className="font-medium">₹{Math.round(totalWeeklyAmount).toLocaleString()}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Average Weekly:</span>
              <span className="font-medium">₹{Math.round(avgWeeklyAmount).toLocaleString()}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Total Planned Weeks:</span>
              <span className="font-medium">{filteredProjects.reduce((acc, p) => acc + Number(p.weeks_planned || 0), 0)}</span>
            </div>
          </div>
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">
            Buffer Week Analysis
          </h3>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-gray-600">Projects with Buffer:</span>
              <span className="font-medium">{totalBufferProjects}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Total Buffer Weeks:</span>
              <span className="font-medium">{totalBufferWeeks}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Average Buffer (weeks):</span>
              <span className="font-medium">{avgBuffer.toFixed(1)}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
