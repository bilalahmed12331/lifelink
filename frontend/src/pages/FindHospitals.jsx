import React, { useState, useEffect } from 'react';
import { Search, MapPin, Phone, Mail, Building2, Filter } from 'lucide-react';

const FindHospitals = () => {
  const [filters, setFilters] = useState({
    city: ''
  });
  const [hospitals, setHospitals] = useState([]);
  const [loading, setLoading] = useState(false);

  const handleSearch = async () => {
    setLoading(true);
    try {
      const { hospitalAPI } = await import('../services/api');
      const response = await hospitalAPI.getAllHospitals(filters);
      setHospitals(response.data);
    } catch (error) {
      console.error('Error searching hospitals:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    handleSearch();
  }, []);

  const handleFilterChange = (e) => {
    setFilters({
      ...filters,
      [e.target.name]: e.target.value
    });
  };

  return (
    <div className="min-h-screen bg-light py-12 px-4">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-4xl font-bold text-dark mb-8">Find Hospitals</h1>

        <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
          <div className="flex items-center mb-4">
            <Filter className="h-5 w-5 text-primary mr-2" />
            <h2 className="text-xl font-semibold">Filters</h2>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">City</label>
            <input
              type="text"
              name="city"
              value={filters.city}
              onChange={handleFilterChange}
              className="input-field"
              placeholder="Enter city"
            />
          </div>
          <button
            onClick={handleSearch}
            className="mt-4 btn-primary flex items-center"
          >
            <Search className="h-5 w-5 mr-2" />
            Search Hospitals
          </button>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {hospitals.map((hospital) => (
              <div key={hospital.id} className="card">
                <div className="flex items-center mb-4">
                  <div className="w-16 h-16 bg-secondary text-white rounded-full flex items-center justify-center text-2xl font-bold mr-4">
                    <Building2 className="h-8 w-8" />
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold">{hospital.name}</h3>
                    <p className="text-gray-600">{hospital.city}</p>
                  </div>
                </div>
                <div className="space-y-2 mb-4">
                  <div className="flex items-center text-gray-600">
                    <MapPin className="h-4 w-4 mr-2" />
                    {hospital.address}
                  </div>
                  <div className="flex items-center text-gray-600">
                    <Phone className="h-4 w-4 mr-2" />
                    {hospital.phone}
                  </div>
                  {hospital.email && (
                    <div className="flex items-center text-gray-600">
                      <Mail className="h-4 w-4 mr-2" />
                      {hospital.email}
                    </div>
                  )}
                </div>
                <div className="flex justify-between items-center">
                  <span className={`px-2 py-1 rounded-full text-sm ${hospital.is_verified ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                    {hospital.is_verified ? 'Verified' : 'Pending Verification'}
                  </span>
                  <span className="text-sm text-gray-500">License: {hospital.license_number}</span>
                </div>
              </div>
            ))}
          </div>
        )}

        {!loading && hospitals.length === 0 && (
          <div className="text-center py-12 text-gray-500">
            No hospitals found matching your criteria.
          </div>
        )}
      </div>
    </div>
  );
};

export default FindHospitals;
