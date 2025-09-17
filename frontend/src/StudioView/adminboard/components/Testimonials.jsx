import React, { useEffect, useState } from 'react';
import Modal from './Modal';

function Testimonials() {
  const [testimonials, setTestimonials] = useState([]);
  const [modalType, setModalType] = useState(null); // 'edit' or 'delete'
  const [selectedTestimonial, setSelectedTestimonial] = useState(null);
  const [editForm, setEditForm] = useState({});

  useEffect(() => {
    fetch(`${import.meta.env.VITE_API_URL}/test/getAllTestimonialRecords`)
      .then((res) => res.json())
      .then((data) => {
        // Use data.result for testimonials
        const result = data.result || [];
        setTestimonials(Array.isArray(result) ? result : []);
      })
      .catch(() => setTestimonials([]));
  }, []);

  const formatDate = (dateStr) => {
    if (!dateStr) return '-';
    const d = new Date(dateStr);
    return d.toLocaleDateString() + ' ' + d.toLocaleTimeString();
  };

  // Handle edit button
  const handleEdit = (t) => {
    setSelectedTestimonial(t);
    setEditForm(t);
    setModalType('edit');
  };

  // Handle delete button
  const handleDelete = (t) => {
    setSelectedTestimonial(t);
    setModalType('delete');
  };

  // Handle edit form change
  const handleEditFormChange = (e) => {
    const { name, value } = e.target;
    setEditForm(prev => ({ ...prev, [name]: value }));
  };

  // Handle edit submit (placeholder)
  const handleEditSubmit = (e) => {
    e.preventDefault();
    // TODO: Call API to update testimonial
    setModalType(null);
    setSelectedTestimonial(null);
  };

  // Handle delete confirm (placeholder)
  const handleDeleteConfirm = () => {
    // TODO: Call API to delete testimonial
    setModalType(null);
    setSelectedTestimonial(null);
  };

  return (
    <div className="flex-1 w-full h-full">
      <div className="flex justify-between items-center mb-8 px-8 pt-8">
        <h2 className="text-3xl font-bold">Testimonials</h2>
      </div>
      <div className="bg-white rounded-xl shadow p-0 overflow-x-auto mx-8">
        <table className="w-full table-auto">
          <thead>
            <tr className="bg-[#181f3a] text-white rounded-t-xl">
              <th className="p-4 text-left font-semibold rounded-tl-xl text-lg">Review ID</th>
              <th className="p-4 text-left font-semibold text-lg">UserName</th>
              <th className="p-4 text-left font-semibold text-lg">Display Name</th>
              <th className="p-4 text-left font-semibold text-lg">Rating</th>
              <th className="p-4 text-left font-semibold text-lg">Review</th>
              <th className="p-4 text-left font-semibold text-lg">City</th>
              <th className="p-4 text-left font-semibold text-lg">Builder</th>
              <th className="p-4 text-left font-semibold text-lg">Community</th>
              <th className="p-4 text-left font-semibold text-lg">Date</th>
              <th className="p-4 text-left font-semibold text-lg">Image</th>
              <th className="p-4 text-left font-semibold text-lg">Status</th>
              <th className="p-4 text-left font-semibold rounded-tr-xl text-lg">Actions</th>
            </tr>
          </thead>
          <tbody>
            {testimonials.map((t, idx) => (
              <tr
                key={t.id}
                className={
                  "border-b last:border-b-0" +
                  (idx % 2 === 0 ? " bg-white" : " bg-gray-50")
                }
              >
                <td className="p-4 text-base">{t.id}</td>
                <td className="p-4 text-base">{t.user_name}</td>
                <td className="p-4 text-base">{t.name}</td>
                <td className="p-4 text-base">{t.rating}</td>
                <td className="p-4 text-base">{t.description}</td>
                <td className="p-4 text-base">{t.city_name}</td>
                <td className="p-4 text-base">{t.builder_name}</td>
                <td className="p-4 text-base">{t.community_name}</td>
                <td className="p-4 text-base">{formatDate(t.testimonial_date)}</td>
                <td className="p-4 text-base">
                  {t.image_data ? (
                    <a href={t.image_data} target="_blank" rel="noopener noreferrer" className="text-blue-600 underline">View</a>
                  ) : (
                    '-')
                  }
                </td>
                <td className="p-4 text-base">{t.current_status === 1 ? 'Active' : 'Inactive'}</td>
                <td className="p-4">
                  <div className="flex gap-2">
                    <button
                      className="p-2 rounded-md bg-green-500 text-white hover:scale-110 transition-transform"
                      title="Save/Edit"
                      onClick={() => handleEdit(t)}
                    >
                      <i className="ri-save-line"></i>
                    </button>
                    <button
                      className="p-2 rounded-md bg-red-500 text-white hover:scale-110 transition-transform"
                      title="Delete"
                      onClick={() => handleDelete(t)}
                    >
                      <i className="ri-delete-bin-line"></i>
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {/* Edit Modal */}
      {modalType === 'edit' && selectedTestimonial && (
        <Modal title="Edit Testimonial" onClose={() => setModalType(null)}>
          <form onSubmit={handleEditSubmit} className="space-y-4">
            {Object.keys(editForm).map((key) => (
              key !== 'id' && (
                <div key={key}>
                  <label className="block mb-1 font-semibold capitalize">{key.replace('_', ' ')}</label>
                  <input
                    className="w-full border rounded-lg p-2"
                    type="text"
                    name={key}
                    value={editForm[key]}
                    onChange={handleEditFormChange}
                  />
                </div>
              )
            ))}
            <button
              type="submit"
              className="w-full bg-blue-600 text-white py-2 rounded-lg font-semibold hover:bg-blue-700 transition mt-2"
            >
              Save Changes
            </button>
          </form>
        </Modal>
      )}
      {/* Delete Modal */}
      {modalType === 'delete' && selectedTestimonial && (
        <Modal title="Delete Testimonial" onClose={() => setModalType(null)} width="max-w-md">
          <div className="text-center mb-6">Are you sure you want to delete testimonial <span className="font-bold">{selectedTestimonial.id}</span>?</div>
          <div className="flex justify-center gap-4">
            <button
              className="bg-gray-300 text-gray-800 px-4 py-2 rounded-lg font-semibold hover:bg-gray-400 transition"
              onClick={() => setModalType(null)}
            >
              Cancel
            </button>
            <button
              className="bg-red-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-red-700 transition"
              onClick={handleDeleteConfirm}
            >
              Delete
            </button>
          </div>
        </Modal>
      )}
    </div>
  );
}

export default Testimonials; 




{/* <div className="bg-white rounded-xl shadow-lg p-3 border border-gray-200">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold text-gray-800">Weekly Payment Plan</h3>
              </div>
              
              <div className="space-y-2 text-sm">
                {(() => {
                  const projectId = (hoveredProject || lastHoveredProject)?.id;
                  const plans = paymentPlans
                    .filter(p => p.project_id?.toString() === projectId?.toString())
                    .sort((a, b) => (a.week_no ?? 0) - (b.week_no ?? 0));
                  
                  if(!plans.length) {
                    const project = hoveredProject || lastHoveredProject;

                    if (!project) {
                      return <div className="text-gray-500">No weekly payment plan available.</div>;
                    }

                    const weeks =
                      project.no_of_weeks ||
                      project.weeks_total ||
                      project.weeks_planned ||
                      0;

                    const signupPct = parseFloat(
                      (project.signup_percentage || "0").toString().replace("%", "")
                    );

                    const planProject = {
                      no_of_weeks: weeks > 0 ? weeks : 1, // default to 1 to avoid breaking distribution
                      project_id: project.id,
                      cust_id: project.cust_id,
                      signup_percentage: isNaN(signupPct) ? 0 : signupPct,
                      signup_date: project.signup_date,
                    };

                    return (
                      <div className="space-y-2">
                        <div className="text-gray-500">
                          No weekly payment plan available. Create one:
                        </div>
                        <ProjectWeekDistribution project={planProject} />
                      </div>
                    );
                  } */}


