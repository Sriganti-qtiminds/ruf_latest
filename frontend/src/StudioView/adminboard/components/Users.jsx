import React, { useEffect, useState } from 'react';
import Modal from './Modal';

function Users() {
  const [users, setUsers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  // Filter states
  const [nameFilter, setNameFilter] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  // Pagination
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalRecords: 0,
    limit: 50
  });

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        setIsLoading(true);
        const res = await fetch(`${import.meta.env.VITE_API_URL}/admin/adminUserManagement`);
        const data = await res.json();
        
        if (data.results) {
          // Map API response to our table format
          const mappedUsers = data.results.map(user => ({
            id: user.user_id,
            name: user.user_name || '-',
            mobile: user.mobile_no || '-',
            role: getRoleName(user.role_id),
            customerId: user.customer_id || '-'
          }));
          
          setUsers(mappedUsers);
          setPagination(data.pagination || {
            currentPage: 1,
            totalPages: 1,
            totalRecords: mappedUsers.length,
            limit: 50
          });
        }
      } catch (err) {
        setError('Failed to fetch users');
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchUsers();
  }, []);

  // Helper function to get role name from ID
  const getRoleName = (roleId) => {
    const roles = {
      1: 'Admin',
      2: 'User',
      3: 'Customer',
      6: 'Employee'
    };
    return roles[roleId] || `Role ${roleId}`;
  };

  // Get unique roles for filter dropdown
  const roleOptions = Array.from(new Set(users.map(u => u.role).filter(Boolean)));

  // Filtered users - only show role_id 2 (Users)
  const filteredUsers = users.filter(user => {
    const matchesName = nameFilter === '' || 
      user.name.toLowerCase().includes(nameFilter.toLowerCase());
    const matchesRole = roleFilter === '' || user.role === roleFilter;
    const isUserRole = user.role === 'User'; // Only show users with role "User"
    
    return matchesName && matchesRole && isUserRole;
  });

  if (isLoading) {
    return (
      <div className="flex-1 w-full h-full flex items-center justify-center">
        <div className="text-xl">Loading users...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex-1 w-full h-full flex items-center justify-center">
        <div className="text-xl text-red-500">{error}</div>
      </div>
    );
  }

  return (
    <div className="flex-1 w-full h-full">
      <div className="flex justify-between items-center mb-8 px-8 pt-8">
        <h2 className="text-3xl font-bold">Users</h2>
        <div className="text-sm text-gray-600">
          Showing {filteredUsers.length} of {pagination.totalRecords} records
        </div>
      </div>
      
      {/* Filter Bar */}
      <div className="flex flex-wrap gap-4 mb-4 px-8">
        <div>
          <label className="block text-sm font-semibold mb-1">Name</label>
          <input
            className="border rounded-lg p-2 min-w-[120px]"
            type="text"
            placeholder="Search by name"
            value={nameFilter}
            onChange={e => setNameFilter(e.target.value)}
          />
        </div>
      </div>
      
      {/* Users Table */}
      <div className="bg-white rounded-xl shadow p-0 overflow-x-auto mx-8">
        <table className="w-full table-auto">
          <thead>
            <tr className="bg-[#181f3a] text-white rounded-t-xl">
              <th className="p-4 text-left font-semibold rounded-tl-xl text-lg">Name</th>
              <th className="p-4 text-left font-semibold text-lg">Mobile</th>
              <th className="p-4 text-left font-semibold text-lg">Role</th>
              <th className="p-4 text-left font-semibold rounded-tr-xl text-lg">Customer ID</th>
            </tr>
          </thead>
          <tbody>
            {filteredUsers.length > 0 ? (
              filteredUsers.map((user, idx) => (
                <tr
                  key={user.id}
                  className={
                    "border-b last:border-b-0" +
                    (idx % 2 === 0 ? " bg-white" : " bg-gray-50")
                  }
                >
                  <td className="p-4 text-base">{user.name}</td>
                  <td className="p-4 text-base">{user.mobile}</td>
                  <td className="p-4 text-base">{user.role}</td>
                  <td className="p-4 text-base">{user.customerId}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="4" className="p-4 text-center text-base">
                  No users found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default Users; 