import React, { useState } from "react";
import { studioTailwindStyles } from '../../../utils/studioTailwindStyles';

const VendorCompleteTaskForm = ({ task, onSubmit, onCancel }) => {
  const [beforeImage, setBeforeImage] = useState(null);
  const [afterImage, setAfterImage] = useState(null);
  const [notes, setNotes] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!beforeImage || !afterImage || !notes.trim()) {
      // Note: showToast is called by parent component
      return;
    }
    onSubmit({
      images_before: URL.createObjectURL(beforeImage),
      images_after: URL.createObjectURL(afterImage),
      notes,
      completed_percent: 100,
      status: "completed",
    });
  };

  return (
    <div>
      <h3 className={studioTailwindStyles.heading_2}>Complete Task: {task.name}</h3>
      <form onSubmit={handleSubmit} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className={studioTailwindStyles.heading_3}>Before Image (File)</label>
          <input
            type="file"
            accept="image/*"
            onChange={(e) => setBeforeImage(e.target.files[0])}
            className="w-full p-2 rounded-lg bg-gray-200 dark:bg-gray-700 form-input focus:ring-2 focus:ring-accent mt-1"
            required
          />
        </div>
        <div>
          <label className={studioTailwindStyles.heading_3}>After Image (File)</label>
          <input
            type="file"
            accept="image/*"
            onChange={(e) => setAfterImage(e.target.files[0])}
            className="w-full p-2 rounded-lg bg-gray-200 dark:bg-gray-700 form-input focus:ring-2 focus:ring-accent mt-1"
            required
          />
        </div>
        <div className="col-span-full">
          <label className={studioTailwindStyles.heading_3}>Notes</label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            className="w-full p-2 rounded-lg bg-gray-200 dark:bg-gray-700 form-input focus:ring-2 focus:ring-accent mt-1"
            rows="4"
            required
          />
        </div>
        <div className="col-span-full mt-4 flex space-x-4">
          <button
            type="submit"
            className="neumorphic p-3 rounded-lg bg-secondary text-white w-full button-hover transition-transform"
          >
            Confirm Completion
          </button>
          <button
            type="button"
            onClick={onCancel}
            className="neumorphic p-3 rounded-lg bg-gray-500 text-white w-full button-hover transition-transform"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
};

export default VendorCompleteTaskForm;