import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Users, AlertCircle, CheckCircle, X, Shield, FileText, Activity, Trash2, Ban, Check } from 'lucide-react';

const AdminDashboard = () => {
  const { user } = useAuth();
  const [analytics, setAnalytics] = useState(null);
  const [users, setUsers] = useState([]);
  const [requests, setRequests] = useState([]);
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('analytics');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const { adminAPI } = await import('../services/api');
        const [analyticsRes, usersRes, requestsRes, logsRes] = await Promise.all([
          adminAPI.getAnalytics(),
          adminAPI.getAllUsers(),
          adminAPI.getAllRequests(),
          adminAPI.getSystemLogs()
        ]);
        setAnalytics(analyticsRes.data);
        setUsers(usersRes.data);
        setRequests(requestsRes.data);
        setLogs(logsRes.data);
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleVerifyUser = async (userId) => {
    try {
      const { adminAPI } = await import('../services/api');
      await adminAPI.verifyUser(userId);
      const usersRes = await adminAPI.getAllUsers();
      setUsers(usersRes.data);
    } catch (error) {
      console.error('Error verifying user:', error);
    }
  };

  const handleBlockUser = async (userId, isBlocked) => {
    try {
      const { adminAPI } = await import('../services/api');
      await adminAPI.blockUser(userId, { is_blocked: !isBlocked });
      const usersRes = await adminAPI.getAllUsers();
      setUsers(usersRes.data);
    } catch (error) {
      console.error('Error blocking user:', error);
    }
  };

  const handleDeleteUser = async (userId) => {
    if (!confirm('Are you sure you want to delete this user?')) return;
    try {
      const { adminAPI } = await import('../services/api');
      await adminAPI.deleteUser(userId);
      const usersRes = await adminAPI.getAllUsers();
      setUsers(usersRes.data);
    } catch (error) {
      console.error('Error deleting user:', error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-light flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  const tabs = [
    { id: 'analytics', label: 'Analytics', icon: Activity },
    { id: 'users', label: 'Users', icon: Users },
    { id: 'requests', label: 'Requests', icon: AlertCircle },
    { id: 'logs', label: 'System Logs', icon: FileText },
  ];

  return (
    <div className="min-h-screen bg-light py-12 px-4">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-4xl font-bold text-dark mb-8">Admin Dashboard</h1>

        <div className="flex space-x-4 mb-8 border-b">
          <Shield className="h-8 w-8 text-primary" />
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center space-x-2 px-4 py-2 border-b-2 transition-colors ${
                activeTab === tab.id
                  ? 'border-primary text-primary'
                  : 'border-transparent text-gray-600 hover:text-gray-900'
              }`}
            >
              <tab.icon className="h-5 w-5" />
              <span>{tab.label}</span>
            </button>
          ))}
        </div>

        {activeTab === 'analytics' && (
          <div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <div className="card">
                <div className="flex items-center justify-between mb-2">
                  <Users className="h-8 w-8 text-primary" />
                  <span className="text-2xl font-bold">{analytics.users_by_role.reduce((sum, u) => sum + u.count, 0)}</span>
                </div>
                <p className="text-gray-600">Total Users</p>
              </div>
              <div className="card">
                <div className="flex items-center justify-between mb-2">
                  <AlertCircle className="h-8 w-8 text-yellow-600" />
                  <span className="text-2xl font-bold">{analytics.requests_by_status.reduce((sum, r) => sum + r.count, 0)}</span>
                </div>
                <p className="text-gray-600">Total Requests</p>
              </div>
              <div className="card">
                <div className="flex items-center justify-between mb-2">
                  <CheckCircle className="h-8 w-8 text-green-600" />
                  <span className="text-2xl font-bold">{analytics.total_donations}</span>
                </div>
                <p className="text-gray-600">Completed Donations</p>
              </div>
              <div className="card">
                <div className="flex items-center justify-between mb-2">
                  <Shield className="h-8 w-8 text-secondary" />
                  <span className="text-2xl font-bold">{analytics.total_hospitals + analytics.total_doctors + analytics.total_blood_banks}</span>
                </div>
                <p className="text-gray-600">Healthcare Partners</p>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div className="card">
                <h3 className="text-xl font-semibold mb-4">Users by Role</h3>
                <div className="space-y-2">
                  {analytics.users_by_role.map((item) => (
                    <div key={item.role} className="flex justify-between items-center">
                      <span className="capitalize">{item.role}</span>
                      <span className="font-semibold">{item.count}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="card">
                <h3 className="text-xl font-semibold mb-4">Requests by Status</h3>
                <div className="space-y-2">
                  {analytics.requests_by_status.map((item) => (
                    <div key={item.status} className="flex justify-between items-center">
                      <span className="capitalize">{item.status}</span>
                      <span className="font-semibold">{item.count}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'users' && (
          <div className="card">
            <h2 className="text-xl font-semibold mb-6">All Users</h2>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left p-3">Name</th>
                    <th className="text-left p-3">Email</th>
                    <th className="text-left p-3">Role</th>
                    <th className="text-left p-3">Verified</th>
                    <th className="text-left p-3">Blocked</th>
                    <th className="text-left p-3">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((userItem) => (
                    <tr key={userItem.id} className="border-b hover:bg-gray-50">
                      <td className="p-3">{userItem.name}</td>
                      <td className="p-3">{userItem.email}</td>
                      <td className="p-3 capitalize">{userItem.role}</td>
                      <td className="p-3">
                        {userItem.is_verified ? (
                          <CheckCircle className="h-5 w-5 text-green-600" />
                        ) : (
                          <X className="h-5 w-5 text-gray-400" />
                        )}
                      </td>
                      <td className="p-3">
                        {userItem.is_blocked ? (
                          <Ban className="h-5 w-5 text-red-600" />
                        ) : (
                          <CheckCircle className="h-5 w-5 text-green-600" />
                        )}
                      </td>
                      <td className="p-3">
                        <div className="flex space-x-2">
                          {!userItem.is_verified && (
                            <button
                              onClick={() => handleVerifyUser(userItem.id)}
                              className="text-green-600 hover:text-green-800"
                              title="Verify"
                            >
                              <Check className="h-5 w-5" />
                            </button>
                          )}
                          <button
                            onClick={() => handleBlockUser(userItem.id, userItem.is_blocked)}
                            className={userItem.is_blocked ? 'text-green-600 hover:text-green-800' : 'text-red-600 hover:text-red-800'}
                            title={userItem.is_blocked ? 'Unblock' : 'Block'}
                          >
                            {userItem.is_blocked ? <Check className="h-5 w-5" /> : <Ban className="h-5 w-5" />}
                          </button>
                          <button
                            onClick={() => handleDeleteUser(userItem.id)}
                            className="text-red-600 hover:text-red-800"
                            title="Delete"
                          >
                            <Trash2 className="h-5 w-5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === 'requests' && (
          <div className="card">
            <h2 className="text-xl font-semibold mb-6">All Blood Requests</h2>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left p-3">Request Code</th>
                    <th className="text-left p-3">Patient</th>
                    <th className="text-left p-3">Blood Group</th>
                    <th className="text-left p-3">Units</th>
                    <th className="text-left p-3">Urgency</th>
                    <th className="text-left p-3">Status</th>
                    <th className="text-left p-3">Date</th>
                  </tr>
                </thead>
                <tbody>
                  {requests.map((request) => (
                    <tr key={request.id} className="border-b hover:bg-gray-50">
                      <td className="p-3 font-semibold">{request.request_code}</td>
                      <td className="p-3">{request.patient_name}</td>
                      <td className="p-3">{request.blood_group}</td>
                      <td className="p-3">{request.units_needed}</td>
                      <td className="p-3">
                        <span className={`px-2 py-1 rounded-full text-xs ${
                          request.urgency === 'critical' ? 'bg-red-100 text-red-800' : 'bg-blue-100 text-blue-800'
                        }`}>
                          {request.urgency}
                        </span>
                      </td>
                      <td className="p-3 capitalize">{request.status}</td>
                      <td className="p-3">{new Date(request.created_at).toLocaleDateString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === 'logs' && (
          <div className="card">
            <h2 className="text-xl font-semibold mb-6">System Logs</h2>
            <div className="space-y-4">
              {logs.map((log) => (
                <div key={log.id} className="border rounded-lg p-4">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <p className="font-semibold">{log.action}</p>
                      <p className="text-sm text-gray-600">Admin: {log.admin_name}</p>
                    </div>
                    <span className="text-xs text-gray-400">{new Date(log.created_at).toLocaleString()}</span>
                  </div>
                  <p className="text-sm text-gray-600">{log.details}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;
