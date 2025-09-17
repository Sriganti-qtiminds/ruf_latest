

import React, { useState, useEffect } from "react";
import useAppStore from "../../../../store/appstore"; 
import SearchableDropdown from "../../../../UserView/components/UserLandingView/SearchableDropdown"; 
import axios from "axios";
import { API_BASE, apiPrefixes } from "../../../../config/apiPath";
import UserPaymentplan from "./UserPaymentplan" 

const API_URL = `${API_BASE}/${apiPrefixes.project}/addstudioproject`;

export default function AddProject() {
  const { users, siteManagers, fetchUsersAndSiteManagers } = useAppStore();

  useEffect(() => {
     fetchUsersAndSiteManagers();
  }, []);

  const [form, setForm] = useState({
    project_name: "",
    site_mgr_id: "",
    budget_cat: "",
    cust_id: "",
    cust_flat: "",
    cust_community: "",
    cust_address: "",
    total_cost: "",
    total_paid: "",
    total_balance: "",
    signup_date: "",
    signup_percentage: "",
    weeks_planned: "",
    weeks_buffer: "",
    weeks_total: "",
    tnt_start_date: "",
    est_end_date: "",
    act_end_date: "",
    current_status: "",
    documents_path: "",
  });

  const [pdfs, setPdfs] = useState([]);
  const [createdProject, setCreatedProject] = useState(null); // state for created project
  const [showPlanForm, setShowPlanForm] = useState(false);

  // Auto-calculate weeks_total, total_balance, est_end_date
  useEffect(() => {
    const total_balance =
      (parseFloat(form.total_cost) || 0) - (parseFloat(form.total_paid) || 0);

    const weeks_total =
      (parseInt(form.weeks_planned) || 0) + (parseInt(form.weeks_buffer) || 0);

    let est_end_date = "";
    if (form.tnt_start_date && weeks_total > 0) {
      const startDate = new Date(form.tnt_start_date);
      const endDate = new Date(startDate);
      endDate.setDate(startDate.getDate() + weeks_total * 7);
      est_end_date = endDate.toISOString().split("T")[0]; // format YYYY-MM-DD
    }

    setForm((prev) => ({
      ...prev,
      total_balance,
      weeks_total,
      est_end_date,
    }));
  }, [form.total_cost, form.total_paid, form.weeks_planned, form.weeks_buffer, form.tnt_start_date]);

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files).slice(0, 5);
    setPdfs(files);
  };

  const formatDateForApi = (date) => {
    if (!date) return null; // send null instead of ""
    return `${date} 00:00:00`;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      // format dates and numbers
      const formattedForm = {
        ...form,
        budget_cat: parseInt(form.budget_cat) || 0,
        current_status: parseInt(form.current_status) || 0,
        total_cost: parseFloat(form.total_cost) || 0,
        total_paid: parseFloat(form.total_paid) || 0,
        total_balance: parseFloat(form.total_balance) || 0,
        weeks_planned: parseInt(form.weeks_planned) || 0,
        weeks_buffer: parseInt(form.weeks_buffer) || 0,
        weeks_total: parseInt(form.weeks_total) || 0,
        signup_percentage: parseFloat(form.signup_percentage) || 0,
        signup_date: formatDateForApi(form.signup_date),
        tnt_start_date: formatDateForApi(form.tnt_start_date),
        est_end_date: formatDateForApi(form.est_end_date),
        act_end_date: formatDateForApi(form.act_end_date),
      };

      // create correct payload (array of key-value pairs)
      const payload = Object.entries(formattedForm).map(([key, value]) => ({ key, value }));
      const formData = new FormData();
      formData.append("projectData", JSON.stringify(payload));
      pdfs.forEach((file) => formData.append("pdfs", file));

      const response = await axios.post(API_URL, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      // Extract project ID from response if available
      let projectId = null;
      if (response.data && response.data.projectId) {
        projectId = response.data.projectId;
      }

      alert("Project added successfully! response: " + JSON.stringify(response.data.projectId));

      // Set created project data to display PaymentPlanForm
      if (projectId) {
        const newProject = {
          project_id: projectId,
          no_of_weeks: parseInt(form.weeks_total) || 0,
          cust_id: form.cust_id,
          signup_percentage: parseFloat(form.signup_percentage) || 0,
          signup_date: form.signup_date,
          tnt_start_date: form.tnt_start_date,
          week_no:form.weeks_total
        };
        setCreatedProject(newProject);
        setShowPlanForm(false);
      }

      // reset form...
      setForm({
        project_name: "",
        site_mgr_id: "",
        budget_cat: "",
        cust_id: "",
        cust_flat: "",
        cust_community: "",
        cust_address: "",
        total_cost: "",
        total_paid: "",
        total_balance: "",
        signup_date: "",
        signup_percentage: "",
        weeks_planned: "",
        weeks_buffer: "",
        weeks_total: "",
        tnt_start_date: "",
        est_end_date: "",
        act_end_date: "",
        current_status: "",
        documents_path: "",
      });
      setPdfs([]);
      
    } catch (err) {
      console.error("Error submitting form:", err);
      alert("Failed to add project. Check console for details.");
    }
  };

  return (
    <div className="max-w-3xl mx-auto p-6">
      <h2 className="text-2xl font-bold mb-4">Add New Project</h2>
      {!createdProject && (  <div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* ...existing form fields... */}
        {/* Project Name */}
        <div>
          <label className="block mb-1 font-semibold">Project Name*</label>
          <input
            type="text"
            name="project_name"
            value={form.project_name}
            onChange={handleFormChange}
            className="w-full border rounded-lg p-2"
            required
          />
        </div>
        {/* Customer */}
        <SearchableDropdown
          options={users.map((u) => ({
            value: u.user_id,
            label: `${u.user_name} (${u.mobile_no})`,
          }))}
          value={form.cust_id}
          onChange={handleFormChange}
          placeholder="Select Customer"
          name="cust_id"
          displayKey="label"
          valueKey="value"
        />
        <div>
          <label className="block mb-1 font-semibold">Flat</label>
          <input
            type="text"
            name="cust_flat"
            value={form.cust_flat}
            onChange={handleFormChange}
            className="w-full border rounded-lg p-2"
          />
        </div>
        <div>
          <label className="block mb-1 font-semibold">Community</label>
          <input
            type="text"
            name="cust_community"
            value={form.cust_community}
            onChange={handleFormChange}
            className="w-full border rounded-lg p-2"
          />
        </div>
        <div>
          <label className="block mb-1 font-semibold">Address</label>
          <input
            type="text"
            name="cust_address"
            value={form.cust_address}
            onChange={handleFormChange}
            className="w-full border rounded-lg p-2"
          />
        </div>

        {/* Site Manager */}
        <SearchableDropdown
          options={siteManagers.map((s) => ({
            value: s.user_id,
            label: `${s.user_name} (${s.mobile_no})`,
          }))}
          value={form.site_mgr_id}
          onChange={handleFormChange}
          placeholder="Select Site Manager"
          name="site_mgr_id"
          displayKey="label"
          valueKey="value"
        />

        {/* Budget Category */}
        <div>
          <label className="block mb-1 font-semibold">Budget Category*</label>
          <select
            className="w-full border rounded-lg p-2"
            name="budget_cat"
            value={form.budget_cat}
            onChange={handleFormChange}
            required
          >
            <option value="">Select Category</option>
            <option value="1">Elegant</option>
            <option value="2">Luxury</option>
            <option value="3">Premium</option>
          </select>
        </div>

        {/* Current Status */}
        <div>
          <label className="block mb-1 font-semibold">Current Status*</label>
          <select
            className="w-full border rounded-lg p-2"
            name="current_status"
            value={form.current_status}
            onChange={handleFormChange}
            required
          >
            <option value="">Select Status</option>
            <option value="42">Planning</option>
            <option value="43">Pre-production</option>
            <option value="44">Production</option>
            <option value="45">Post-production</option>
            <option value="46">Completed</option>
          </select>
        </div>

        {/* Financials */}
        <div>
          <label className="block mb-1 font-semibold">Total Cost</label>
          <input
            type="number"
            name="total_cost"
            value={form.total_cost}
            onChange={handleFormChange}
            className="w-full border rounded-lg p-2"
          />
        </div>
        <div>
          <label className="block mb-1 font-semibold">Signup Percentage</label>
          <input
            type="number"
            name="signup_percentage"
            value={form.signup_percentage}
            onChange={handleFormChange}
            step="0.01"
            className="w-full border rounded-lg p-2"
          />
        </div>
        <div>
          <label className="block mb-1 font-semibold">Total Paid</label>
          <input
            type="number"
            name="total_paid"
            value={form.total_paid}
            onChange={handleFormChange}
            className="w-full border rounded-lg p-2"
          />
        </div>
        <div>
          <label className="block mb-1 font-semibold">Total Balance </label>
          <input
            type="number"
            name="total_balance"
            value={form.total_balance}
            readOnly
            className="w-full border rounded-lg p-2 bg-gray-100"
          />
        </div>

        {/* Weeks */}
        <div>
          <label className="block mb-1 font-semibold">Weeks Planned</label>
          <input
            type="number"
            name="weeks_planned"
            value={form.weeks_planned}
            onChange={handleFormChange}
            className="w-full border rounded-lg p-2"
          />
        </div>
        <div>
          <label className="block mb-1 font-semibold">Weeks Buffer</label>
          <input
            type="number"
            name="weeks_buffer"
            value={form.weeks_buffer}
            onChange={handleFormChange}
            className="w-full border rounded-lg p-2"
          />
        </div>
        <div>
          <label className="block mb-1 font-semibold">Weeks Total </label>
          <input
            type="number"
            name="weeks_total"
            value={form.weeks_total}
            readOnly
            className="w-full border rounded-lg p-2 bg-gray-100"
          />
        </div>

        {/* Dates */}
        <div>
          <label className="block mb-1 font-semibold">Signup Date</label>
          <input
            type="date"
            name="signup_date"
            value={form.signup_date}
            onChange={handleFormChange}
            className="w-full border rounded-lg p-2"
          />
        </div>        
        <div>
          <label className="block mb-1 font-semibold">TNT Start Date</label>
          <input
            type="date"
            name="tnt_start_date"
            value={form.tnt_start_date}
            onChange={handleFormChange}
            className="w-full border rounded-lg p-2"
          />
        </div>
        <div>
          <label className="block mb-1 font-semibold">Estimated End Date </label>
          <input
            type="date"
            name="est_end_date"
            value={form.est_end_date}
            readOnly
            className="w-full border rounded-lg p-2 bg-gray-100"
          />
        </div>

        {/* PDF Upload */}
        <div>
          <label className="block mb-1 font-semibold">Upload PDFs (max 5)</label>
          <input
            type="file"
            accept="application/pdf"
            multiple
            onChange={handleFileChange}
          />
        </div>

        <button
          type="submit"
          className="bg-blue-600 text-white px-4 py-2 rounded-lg"
        >
          Submit
        </button>
      </form>
      </div>)}


      {/* Conditionally render the weekly payment plan */}
      {createdProject && (
        <div className="mt-8 space-y-4">
          <h3 className="text-xl font-bold">Project created</h3>
          {!showPlanForm ? (
            <button
              className="px-4 py-2 rounded-lg bg-green-600 text-white hover:bg-green-700"
              onClick={() => setShowPlanForm(true)}
            >
              Create Weekly Payment Plan
            </button>
          ) : (
            <>
              <h3 className="text-xl font-bold">Weekly Payment Plan</h3>
              <UserPaymentplan project={createdProject} />
            </>
          )}
        </div>
      )}
    </div>
  );
}