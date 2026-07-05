import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Splash from './components/Splash';
import Navbar from './components/Navbar';
import ProtectedRoute from './components/ProtectedRoute';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import FindDonors from './pages/FindDonors';
import BloodRequest from './pages/BloodRequest';
import EmergencyRequest from './pages/EmergencyRequest';
import LiveTracking from './pages/LiveTracking';
import FindDoctors from './pages/FindDoctors';
import FindHospitals from './pages/FindHospitals';
import BloodBanks from './pages/BloodBanks';
import Articles from './pages/Articles';
import ArticleDetail from './pages/ArticleDetail';
import AIAssistant from './pages/AIAssistant';
import Contact from './pages/Contact';
import DonorDashboard from './dashboards/DonorDashboard';
import PatientDashboard from './dashboards/PatientDashboard';
import DoctorDashboard from './dashboards/DoctorDashboard';
import HospitalDashboard from './dashboards/HospitalDashboard';
import BloodBankDashboard from './dashboards/BloodBankDashboard';
import AdminDashboard from './dashboards/AdminDashboard';

function App() {
  const [showSplash, setShowSplash] = useState(true);

  return (
    <Router>
      <AuthProvider>
        {showSplash ? (
          <Splash onComplete={() => setShowSplash(false)} />
        ) : (
          <div className="min-h-screen bg-light">
            <Navbar />
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/find-donors" element={<FindDonors />} />
              <Route path="/blood-request" element={
                <ProtectedRoute>
                  <BloodRequest />
                </ProtectedRoute>
              } />
              <Route path="/emergency" element={
                <ProtectedRoute>
                  <EmergencyRequest />
                </ProtectedRoute>
              } />
              <Route path="/tracking/:request_id" element={<LiveTracking />} />
              <Route path="/find-doctors" element={<FindDoctors />} />
              <Route path="/find-hospitals" element={<FindHospitals />} />
              <Route path="/blood-banks" element={<BloodBanks />} />
              <Route path="/articles" element={<Articles />} />
              <Route path="/articles/:article_id" element={<ArticleDetail />} />
              <Route path="/ai-assistant" element={<AIAssistant />} />
              <Route path="/contact" element={<Contact />} />
              
              <Route path="/dashboard/donor" element={
                <ProtectedRoute allowedRoles={['donor']}>
                  <DonorDashboard />
                </ProtectedRoute>
              } />
              <Route path="/dashboard/patient" element={
                <ProtectedRoute allowedRoles={['patient']}>
                  <PatientDashboard />
                </ProtectedRoute>
              } />
              <Route path="/dashboard/doctor" element={
                <ProtectedRoute allowedRoles={['doctor']}>
                  <DoctorDashboard />
                </ProtectedRoute>
              } />
              <Route path="/dashboard/hospital" element={
                <ProtectedRoute allowedRoles={['hospital']}>
                  <HospitalDashboard />
                </ProtectedRoute>
              } />
              <Route path="/dashboard/blood-bank" element={
                <ProtectedRoute allowedRoles={['blood_bank']}>
                  <BloodBankDashboard />
                </ProtectedRoute>
              } />
              <Route path="/dashboard/admin" element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <AdminDashboard />
                </ProtectedRoute>
              } />
              
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </div>
        )}
      </AuthProvider>
    </Router>
  );
}

export default App;
