import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Menu, X, Droplet, User, LogOut, LayoutDashboard, Bell } from 'lucide-react';

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const fetchUnreadCount = async () => {
      if (user) {
        try {
          const { notificationAPI } = await import('../services/api');
          const response = await notificationAPI.getUnreadCount();
          setUnreadCount(response.data.count);
        } catch (error) {
          console.error('Error fetching notifications:', error);
        }
      }
    };
    fetchUnreadCount();
  }, [user]);

  const handleLogout = () => {
    logout();
    setIsOpen(false);
  };

  const publicLinks = [
    { name: 'Home', path: '/' },
    { name: 'Find Donors', path: '/find-donors' },
    { name: 'Find Doctors', path: '/find-doctors' },
    { name: 'Find Hospitals', path: '/find-hospitals' },
    { name: 'Blood Banks', path: '/blood-banks' },
    { name: 'Articles', path: '/articles' },
    { name: 'AI Assistant', path: '/ai-assistant' },
    { name: 'Contact', path: '/contact' },
  ];

  const dashboardPath = user ? `/dashboard/${user.role}` : '/';

  return (
    <nav className="bg-white shadow-lg sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link to="/" className="flex items-center space-x-2">
              <Droplet className="h-8 w-8 text-primary" />
              <span className="text-2xl font-bold text-dark">LifeLink</span>
            </Link>
          </div>

          <div className="hidden md:flex items-center space-x-4">
            {user ? (
              <>
                <Link
                  to={dashboardPath}
                  className="flex items-center space-x-1 px-3 py-2 rounded-md text-gray-700 hover:text-primary transition-colors"
                >
                  <LayoutDashboard className="h-5 w-5" />
                  <span>Dashboard</span>
                </Link>
                <Link
                  to="/blood-request"
                  className="px-3 py-2 rounded-md text-gray-700 hover:text-primary transition-colors"
                >
                  Request Blood
                </Link>
                <div className="relative">
                  <Link
                    to="/notifications"
                    className="flex items-center space-x-1 px-3 py-2 rounded-md text-gray-700 hover:text-primary transition-colors"
                  >
                    <Bell className="h-5 w-5" />
                    {unreadCount > 0 && (
                      <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                        {unreadCount}
                      </span>
                    )}
                  </Link>
                </div>
                <div className="flex items-center space-x-2 ml-4 pl-4 border-l">
                  <User className="h-5 w-5 text-gray-600" />
                  <span className="text-gray-700">{user.name}</span>
                </div>
                <button
                  onClick={handleLogout}
                  className="flex items-center space-x-1 px-3 py-2 rounded-md text-red-600 hover:bg-red-50 transition-colors"
                >
                  <LogOut className="h-5 w-5" />
                  <span>Logout</span>
                </button>
              </>
            ) : (
              publicLinks.map((link) => (
                <Link
                  key={link.path}
                  to={link.path}
                  className={`px-3 py-2 rounded-md transition-colors ${
                    location.pathname === link.path
                      ? 'text-primary font-medium'
                      : 'text-gray-700 hover:text-primary'
                  }`}
                >
                  {link.name}
                </Link>
              ))
            )}
            {!user && (
              <>
                <Link to="/login" className="btn-secondary">
                  Login
                </Link>
                <Link to="/register" className="btn-primary">
                  Register
                </Link>
              </>
            )}
          </div>

          <div className="md:hidden flex items-center">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="text-gray-700 hover:text-primary"
            >
              {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>
      </div>

      {isOpen && (
        <div className="md:hidden bg-white border-t">
          <div className="px-2 pt-2 pb-3 space-y-1">
            {user ? (
              <>
                <Link
                  to={dashboardPath}
                  className="block px-3 py-2 rounded-md text-gray-700 hover:text-primary"
                  onClick={() => setIsOpen(false)}
                >
                  Dashboard
                </Link>
                <Link
                  to="/blood-request"
                  className="block px-3 py-2 rounded-md text-gray-700 hover:text-primary"
                  onClick={() => setIsOpen(false)}
                >
                  Request Blood
                </Link>
                <div className="px-3 py-2 text-gray-700">
                  <span className="font-medium">{user.name}</span>
                </div>
                <button
                  onClick={handleLogout}
                  className="block w-full text-left px-3 py-2 rounded-md text-red-600 hover:bg-red-50"
                >
                  Logout
                </button>
              </>
            ) : (
              publicLinks.map((link) => (
                <Link
                  key={link.path}
                  to={link.path}
                  className="block px-3 py-2 rounded-md text-gray-700 hover:text-primary"
                  onClick={() => setIsOpen(false)}
                >
                  {link.name}
                </Link>
              ))
            )}
            {!user && (
              <>
                <Link
                  to="/login"
                  className="block px-3 py-2 rounded-md text-gray-700 hover:text-primary"
                  onClick={() => setIsOpen(false)}
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  className="block px-3 py-2 rounded-md text-gray-700 hover:text-primary"
                  onClick={() => setIsOpen(false)}
                >
                  Register
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
