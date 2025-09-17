
import dayjs from "dayjs";

export function formatProjects(data) {
  if (!data?.result) return [];

  return data.result.map((item) => ({
    id: item.id,
    project_name: item.project_name || "N/A",
    cust_id:item.cust_id || "N/A",
    customer_name: item.customer_name || "N/A",
    flat: item.cust_flat || "N/A",
    community: item.cust_community || "N/A",
    address: item.cust_address || "N/A",
    total_cost: item.total_cost ?? 0,
    total_paid: item.total_paid ?? 0,
    balance: item.total_balance ?? 0,
    signup_percentage: item.signup_percentage ?? 0,
    status: item.current_status || "N/A",

    // formatted dates
    start_date: item.tnt_start_date
      ? dayjs(item.tnt_start_date).format("DD-MM-YYYY")
      : "N/A",
    est_end_date: item.est_end_date
      ? dayjs(item.est_end_date).format("DD-MM-YYYY")
      : "N/A",
    act_end_date: item.act_end_date
      ? dayjs(item.act_end_date).format("DD-MM-YYYY")
      : "N/A",
    signup_date: item.signuptime
      ? dayjs(item.signuptime).format("DD-MM-YYYY")
      : "N/A",
  }));
}
