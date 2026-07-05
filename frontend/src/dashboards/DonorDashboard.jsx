import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Droplet, Award, Calendar, Clock, ToggleLeft, ToggleRight, CheckCircle } from 'lucide-react';

const DonorDashboard = () => {
  const { user } = useAuth();
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isAvailable, setIsAvailable] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const { donorAPI } = await import('../services/api');
        const response = await donorAPI.getDonorDashboard();
        setDashboardData(response.data);
        setIsAvailable(response.data.donor.is_available);
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  const handleToggleAvailability = async () => {
    try {
      const { donorAPI } = await import('../services/api');
      await donorAPI.updateAvailability({ is_available: !isAvailable });
      setIsAvailable(!isAvailable);
    } catch (error) {
      console.error('Error updating availability:', error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-light flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  const { donor, recent_responses, upcoming_appointments } = dashboardData;

  return (
    <div className="min-h-screen bg-light py-12 px-4">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-4xl font-bold text-dark mb-8">Donor Dashboard</h1>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="card">
            <div className="flex items-center justify-between mb-2">
              <Droplet className="h-8 w-8 text-primary" />
              <span className="text-2xl font-bold">{donor.total_donations}</span>
            </div>
            <p className="text-gray-600">Total Donations</p>
          </div>
          <div className="card">
            <div className="flex items-center justify-between mb-2">
              <Award className="h-8 w-8 text-accent" />
              <span className="text-2xl font-bold">{donor.reward_points}</span>
            </div>
            <p className="text-gray-600">Reward Points</p>
          </div>
          <div className="card">
            <div className="flex items-center justify-between mb-2">
              <Calendar className="h-8 w-8 text-secondary" />
              <span className="text-2xl font-bold capitalize">{donor.badge}</span>
            </div>
            <p className="text-gray-600">Badge Level</p>
          </div>
          <div className="card">
            <div className="flex items-center justify-between mb-2">
              <Clock className="h-8 w-8 text-green-600" />
              <span className="text-2xl font-bold capitalize">{donor.last_donated ? new Date(donor.last_donated).toLocaleDateString() : 'Never'}</span>
            </div>
            <p className="text-gray-600">Last Donated</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          <div className="card">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold">Availability Status</h2>
              <button
                onClick={handleToggleAvailability}
                className={`flex items-center space-x-2 px-4 py-2 rounded-lg ${
                  isAvailable ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                }`}
              >
                {isAvailable ? <ToggleRight className="h-5 w-5" /> : <ToggleLeft className="h-5 w-5" />}
                <span>{isAvailable ? 'Available' : 'Unavailable'}</span>
              </button>
            </div>
            <p className="text-gray-600">
              {isAvailable
                ? 'You are currently available for blood donation requests. You will receive notifications when matching requests are made.'
                : 'You are currently unavailable. Toggle this to start receiving donation requests.'}
            </p>
          </div>

          <div className="card">
            <h2 className="text-xl font-semibold mb-6">Blood Group</h2>
            <div className="flex items-center">
              <div className="w-20 h-20 bg-primary text-white rounded-full flex items-center justify-center text-3xl font-bold mr-4">
                {donor.blood_group}
              </div>
              <div>
                <p className="text-gray-600">Your blood type is {donor.blood_group}</p>
                <p className="text-sm text-gray-500">You can donate to compatible recipients</p>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="card">
            <h2 className="text-xl font-semibold mb-6">Recent Donation Responses</h2>
            {recent_responses.length === 0 ? (
              <p className="text-gray-500 text-center py-8">No recent responses</p>
            ) : (
              <div className="space-y-4">
                {recent_responses.map((response) => (
                  <div key={response.id} className="border rounded-lg p-4">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <p className="font-semibold">Request: {response.request_code}</p>
                        <p className="text-sm text-gray-600">Blood Group: {response.blood_group}</p>
                      </div>
                      <span className={`px-2 py-1 rounded-full text-xs ${
                        response.status === 'completed' ? 'bg-green-100 text-green-800' :
                        response.status === 'accepted' ? 'bg-blue-100 text-blue-800' :
                        'bg-yellow-100 text-yellow-800'
                      }`}>
                        {response.status}
                      </span>
                    </div>
                    <p className="text-sm text-gray-500">
                      {new Date(response.responded_at).toLocaleDateString()}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="card">
            <h2 className="text-xl font-semibold mb-6">Upcoming Appointments</h2>
            {upcoming_appointments.length === 0 ? (
              <p className="text-gray-500 text-center py-8">No upcoming appointments</p>
            ) : (
              <div className="space-y-4">
                {upcoming_appointments.map((appointment) => (
                  <div key={appointment.id} className="border rounded-lg p-4">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <p className="font-semibold">Dr. {appointment.doctor_name}</p>
                        <p className="text-sm text-gray-600">{appointment.specialization}</p>
                      </div>
                      <span className={`px-2 py-1 rounded-full text-xs ${
                        appointment.status === 'accepted' ? 'bg-green-100 text-green-800' :
                        appointment.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {appointment.status}
                      </span>
                    </div>
                    <div className="flex items-center text-sm text-gray-500">
                      <Calendar className="h-4 w-4 mr-1" />
                      {new Date(appointment.appointment_date).toLocaleDateString()} at {appointment.time_slot}
                    </div>
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

export default DonorDashboard;
