// Approval status mapping
export const approvalStatuses = {
  0: 'Pending',
  1: 'On Going',
  3: 'Approved',
  4: 'Rejected'
};

// Status color mapping
export const getStatusColor = (status) => {
  switch (status) {
    case 1: return 'bg-green-100 text-green-800';
    case 0: return 'bg-yellow-100 text-yellow-800';
    case 2: return 'bg-red-100 text-red-800';
    default: return 'bg-gray-100 text-gray-800';
  }
};

// Date formatting utilities
export const formatDate = (dateStr) => {
  if (!dateStr) return '-';
  const d = new Date(dateStr);
  return d.toLocaleDateString() + ' ' + d.toLocaleTimeString();
};

export const formatShortDate = (dateStr) => {
  if (!dateStr) return '-';
  const d = new Date(dateStr);
  return d.toLocaleDateString();
};

// DateTime normalization
export const normalizeDateTime = (value) => {
  if (!value) return value;
  // If already contains a space, assume server-ready
  if (typeof value === 'string' && value.includes('T')) {
    return value.replace('T', ' ') + (value.length === 16 ? ':00' : '');
  }
  return value;
};
