import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Droplet, AlertCircle, Clock, CheckCircle, Plus } from 'lucide-react';
import { Link } from 'react-router-dom';

const PatientDashboard = () => {
  const { user } = useAuth();
  const [requests, setRequests] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const { requestAPI, appointmentAPI } = await import('../services/api');
        const [requestsRes, appointmentsRes] = await Promise.all([
          requestAPI.getMyRequests(),
          appointmentAPI.getMyAppointments()
        ]);
        setRequests(requestsRes.data);
        setAppointments(appointmentsRes.data);
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-light flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  const getStatusColor = (status) => {
    const colors = {
      submitted: 'bg-blue-100 text-blue-800',
      matching: 'bg-purple-100 text-purple-800',
      accepted: 'bg-green-100 text-green-800',
      en_route: 'bg-yellow-100 text-yellow-800',
      delivered: 'bg-orange-100 text-orange-800',
      completed: 'bg-green-100 text-green-800',
      pending: 'bg-yellow-100 text-yellow-800',
      rejected: 'bg-red-100 text-red-800',
      rescheduled: 'bg-blue-100 text-blue-800',
      cancelled: 'bg-gray-100 text-gray-800'
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  return (
    <div className="min-h-screen bg-light py-12 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-4xl font-bold text-dark">Patient Dashboard</h1>
          <Link to="/blood-request" className="btn-primary flex items-center">
            <Plus className="h-5 w-5 mr-2" />
            New Blood Request
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="card">
            <div className="flex items-center justify-between mb-2">
              <Droplet className="h-8 w-8 text-primary" />
              <span className="text-2xl font-bold">{requests.length}</span>
            </div>
            <p className="text-gray-600">Total Requests</p>
          </div>
          <div className="card">
            <div className="flex items-center justify-between mb-2">
              <AlertCircle className="h-8 w-8 text-yellow-600" />
              <span className="text-2xl font-bold">{requests.filter(r => r.status === 'pending' || r.status === 'matching').length}</span>
            </div>
            <p className="text-gray-600">Pending Requests</p>
          </div>
          <div className="card">
            <div className="flex items-center justify-between mb-2">
              <CheckCircle className="h-8 w-8 text-green-600" />
              <span className="text-2xl font-bold">{requests.filter(r => r.status === 'completed').length}</span>
            </div>
            <p className="text-gray-600">Completed Requests</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="card">
            <h2 className="text-xl font-semibold mb-6">Blood Requests</h2>
            {requests.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-gray-500 mb-4">No blood requests yet</p>
                <Link to="/blood-request" className="btn-primary inline-block">
                  Create First Request
                </Link>
              </div>
            ) : (
              <div className="space-y-4">
                {requests.map((request) => (
                  <div key={request.id} className="border rounded-lg p-4">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <p className="font-semibold">{request.request_code}</p>
                        <p className="text-sm text-gray-600">{request.blood_group} - {request.units_needed} units</p>
                      </div>
                      <span className={`px-2 py-1 rounded-full text-xs ${getStatusColor(request.status)}`}>
                        {request.status}
                      </span>
                    </div>
                    <p className="text-sm text-gray-500">{request.hospital_name}</p>
                    <div className="flex justify-between items-center mt-2">
                      <span className="text-xs text-gray-400">{new Date(request.created_at).toLocaleDateString()}</span>
                      {request.accepted_donors > 0 && (
                        <span className="text-xs text-green-600">{request.accepted_donors} donor(s) accepted</span>
                      )}
                    </div>
                    {request.status !== 'completed' && (
                      <Link to={`/tracking/${request.id}`} className="text-sm text-primary hover:underline mt-2 inline-block">
                        Track Request
                      </Link>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="card">
            <h2 className="text-xl font-semibold mb-6">Appointments</h2>
            {appointments.length === 0 ? (
              <p className="text-gray-500 text-center py-8">No appointments scheduled</p>
            ) : (
              <div className="space-y-4">
                {appointments.map((appointment) => (
                  <div key={appointment.id} className="border rounded-lg p-4">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <p className="font-semibold">Dr. {appointment.doctor_name}</p>
                        <p className="text-sm text-gray-600">{appointment.specialization}</p>
                      </div>
                      <span className={`px-2 py-1 rounded-full text-xs ${getStatusColor(appointment.status)}`}>
                        {appointment.status}
                      </span>
                    </div>
                    <div className="flex items-center text-sm text-gray-500">
                      <Clock className="h-4 w-4 mr-1" />
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

export default PatientDashboard;
