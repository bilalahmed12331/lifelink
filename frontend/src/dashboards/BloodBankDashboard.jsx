import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Droplet, Building2, AlertCircle, Plus, Minus } from 'lucide-react';

const BloodBankDashboard = () => {
  const { user } = useAuth();
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const { bloodBankAPI } = await import('../services/api');
        const response = await bloodBankAPI.getBloodBankDashboard();
        setDashboardData(response.data);
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  const handleUpdateInventory = async (bloodGroupId, units) => {
    try {
      const { bloodBankAPI } = await import('../services/api');
      await bloodBankAPI.updateInventory({
        blood_group: bloodGroupId,
        units: units,
        max_units: 100
      });
      
      const response = await bloodBankAPI.getBloodBankDashboard();
      setDashboardData(response.data);
    } catch (error) {
      console.error('Error updating inventory:', error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-light flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  const { blood_bank, inventory, nearby_requests } = dashboardData;

  const bloodGroups = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];

  return (
    <div className="min-h-screen bg-light py-12 px-4">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-4xl font-bold text-dark mb-8">Blood Bank Dashboard</h1>

        <div className="card mb-8">
          <h2 className="text-xl font-semibold mb-4">Blood Bank Information</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-600">Blood Bank Name</p>
              <p className="font-semibold">{blood_bank.name}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Address</p>
              <p className="font-semibold">{blood_bank.address}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">City</p>
              <p className="font-semibold">{blood_bank.city}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Phone</p>
              <p className="font-semibold">{blood_bank.phone}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Verification Status</p>
              <p className={`font-semibold ${blood_bank.is_verified ? 'text-green-600' : 'text-yellow-600'}`}>
                {blood_bank.is_verified ? 'Verified' : 'Pending Verification'}
              </p>
            </div>
          </div>
        </div>

        <div className="card mb-8">
          <h2 className="text-xl font-semibold mb-6">Blood Inventory</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {bloodGroups.map((group) => {
              const item = inventory.find(i => i.blood_group === group);
              const units = item ? item.units : 0;
              return (
                <div key={group} className="border rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <div className="w-12 h-12 bg-primary text-white rounded-full flex items-center justify-center text-lg font-bold">
                      {group}
                    </div>
                    <span className={`px-2 py-1 rounded-full text-xs ${
                      units > 20 ? 'bg-green-100 text-green-800' :
                      units > 10 ? 'bg-yellow-100 text-yellow-800' :
                      'bg-red-100 text-red-800'
                    }`}>
                      {units} units
                    </span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => handleUpdateInventory(group, Math.max(0, units - 1))}
                      className="flex-1 bg-red-100 text-red-600 p-1 rounded hover:bg-red-200 transition-colors"
                    >
                      <Minus className="h-4 w-4 mx-auto" />
                    </button>
                    <button
                      onClick={() => handleUpdateInventory(group, units + 1)}
                      className="flex-1 bg-green-100 text-green-600 p-1 rounded hover:bg-green-200 transition-colors"
                    >
                      <Plus className="h-4 w-4 mx-auto" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div className="card">
            <div className="flex items-center justify-between mb-2">
              <AlertCircle className="h-8 w-8 text-primary" />
              <span className="text-2xl font-bold">{nearby_requests.length}</span>
            </div>
            <p className="text-gray-600">Nearby Requests</p>
          </div>
          <div className="card">
            <div className="flex items-center justify-between mb-2">
              <Droplet className="h-8 w-8 text-red-600" />
              <span className="text-2xl font-bold">{inventory.reduce((sum, item) => sum + item.units, 0)}</span>
            </div>
            <p className="text-gray-600">Total Blood Units</p>
          </div>
        </div>

        <div className="card">
          <h2 className="text-xl font-semibold mb-6">Nearby Blood Requests</h2>
          {nearby_requests.length === 0 ? (
            <p className="text-gray-500 text-center py-8">No nearby requests</p>
          ) : (
            <div className="space-y-4">
              {nearby_requests.map((request) => (
                <div key={request.id} className="border rounded-lg p-4">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <p className="font-semibold">{request.request_code}</p>
                      <p className="text-sm text-gray-600">Patient: {request.patient_name}</p>
                    </div>
                    <span className={`px-2 py-1 rounded-full text-xs ${
                      request.urgency === 'critical' ? 'bg-red-100 text-red-800' : 'bg-blue-100 text-blue-800'
                    }`}>
                      {request.urgency}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600">{request.blood_group} - {request.units_needed} units</p>
                  <p className="text-xs text-gray-400">{new Date(request.created_at).toLocaleDateString()}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default BloodBankDashboard;
