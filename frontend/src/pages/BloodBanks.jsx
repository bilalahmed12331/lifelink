import React, { useState, useEffect } from 'react';
import { Search, MapPin, Phone, Droplet, Filter } from 'lucide-react';

const BloodBanks = () => {
  const [filters, setFilters] = useState({
    city: ''
  });
  const [bloodBanks, setBloodBanks] = useState([]);
  const [loading, setLoading] = useState(false);

  const handleSearch = async () => {
    setLoading(true);
    try {
      const { bloodBankAPI } = await import('../services/api');
      const response = await bloodBankAPI.getAllBloodBanks(filters);
      setBloodBanks(response.data);
    } catch (error) {
      console.error('Error searching blood banks:', error);
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

  const getStockColor = (units, maxUnits) => {
    const percentage = (units / maxUnits) * 100;
    if (percentage > 50) return 'bg-green-100 text-green-800';
    if (percentage > 25) return 'bg-yellow-100 text-yellow-800';
    return 'bg-red-100 text-red-800';
  };

  return (
    <div className="min-h-screen bg-light py-12 px-4">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-4xl font-bold text-dark mb-8">Blood Banks</h1>

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
            Search Blood Banks
          </button>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {bloodBanks.map((bloodBank) => (
              <div key={bloodBank.id} className="card">
                <div className="flex items-center mb-4">
                  <div className="w-16 h-16 bg-primary text-white rounded-full flex items-center justify-center text-2xl font-bold mr-4">
                    <Droplet className="h-8 w-8" />
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold">{bloodBank.name}</h3>
                    <p className="text-gray-600">{bloodBank.city}</p>
                  </div>
                </div>
                <div className="space-y-2 mb-4">
                  <div className="flex items-center text-gray-600">
                    <MapPin className="h-4 w-4 mr-2" />
                    {bloodBank.address}
                  </div>
                  <div className="flex items-center text-gray-600">
                    <Phone className="h-4 w-4 mr-2" />
                    {bloodBank.phone}
                  </div>
                </div>
                <div className="mb-4">
                  <h4 className="font-semibold mb-2">Blood Inventory</h4>
                  <div className="grid grid-cols-4 gap-2">
                    {bloodBank.inventory && bloodBank.inventory.map((item) => (
                      <div key={item.blood_group} className="text-center">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold ${getStockColor(item.units, item.max_units)}`}>
                          {item.blood_group}
                        </div>
                        <p className="text-xs text-gray-600 mt-1">{item.units}/{item.max_units}</p>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="flex justify-between items-center">
                  <span className={`px-2 py-1 rounded-full text-sm ${bloodBank.is_verified ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                    {bloodBank.is_verified ? 'Verified' : 'Pending Verification'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}

        {!loading && bloodBanks.length === 0 && (
          <div className="text-center py-12 text-gray-500">
            No blood banks found matching your criteria.
          </div>
        )}
      </div>
    </div>
  );
};

export default BloodBanks;
