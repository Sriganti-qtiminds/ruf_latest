import { API_BASE, apiPrefixes } from "../config/apiPath";
import { useRoleStore } from "../store/roleStore";

export const buildApiUrl = (endpoint, explicitRole = null, shared = false) => {
  if (shared) {
    const modified_url = `${API_BASE}${endpoint.startsWith("//") ? endpoint : `/${endpoint}`}`;
    console.log("Modified URL", modified_url);

    return modified_url;
  }

  // Get role from parameter or from store
  const role = explicitRole || useRoleStore.getState().userData.role;

  // Use prefix from apiPrefixes; if role key changed, this will automatically use new prefix
  const prefix = apiPrefixes[role] ?? "";

  return `${API_BASE}/${prefix}${endpoint.startsWith("/") ? endpoint : `/${endpoint}`}`;
};
