import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { AlertTriangle, Phone, CheckCircle, AlertCircle } from 'lucide-react';

const EmergencyRequest = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleEmergencyRequest = async () => {
    if (!user) {
      navigate('/login');
      return;
    }

    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const { requestAPI } = await import('../services/api');
      const emergencyData = {
        patient_name: 'Emergency Patient',
        blood_group: 'O+',
        units_needed: 2,
        urgency: 'critical',
        hospital_name: 'Emergency Hospital',
        city: user.city || 'Karachi',
        required_date: new Date().toISOString().split('T')[0],
        contact_number: user.phone,
        notes: 'EMERGENCY - Immediate blood required'
      };

      const response = await requestAPI.createRequest(emergencyData);
      setSuccess('Emergency alert sent! Nearby donors are being notified. Request Code: ' + response.data.request_code);
      
      setTimeout(() => {
        navigate(`/tracking/${response.data.id}`);
      }, 3000);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to send emergency alert. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-dark flex items-center justify-center px-4 py-12">
      <div className="max-w-2xl w-full text-center">
        <div className="bg-white rounded-2xl shadow-2xl p-12">
          <div className="w-24 h-24 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6 animate-pulse">
            <AlertTriangle className="h-12 w-12 text-primary" />
          </div>
          
          <h1 className="text-4xl font-bold text-primary mb-4">Emergency Blood Request</h1>
          <p className="text-xl text-body mb-8">
            Press the button below to immediately alert nearby donors for critical blood needs.
          </p>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg mb-6 flex items-center justify-center">
              <AlertCircle className="h-5 w-5 mr-2" />
              {error}
            </div>
          )}

          {success && (
            <div className="bg-green-50 border border-green-200 text-green-600 px-4 py-3 rounded-lg mb-6 flex items-center justify-center">
              <CheckCircle className="h-5 w-5 mr-2" />
              {success}
            </div>
          )}

          <button
            onClick={handleEmergencyRequest}
            disabled={loading}
            className="w-full bg-red-600 text-white py-6 rounded-xl text-2xl font-bold hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed mb-6"
          >
            {loading ? 'Sending Alert...' : '🚨 SEND EMERGENCY ALERT'}
          </button>

          <div className="flex items-center justify-center space-x-4 text-gray-600">
            <Phone className="h-5 w-5" />
            <span>For immediate assistance, call emergency services: 112</span>
          </div>

          <div className="mt-8 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <p className="text-sm text-yellow-800">
              <strong>Important:</strong> This feature should only be used in genuine emergencies. 
              Misuse may result in account suspension.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EmergencyRequest;
