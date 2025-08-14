

const moduleDefaults = {
  invoices: {
    configKey: "invoices_info",
    jsonfilename: "rooms_info.json",
    redisKey: "invoices_info"
  },
  receipts: {
    configKey: "receipts_info",
    jsonfilename: "receipts_info.json",
    redisKey: "receipts_records"
  },
  testimonials: {
    configKey: "testimonial_info",
    jsonfilename: "testimonial_info.json",
    redisKey: "testimonial_records"
  },
  studio_main_tasks: {
    configKey: "studio_main_tasks_info",
    jsonfilename: "rooms_info.json",
    redisKey: "studio_main_tasks_records"
  },
  studiouser_payments_info: {
    configKey: "studiouser_payments_info",
    jsonfilename: "rooms_info.json",
    redisKey: "studio_payments_records"
  },
  studio_projects_info: {
    configKey: "studio_projects_info",
    jsonfilename: "rooms_info.json",
    redisKey: "studio_projects_records"
},
regions_info: {
    configKey: "regions_info",
    jsonfilename: "rooms_info.json",
    redisKey: "regions_info"
},
studio_sub_tasks_info: {
    configKey: "studio_sub_tasks_info",
    jsonfilename: "rooms_info.json",
    redisKey: "studio_sub_tasks_records"
},
studio_user_payment_plan_info: {
    configKey: "studio_user_payment_plan_info",
    jsonfilename: "rooms_info.json",
    redisKey: "studio_user_payment_plan_records"
},
studio_user_payment_plan: {
    configKey: "studio_user_payment_plan_info",
    jsonfilename: "rooms_info.json",
    redisKey: "studio_user_payment_plan_records"
}
,
studio_vendors_info: {
    configKey: "studio_vendors_info",
    jsonfilename: "rooms_info.json",
    redisKey: "vendor_records"
},
studio_vendor_payments_info: {
    configKey: "studio_vendor_payments_info",
    jsonfilename: "rooms_info.json",
    redisKey: "studio_vendor_payments_cache"
}
}
function generateRequestBody(moduleName, overrides = {}) {
  const module = moduleDefaults[moduleName];
  if (!module) throw new Error(`Module '${moduleName}' not defined in moduleDefaults.`);

  return {
    ...module,
    ...overrides
  };
}

module.exports = {
  generateRequestBody
};
