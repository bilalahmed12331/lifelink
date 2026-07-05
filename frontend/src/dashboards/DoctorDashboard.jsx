import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Calendar, Clock, CheckCircle, X, RotateCcw, User } from 'lucide-react';

const DoctorDashboard = () => {
  const { user } = useAuth();
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const { doctorAPI } = await import('../services/api');
        const response = await doctorAPI.getDoctorDashboard();
        setDashboardData(response.data);
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  const handleAppointmentResponse = async (appointmentId, action, newDate, newTime) => {
    try {
      const { appointmentAPI } = await import('../services/api');
      await appointmentAPI.respondToAppointment({
        appointment_id: appointmentId,
        status: action,
        new_date: newDate,
        new_time: newTime
      });
      
      const { doctorAPI } = await import('../services/api');
      const response = await doctorAPI.getDoctorDashboard();
      setDashboardData(response.data);
    } catch (error) {
      console.error('Error responding to appointment:', error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-light flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  const { doctor, recent_appointments, stats } = dashboardData;

  return (
    <div className="min-h-screen bg-light py-12 px-4">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-4xl font-bold text-dark mb-8">Doctor Dashboard</h1>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="card">
            <div className="flex items-center justify-between mb-2">
              <Clock className="h-8 w-8 text-yellow-600" />
              <span className="text-2xl font-bold">{stats.pending}</span>
            </div>
            <p className="text-gray-600">Pending Appointments</p>
          </div>
          <div className="card">
            <div className="flex items-center justify-between mb-2">
              <CheckCircle className="h-8 w-8 text-green-600" />
              <span className="text-2xl font-bold">{stats.completed}</span>
            </div>
            <p className="text-gray-600">Completed Appointments</p>
          </div>
          <div className="card">
            <div className="flex items-center justify-between mb-2">
              <User className="h-8 w-8 text-secondary" />
              <span className="text-2xl font-bold">{doctor.experience_years}</span>
            </div>
            <p className="text-gray-600">Years Experience</p>
          </div>
        </div>

        <div className="card mb-8">
          <h2 className="text-xl font-semibold mb-4">Profile Information</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-600">Specialization</p>
              <p className="font-semibold">{doctor.specialization}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Qualifications</p>
              <p className="font-semibold">{doctor.qualifications}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Available Days</p>
              <p className="font-semibold">{doctor.available_days || 'Not specified'}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Available Times</p>
              <p className="font-semibold">{doctor.available_times || 'Not specified'}</p>
            </div>
            {doctor.consultation_fee && (
              <div>
                <p className="text-sm text-gray-600">Consultation Fee</p>
                <p className="font-semibold">PKR {doctor.consultation_fee}</p>
              </div>
            )}
          </div>
        </div>

        <div className="card">
          <h2 className="text-xl font-semibold mb-6">Recent Appointments</h2>
          {recent_appointments.length === 0 ? (
            <p className="text-gray-500 text-center py-8">No appointments yet</p>
          ) : (
            <div className="space-y-4">
              {recent_appointments.map((appointment) => (
                <div key={appointment.id} className="border rounded-lg p-4">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <p className="font-semibold">{appointment.patient_name}</p>
                      <p className="text-sm text-gray-600">{appointment.reason || 'No reason specified'}</p>
                    </div>
                    <span className={`px-2 py-1 rounded-full text-xs ${
                      appointment.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                      appointment.status === 'accepted' ? 'bg-green-100 text-green-800' :
                      appointment.status === 'rejected' ? 'bg-red-100 text-red-800' :
                      appointment.status === 'rescheduled' ? 'bg-blue-100 text-blue-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {appointment.status}
                    </span>
                  </div>
                  <div className="flex items-center text-sm text-gray-500 mb-3">
                    <Calendar className="h-4 w-4 mr-1" />
                    {new Date(appointment.appointment_date).toLocaleDateString()} at {appointment.time_slot}
                  </div>
                  {appointment.status === 'pending' && (
                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleAppointmentResponse(appointment.id, 'accepted')}
                        className="flex items-center px-3 py-1 bg-green-600 text-white rounded hover:bg-green-700 transition-colors"
                      >
                        <CheckCircle className="h-4 w-4 mr-1" />
                        Accept
                      </button>
                      <button
                        onClick={() => handleAppointmentResponse(appointment.id, 'rejected')}
                        className="flex items-center px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
                      >
                        <X className="h-4 w-4 mr-1" />
                        Reject
                      </button>
                      <button
                        onClick={() => {
                          const newDate = prompt('Enter new date (YYYY-MM-DD):');
                          const newTime = prompt('Enter new time (HH:MM):');
                          if (newDate && newTime) {
                            handleAppointmentResponse(appointment.id, 'rescheduled', newDate, newTime);
                          }
                        }}
                        className="flex items-center px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
                      >
                        <RotateCcw className="h-4 w-4 mr-1" />
                        Reschedule
                      </button>
                    </div>
                  )}
                  {appointment.patient_phone && (
                    <div className="mt-2 text-sm text-gray-600">
                      Contact: {appointment.patient_phone}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DoctorDashboard;
