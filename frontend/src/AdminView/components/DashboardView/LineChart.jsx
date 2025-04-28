import React from "react";
import {
  Chart as ChartJS,
  CategoryScale, // Needed for the x-axis
  LinearScale, // Needed for the y-axis
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import { Line } from "react-chartjs-2";

// Register components with Chart.js
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

const LineChart = () => {
  const data = {
    labels: ["Jan", "Feb", "Mar", "Apr", "May", "Jun"],
    datasets: [
      {
        label: "Property Listings",
        data: [150, 230, 225, 220, 140, 148], // Updated data
        borderColor: "#4c51bf",
        tension: 0.3,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      y: {
        ticks: {
          stepSize: 50, // Ensure the ticks are in steps of 50
          beginAtZero: true,
          min: 0, // Start Y-axis from 0
        },
      },
    },
  };

  return (
    <div className="bg-white shadow-lg p-4 rounded-lg w-full">
      <h2 className="text-lg font-bold mb-3">Property Listings (Monthly)</h2>
      <div className="h-72">
        {/* Set a relative height for the chart container */}
        <Line data={data} options={options} />
      </div>
    </div>
  );
};

export default LineChart;
