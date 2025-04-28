import React from "react";
import {
  Chart as ChartJS,
  ArcElement, // Needed for pie charts
  Tooltip,
  Legend,
} from "chart.js";
import { Pie } from "react-chartjs-2";

// Register components with Chart.js
ChartJS.register(ArcElement, Tooltip, Legend);

const PieChart = () => {
  const data = {
    labels: ["New", "In Progress", "Resolved", "Cancelled"],
    datasets: [
      {
        data: [40, 20, 30, 10],
        backgroundColor: ["#4c51bf", "#68d391", "#ecc94b", "#e53e3e"],
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    cutout: "50%", // Creates a white circle in the middle by cutting out the center
    plugins: {
      tooltip: {
        backgroundColor: "white", // Customize tooltip background color
        bodyColor: "black", // Customize tooltip body color
      },
    },
  };

  return (
    <div className="bg-white shadow-lg p-4 rounded-lg w-full">
      <h3 className="font-bold text-xl mb-3">Request Analytics</h3>
      <div className="h-72">
        <Pie data={data} options={options} />
      </div>
    </div>
  );
};

export default PieChart;
