import React, { useState, useEffect } from 'react';
import { Search, MapPin, Phone, Droplet, Filter } from 'lucide-react';

const FindDonors = () => {
  const [filters, setFilters] = useState({
    blood_group: '',
    city: '',
    area: '',
    available_only: false
  });
  const [donors, setDonors] = useState([]);
  const [loading, setLoading] = useState(false);

  const handleSearch = async () => {
    setLoading(true);
    try {
      const { donorAPI } = await import('../services/api');
      const response = await donorAPI.searchDonors(filters);
      setDonors(response.data);
    } catch (error) {
      console.error('Error searching donors:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    handleSearch();
  }, []);

  const handleFilterChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFilters({
      ...filters,
      [name]: type === 'checkbox' ? checked : value
    });
  };

  return (
    <div className="min-h-screen bg-light py-12 px-4">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-4xl font-bold text-dark mb-8">Find Blood Donors</h1>

        <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
          <div className="flex items-center mb-4">
            <Filter className="h-5 w-5 text-primary mr-2" />
            <h2 className="text-xl font-semibold">Filters</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Blood Group</label>
              <select
                name="blood_group"
                value={filters.blood_group}
                onChange={handleFilterChange}
                className="input-field"
              >
                <option value="">All Groups</option>
                <option value="A+">A+</option>
                <option value="A-">A-</option>
                <option value="B+">B+</option>
                <option value="B-">B-</option>
                <option value="AB+">AB+</option>
                <option value="AB-">AB-</option>
                <option value="O+">O+</option>
                <option value="O-">O-</option>
              </select>
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
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Area</label>
              <input
                type="text"
                name="area"
                value={filters.area}
                onChange={handleFilterChange}
                className="input-field"
                placeholder="Enter area"
              />
            </div>
            <div className="flex items-end">
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  name="available_only"
                  checked={filters.available_only}
                  onChange={handleFilterChange}
                  className="w-4 h-4 text-primary"
                />
                <span className="text-sm font-medium text-gray-700">Available Only</span>
              </label>
            </div>
          </div>
          <button
            onClick={handleSearch}
            className="mt-4 btn-primary flex items-center"
          >
            <Search className="h-5 w-5 mr-2" />
            Search Donors
          </button>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {donors.map((donor) => (
              <div key={donor.id} className="card">
                <div className="flex items-center mb-4">
                  <div className="w-16 h-16 bg-primary text-white rounded-full flex items-center justify-center text-2xl font-bold mr-4">
                    {donor.blood_group}
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold">{donor.name}</h3>
                    <p className="text-gray-600">{donor.city}</p>
                  </div>
                </div>
                <div className="space-y-2 mb-4">
                  <div className="flex items-center text-gray-600">
                    <MapPin className="h-4 w-4 mr-2" />
                    {donor.address}
                  </div>
                  <div className="flex items-center text-gray-600">
                    <Phone className="h-4 w-4 mr-2" />
                    {donor.phone}
                  </div>
                  <div className="flex items-center">
                    <Droplet className="h-4 w-4 mr-2 text-primary" />
                    <span className={`px-2 py-1 rounded-full text-sm ${donor.is_available ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                      {donor.is_available ? 'Available' : 'Not Available'}
                    </span>
                  </div>
                </div>
                <div className="flex justify-between text-sm text-gray-500">
                  <span>Total Donations: {donor.total_donations}</span>
                  <span className="capitalize">Badge: {donor.badge}</span>
                </div>
              </div>
            ))}
          </div>
        )}

        {!loading && donors.length === 0 && (
          <div className="text-center py-12 text-gray-500">
            No donors found matching your criteria.
          </div>
        )}
      </div>
    </div>
  );
};

export default FindDonors;
