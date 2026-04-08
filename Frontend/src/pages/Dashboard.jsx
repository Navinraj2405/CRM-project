import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import { Users, UserPlus, TrendingUp, TrendingDown, DollarSign } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

const Dashboard = () => {
  const { user } = useContext(AuthContext);
  const [data, setData] = useState({ stats: null, charts: null });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchReports = async () => {
      try {
        const config = { headers: { Authorization: `Bearer ${user.token}` } };
        const res = await axios.get('https://crm-project-roan.vercel.app/api/reports', config);
        setData(res.data);
      } catch (error) {
        console.error("Failed to fetch reports", error);
      } finally {
        setLoading(false);
      }
    };
    fetchReports();
  }, [user]);

  if (loading) return <div>Loading dashboard...</div>;
  if (!data.stats) return <div>Failed to load dashboard</div>;

  const COLORS = ['#22c55e', '#3b82f6', '#f59e0b', '#8b5cf6', '#a855f7', '#ef4444'];

  const statsCards = [
    { name: 'Total Leads', value: data.stats.totalLeads, icon: <Users className="text-blue-500" />, bg: 'bg-blue-50' },
    { name: 'New Leads Today', value: data.stats.newLeadsToday, icon: <UserPlus className="text-green-500" />, bg: 'bg-green-50' },
    { name: 'Converted Leads', value: data.stats.convertedLeads, icon: <TrendingUp className="text-emerald-500" />, bg: 'bg-emerald-50' },
    { name: 'Lost Leads', value: data.stats.lostLeads, icon: <TrendingDown className="text-red-500" />, bg: 'bg-red-50' },
    { name: 'Projected Revenue', value: `$${data.stats.revenueOverview}`, icon: <DollarSign className="text-amber-500" />, bg: 'bg-amber-50' },
  ];

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold text-gray-900">Dashboard</h1>
      
      {/* Stats Cards */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-5">
        {statsCards.map((card) => (
          <div key={card.name} className="bg-white overflow-hidden shadow rounded-lg border border-gray-100">
            <div className="p-5">
              <div className="flex items-center">
                <div className={`flex-shrink-0 rounded-md p-3 ${card.bg}`}>
                  {card.icon}
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">{card.name}</dt>
                    <dd className="text-lg font-semibold text-gray-900">{card.value}</dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
        <div className="bg-white p-6 shadow rounded-lg border border-gray-100">
          <h2 className="text-lg font-medium text-gray-900 mb-4">Leads by Status</h2>
          <div className="h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={data.charts.leadsByStatus}
                  cx="50%"
                  cy="50%"
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                >
                  {data.charts.leadsByStatus.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
        
        <div className="bg-white p-6 shadow rounded-lg border border-gray-100">
          <h2 className="text-lg font-medium text-gray-900 mb-4">Status Distribution</h2>
          <div className="h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data.charts.leadsByStatus}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="value" fill="#22c55e" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
