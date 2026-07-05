import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { MapPin, Clock, CheckCircle, Truck, Droplet, AlertCircle } from 'lucide-react';

const LiveTracking = () => {
  const { request_id } = useParams();
  const [trackingData, setTrackingData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const statusFlow = ['submitted', 'matching', 'accepted', 'en_route', 'delivered', 'completed'];
  const statusLabels = {
    submitted: 'Request Submitted',
    matching: 'Finding Donors',
    accepted: 'Donor Accepted',
    en_route: 'En Route',
    delivered: 'Delivered',
    completed: 'Completed'
  };

  useEffect(() => {
    const fetchTrackingData = async () => {
      try {
        const { requestAPI } = await import('../services/api');
        const response = await requestAPI.getTrackingData(request_id);
        setTrackingData(response.data);
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to load tracking data');
      } finally {
        setLoading(false);
      }
    };

    fetchTrackingData();
    const interval = setInterval(fetchTrackingData, 10000);
    return () => clearInterval(interval);
  }, [request_id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-light flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-light flex items-center justify-center px-4">
        <div className="bg-red-50 border border-red-200 text-red-600 px-6 py-4 rounded-lg flex items-center">
          <AlertCircle className="h-5 w-5 mr-2" />
          {error}
        </div>
      </div>
    );
  }

  const { request, accepted_donors, progress } = trackingData;

  return (
    <div className="min-h-screen bg-light py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold text-dark mb-8">Live Tracking</h1>

        <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-2xl font-bold">Request Code: {request.request_code}</h2>
              <p className="text-gray-600">Blood Group: {request.blood_group} | Units: {request.units_needed}</p>
            </div>
            <div className={`px-4 py-2 rounded-full font-semibold ${
              request.urgency === 'critical' ? 'bg-red-100 text-red-800' : 'bg-blue-100 text-blue-800'
            }`}>
              {request.urgency.toUpperCase()}
            </div>
          </div>

          <div className="mb-8">
            <div className="flex justify-between mb-2">
              <span className="text-sm font-medium text-gray-700">Progress</span>
              <span className="text-sm font-medium text-primary">{statusLabels[request.status]}</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-4">
              <div
                className="bg-gradient-primary h-4 rounded-full transition-all duration-500"
                style={{ width: `${((progress.current_index + 1) / progress.total_stages) * 100}%` }}
              ></div>
            </div>
          </div>

          <div className="grid grid-cols-6 gap-2">
            {progress.stages.map((stage, index) => (
              <div key={stage} className="text-center">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center mx-auto mb-2 ${
                  index <= progress.current_index ? 'bg-primary text-white' : 'bg-gray-200 text-gray-600'
                }`}>
                  {index < progress.current_index ? <CheckCircle className="h-5 w-5" /> : index + 1}
                </div>
                <span className="text-xs text-gray-600">{statusLabels[stage]}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-6">
          <h3 className="text-xl font-semibold mb-4 flex items-center">
            <Droplet className="h-5 w-5 text-primary mr-2" />
            Accepted Donors
          </h3>

          {accepted_donors.length === 0 ? (
            <p className="text-gray-500 text-center py-8">No donors have accepted yet. Our system is matching you with available donors.</p>
          ) : (
            <div className="space-y-4">
              {accepted_donors.map((donor) => (
                <div key={donor.id} className="border rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center">
                      <div className="w-12 h-12 bg-primary text-white rounded-full flex items-center justify-center text-lg font-bold mr-4">
                        {donor.blood_group}
                      </div>
                      <div>
                        <h4 className="font-semibold">{donor.donor_name}</h4>
                        <p className="text-sm text-gray-600">{donor.blood_group}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="flex items-center text-sm text-gray-600">
                        <MapPin className="h-4 w-4 mr-1" />
                        {donor.distance} km away
                      </div>
                      <div className="flex items-center text-sm text-green-600 mt-1">
                        <CheckCircle className="h-4 w-4 mr-1" />
                        Accepted
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center text-sm text-gray-600">
                    <Phone className="h-4 w-4 mr-2" />
                    {donor.donor_phone}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-start">
            <Clock className="h-5 w-5 text-blue-600 mr-2 mt-0.5" />
            <div>
              <p className="font-medium text-blue-800">Real-time Updates</p>
              <p className="text-sm text-blue-700">This page updates automatically every 10 seconds to show the latest status of your blood request.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LiveTracking;
