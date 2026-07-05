import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Droplet, Search, Heart, Users, Building2, Stethoscope, MapPin, Phone, Mail, Clock, AlertCircle } from 'lucide-react';

const Home = () => {
  const { user } = useAuth();
  const [counts, setCounts] = useState({
    donors: 0,
    requests: 0,
    donations: 0,
    hospitals: 0,
    doctors: 0
  });

  useEffect(() => {
    const animateCount = (target, duration) => {
      let start = 0;
      const increment = target / (duration / 16);
      const timer = setInterval(() => {
        start += increment;
        if (start >= target) {
          clearInterval(timer);
          start = target;
        }
        return Math.floor(start);
      }, 16);
      return timer;
    };

    const timers = [
      animateCount(1250, 2000),
      animateCount(890, 2000),
      animateCount(3420, 2000),
      animateCount(156, 2000),
      animateCount(234, 2000)
    ];

    return () => timers.forEach(timer => clearInterval(timer));
  }, []);

  const services = [
    { icon: Search, title: 'Find Donors', description: 'Search for blood donors by location and blood group', link: '/find-donors' },
    { icon: Heart, title: 'Blood Request', description: 'Request blood for patients in need', link: '/blood-request' },
    { icon: Users, title: 'Become Donor', description: 'Register as a blood donor and save lives', link: '/register' },
    { icon: Stethoscope, title: 'Find Doctors', description: 'Connect with specialized doctors', link: '/find-doctors' },
    { icon: Building2, title: 'Find Hospitals', description: 'Locate nearby hospitals and blood banks', link: '/find-hospitals' },
    { icon: Droplet, title: 'Blood Banks', description: 'Check real-time blood inventory', link: '/blood-banks' },
    { icon: AlertCircle, title: 'Emergency', description: 'Get immediate help for critical situations', link: '/emergency' },
    { icon: Mail, title: 'AI Assistant', description: 'Get answers to your health questions', link: '/ai-assistant' },
  ];

  return (
    <div className="min-h-screen">
      <section className="bg-dark text-white py-20 px-4">
        <div className="max-w-7xl mx-auto text-center">
          <h1 className="text-5xl md:text-6xl font-bold mb-6 animate-fade-in">
            AI-Powered Blood Donation System
          </h1>
          <p className="text-xl md:text-2xl mb-8 text-white/90 animate-slide-up">
            Connecting donors with those in need through intelligent matching
          </p>
          <div className="flex flex-wrap justify-center gap-4 animate-slide-up" style={{ animationDelay: '0.2s' }}>
            <Link to="/find-donors" className="bg-white text-primary px-8 py-3 rounded-lg font-medium hover:bg-gray-100 transition-colors">
              Find Donor
            </Link>
            <Link to="/blood-request" className="bg-primary text-white px-8 py-3 rounded-lg font-medium hover:bg-red-600 transition-colors">
              Emergency Blood Request
            </Link>
            {!user && (
              <Link to="/register" className="bg-white text-primary px-8 py-3 rounded-lg font-medium hover:bg-gray-100 transition-colors">
                Become Donor
              </Link>
            )}
            {user && (
              <Link to={`/dashboard/${user.role}`} className="bg-white text-primary px-8 py-3 rounded-lg font-medium hover:bg-gray-100 transition-colors">
                Dashboard
              </Link>
            )}
          </div>
        </div>
      </section>

      <section className="py-16 px-4 bg-white">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12 text-gradient">Our Impact</h2>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-8">
            {[
              { label: 'Total Donors', value: '1,250+', icon: Users },
              { label: 'Active Requests', value: '890', icon: AlertCircle },
              { label: 'Completed Donations', value: '3,420', icon: Heart },
              { label: 'Partner Hospitals', value: '156', icon: Building2 },
              { label: 'Registered Doctors', value: '234', icon: Stethoscope },
            ].map((stat, index) => (
              <div key={index} className="text-center">
                <stat.icon className="h-12 w-12 mx-auto mb-4 text-primary" />
                <div className="text-4xl font-bold text-primary mb-2">{stat.value}</div>
                <div className="text-gray-600">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-16 px-4 bg-gray-50">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12 text-gradient">Our Services</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {services.map((service, index) => (
              <Link key={index} to={service.link} className="card group cursor-pointer">
                <service.icon className="h-12 w-12 text-primary mb-4 group-hover:scale-110 transition-transform" />
                <h3 className="text-xl font-semibold mb-2">{service.title}</h3>
                <p className="text-gray-600">{service.description}</p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="py-16 px-4 bg-white">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12 text-gradient">How It Works</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { step: '1', title: 'Register', description: 'Create your account as a donor, patient, or healthcare provider' },
              { step: '2', title: 'Request or Donate', description: 'Submit blood requests or respond to donation opportunities' },
              { step: '3', title: 'Get Matched', description: 'Our AI system matches donors with recipients based on compatibility' },
            ].map((item, index) => (
              <div key={index} className="text-center">
                <div className="w-16 h-16 bg-primary text-white rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-4">
                  {item.step}
                </div>
                <h3 className="text-xl font-semibold mb-2">{item.title}</h3>
                <p className="text-gray-600">{item.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-gradient-secondary text-white py-16 px-4">
        <div className="max-w-7xl mx-auto text-center">
          <h2 className="text-3xl font-bold mb-4">Ready to Save Lives?</h2>
          <p className="text-xl mb-8 text-white/90">Join thousands of donors making a difference every day</p>
          <Link to="/register" className="bg-white text-secondary px-8 py-3 rounded-lg font-medium hover:bg-gray-100 transition-colors inline-block">
            Get Started Now
          </Link>
        </div>
      </section>
    </div>
  );
};

export default Home;
