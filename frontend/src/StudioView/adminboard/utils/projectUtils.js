// Helper functions to get names from IDs
export const getNameById = (id, siteManagers) => {
  if (!id) return 'N/A';
  const mgr = siteManagers.find(s => s.user_id === id || s.id === id);
  return mgr ? mgr.user_name : `ID: ${id}`;
};

export const getVendorNameById = (id, vendors) => {
  if (!id) return 'N/A';
  const vendor = vendors.find(v => v.id === id || v.ven_user_id === id);
  return vendor ? vendor.vendor_user_name || vendor.vendor_name : `ID: ${id}`;
};

export const getCustomerNameById = (id, users) => {
  if (!id) return 'N/A';
  const customer = users.find((u) => u.id === id || u.user_id === id);
  return customer?.user_name || `ID: ${id}`;
};

// Function to get total weeks from selected project
export const getTotalWeeksFromProject = (selectedProject) => {
  if (!selectedProject) return 0;
  
  // Try different possible field names for total weeks
  const totalWeeks = selectedProject.weeks_planned || 
                    selectedProject.weeks_total || 
                    selectedProject.no_of_weeks || 
                    selectedProject.total_weeks || 
                    0;
  
  return parseInt(totalWeeks) || 0;
};

// Function to generate week options for dropdown
export const generateWeekOptions = (totalWeeks) => {
  const options = [];
  
  for (let i = 1; i <= totalWeeks; i++) {
    options.push({
      key: i,
      value: i,
      label: `Week ${i}`
    });
  }
  
  return options;
};

// Function to categorize files by extension
export const categorizeFiles = (files) => {
  const categorized = {
    images: [],
    videos: []
  };
  
  files.forEach(file => {
    const extension = file.name.split('.').pop().toLowerCase();
    const imageExtensions = ['jpg', 'jpeg', 'png', 'gif', 'bmp', 'webp'];
    const videoExtensions = ['mp4', 'avi', 'mov', 'wmv', 'flv', 'webm', 'mkv'];
    
    if (imageExtensions.includes(extension)) {
      categorized.images.push(file);
    } else if (videoExtensions.includes(extension)) {
      categorized.videos.push(file);
    }
  });
  
  return categorized;
};

// Function to get only changed values
export const getChangedValues = (currentValues, originalValues) => {
  const changes = { id: currentValues.id };
  Object.keys(currentValues).forEach(key => {
    if (key !== 'id' && currentValues[key] !== originalValues[key]) {
      changes[key] = currentValues[key];
    }
  });
  return changes;
};

// Build key-value payload for API
export const buildKeyValuePayload = (data, rootKey) => {
  const entries = Object.entries(data)
    .filter(([_, v]) => v !== undefined)
    .map(([k, v]) => ({ key: k, value: v }));
  return { [rootKey]: entries };
};
