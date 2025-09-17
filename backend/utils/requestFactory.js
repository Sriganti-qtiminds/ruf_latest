const moduleDefaults = {
  invoices: {
    configKey: "invoices_info",
    jsonfilename: "studio_info.json",
    redisKey: "invoices_info",
  },
  receipts: {
    configKey: "receipts_info",
    jsonfilename: "receipts_info.json",
    redisKey: "receipts_records",
  },
  testimonials: {
    configKey: "testimonial_info",
    jsonfilename: "testimonial_info.json",
    redisKey: "testimonial_records",
  },
  user_info: { 
  configKey: "user_info", 
  jsonfilename: "studio_info.json", 
  redisKey: "user_records", 
  },
  studio_main_tasks: {
  configKey: "studio_main_tasks_info",
  jsonfilename: "studio_info.json",
  redisKey: "studio_main_tasks_records",
  },
  studiouser_payments_info: {
  configKey: "studio_user_payments_info",
  jsonfilename: "studio_info.json",
  redisKey: "studio_payments_records",
  },
  studiouser_payments_infoweek: {
  configKey: "studio_user_payments_info_week",
  jsonfilename: "studio_info.json",
  redisKey: "studio_payments_info_week_records",
  },
  studio_projects_info: {
  configKey: "studio_projects_info",
  jsonfilename: "studio_info.json",
  redisKey: "studio_projects_info_r",
  },
  regions_info: {
  configKey: "regions_info",
  jsonfilename: "studio_info.json",
  redisKey: "regions_info",
  },
  studio_sub_tasks_info: {
  configKey: "studio_sub_tasks_info",
  jsonfilename: "studio_info.json",
  redisKey: "studio_sub_tasks_records",
  },
  studio_user_payment_plan_info: {
  configKey: "studio_user_payment_plan_info",
  jsonfilename: "studio_info.json",
  redisKey: "studio_user_payment_plan_info_records",
  },
  studio_vendors_info: {
  configKey: "studio_vendors_info",
  jsonfilename: "studio_info.json",
  redisKey: "vendor_records",
  },
  studio_vendor_payments_info: {
  configKey: "studio_vendor_payments_info",
  jsonfilename: "studio_info.json",
  redisKey: "studio_vendor_payments_cache",
  },
  studio_main_tasks_info_count: {
  configKey: "studio_main_tasks_info_count",
  jsonfilename: "studio_info.json",
  redisKey: "studio_main_tasks_records_cou",
  },
  studio_sub_tasks_info_count: {
  configKey: "studio_sub_tasks_info_count",
  jsonfilename: "studio_info.json",
  redisKey: "studio_sub_tasks_records",
  },  
};
function generateRequestBody(moduleName, overrides = {}) {
  const module = moduleDefaults[moduleName];
  if (!module)
    throw new Error(`Module '${moduleName}' not defined in moduleDefaults.`);

  return {
    ...module,
    ...overrides,
  };
}

module.exports = {
  generateRequestBody,
};
