import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Building2, Droplet, AlertCircle, MapPin } from 'lucide-react';

const HospitalDashboard = () => {
  const { user } = useAuth();
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const { hospitalAPI } = await import('../services/api');
        const response = await hospitalAPI.getHospitalDashboard();
        setDashboardData(response.data);
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-light flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  const { hospital, recent_requests, nearby_inventory } = dashboardData;

  return (
    <div className="min-h-screen bg-light py-12 px-4">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-4xl font-bold text-dark mb-8">Hospital Dashboard</h1>

        <div className="card mb-8">
          <h2 className="text-xl font-semibold mb-4">Hospital Information</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-600">Hospital Name</p>
              <p className="font-semibold">{hospital.name}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">License Number</p>
              <p className="font-semibold">{hospital.license_number}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Address</p>
              <p className="font-semibold">{hospital.address}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">City</p>
              <p className="font-semibold">{hospital.city}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Phone</p>
              <p className="font-semibold">{hospital.phone}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Verification Status</p>
              <p className={`font-semibold ${hospital.is_verified ? 'text-green-600' : 'text-yellow-600'}`}>
                {hospital.is_verified ? 'Verified' : 'Pending Verification'}
              </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="card">
            <div className="flex items-center justify-between mb-2">
              <AlertCircle className="h-8 w-8 text-primary" />
              <span className="text-2xl font-bold">{recent_requests.length}</span>
            </div>
            <p className="text-gray-600">Total Requests</p>
          </div>
          <div className="card">
            <div className="flex items-center justify-between mb-2">
              <Droplet className="h-8 w-8 text-red-600" />
              <span className="text-2xl font-bold">{recent_requests.filter(r => r.urgency === 'critical').length}</span>
            </div>
            <p className="text-gray-600">Critical Requests</p>
          </div>
          <div className="card">
            <div className="flex items-center justify-between mb-2">
              <Building2 className="h-8 w-8 text-secondary" />
              <span className="text-2xl font-bold">{nearby_inventory.length}</span>
            </div>
            <p className="text-gray-600">Nearby Blood Banks</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="card">
            <h2 className="text-xl font-semibold mb-6">Recent Blood Requests</h2>
            {recent_requests.length === 0 ? (
              <p className="text-gray-500 text-center py-8">No recent requests</p>
            ) : (
              <div className="space-y-4">
                {recent_requests.map((request) => (
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

          <div className="card">
            <h2 className="text-xl font-semibold mb-6">Nearby Blood Bank Inventory</h2>
            {nearby_inventory.length === 0 ? (
              <p className="text-gray-500 text-center py-8">No nearby blood banks</p>
            ) : (
              <div className="space-y-4">
                {nearby_inventory.map((item) => (
                  <div key={item.id} className="border rounded-lg p-4">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <p className="font-semibold">{item.blood_bank_name}</p>
                        <p className="text-sm text-gray-600">{item.blood_group}</p>
                      </div>
                      <span className={`px-2 py-1 rounded-full text-xs ${
                        item.units > 10 ? 'bg-green-100 text-green-800' :
                        item.units > 0 ? 'bg-yellow-100 text-yellow-800' :
                        'bg-red-100 text-red-800'
                      }`}>
                        {item.units} units
                      </span>
                    </div>
                    <p className="text-xs text-gray-500">Capacity: {item.max_units} units</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default HospitalDashboard;
