import React, { useEffect, useState } from "react";

import { fetchDashboardData } from "../../../services/adminapiservices";

import StatsCard from "./StatsCard";
import LineChart from "./LineChart";
import PieChart from "./PieChart";

// Import Lucide icons
import { Home, Clock, MessageSquare, Users } from "lucide-react";

const Dashboard = () => {
  const [statsData, setStatsData] = useState({
    totalUsers: 0,
    totalProperties: 0,
    pendingApprovals: 0,
    activeRequests: 0,
    communities: 0,
  });

  useEffect(() => {
    const getDashboardData = async () => {
      try {
        const result = await fetchDashboardData();
        setStatsData({
          totalUsers: result.data.result.total_users,
          totalProperties: result.data.result.total_properties,
          pendingApprovals: result.data.result.pending_properties,
          activeRequests: result.data.result.total_requests,
          communities: result.data.result.total_communities,
        });
      } catch (error) {
        // Handle error if needed
        console.error(error);
      }
    };

    getDashboardData();
  }, []);

  return (
    <div className="w-full p-5">
      <ul className="grid grid-cols-3 lg:grid-cols-5 gap-3 lg:justify-between">
        <StatsCard
          IconComponent={Users}
          title="Total Users"
          value={statsData.totalUsers}
        />

        <StatsCard
          IconComponent={Home}
          title="Total Properties"
          value={statsData.totalProperties}
        />
        <StatsCard
          IconComponent={Clock}
          title="Pending Approvals"
          value={statsData.pendingApprovals}
        />
        <StatsCard
          IconComponent={MessageSquare}
          title="Active Requests"
          value={statsData.activeRequests}
        />
        <StatsCard
          IconComponent={Users}
          title="Communities"
          value={statsData.communities}
        />
      </ul>
      <div className="flex flex-col lg:flex-row gap-3 pt-5">
        <div className="min-w-[400px] max-w-[500px] lg:min-w-[300px] lg:max-w-[500px]">
          <LineChart />
        </div>
        <div className="min-w-[400px] max-w-[500px] lg:min-w-[300px] lg:max-w-[500px]">
          <PieChart />
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
