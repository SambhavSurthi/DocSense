import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
  Home, 
  LogIn, 
  UserPlus, 
  LogOut, 
  User, 
  Settings, 
  FileText, 
  Users,
  Shield,
  Menu,
  X,
  Download
} from 'lucide-react';
import { useState } from 'react';

const Navbar: React.FC = () => {
  const { isAuthenticated, user, logout } = useAuth();
  const navigate = useNavigate();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  return (
    <nav className="bg-white shadow-lg border-b">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <FileText className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold text-gray-900">DocSense</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-6">
            {isAuthenticated ? (
              <>
                <Link
                  to="/dashboard"
                  className="text-gray-700 hover:text-blue-600 transition-colors flex items-center space-x-1"
                >
                  <Home className="w-4 h-4" />
                  <span>Dashboard</span>
                </Link>
                
                <Link
                  to="/documents"
                  className="text-gray-700 hover:text-blue-600 transition-colors flex items-center space-x-1"
                >
                  <FileText className="w-4 h-4" />
                  <span>Documents</span>
                </Link>

                {user?.role === 'superuser' && (
                  <>
                    <Link
                      to="/admin/requests"
                      className="text-gray-700 hover:text-blue-600 transition-colors flex items-center space-x-1"
                    >
                      <Users className="w-4 h-4" />
                      <span>Requests</span>
                    </Link>
                    <Link
                      to="/admin/download-requests"
                      className="text-gray-700 hover:text-blue-600 transition-colors flex items-center space-x-1"
                    >
                      <Download className="w-4 h-4" />
                      <span>Downloads</span>
                    </Link>
                    <Link
                      to="/admin/users"
                      className="text-gray-700 hover:text-blue-600 transition-colors flex items-center space-x-1"
                    >
                      <Users className="w-4 h-4" />
                      <span>Users</span>
                    </Link>
                    <Link
                      to="/admin/roles"
                      className="text-gray-700 hover:text-blue-600 transition-colors flex items-center space-x-1"
                    >
                      <Shield className="w-4 h-4" />
                      <span>Roles</span>
                    </Link>
                  </>
                )}

                <Link
                  to="/personalize"
                  className="text-gray-700 hover:text-blue-600 transition-colors flex items-center space-x-1"
                >
                  <Settings className="w-4 h-4" />
                  <span>Settings</span>
                </Link>

                <div className="flex items-center space-x-2">
                  <User className="w-4 h-4 text-gray-500" />
                  <span className="text-sm text-gray-600">{user?.username}</span>
                  <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
                    {user?.role}
                  </span>
                </div>

                <button
                  onClick={handleLogout}
                  className="text-gray-700 hover:text-red-600 transition-colors flex items-center space-x-1"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Logout</span>
                </button>
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  className="text-gray-700 hover:text-blue-600 transition-colors flex items-center space-x-1"
                >
                  <LogIn className="w-4 h-4" />
                  <span>Login</span>
                </Link>
                <Link
                  to="/signup"
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-1"
                >
                  <UserPlus className="w-4 h-4" />
                  <span>Sign Up</span>
                </Link>
              </>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <button
              onClick={toggleMobileMenu}
              className="text-gray-700 hover:text-blue-600 transition-colors"
            >
              {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMobileMenuOpen && (
          <div className="md:hidden py-4 border-t">
            <div className="flex flex-col space-y-4">
              {isAuthenticated ? (
                <>
                  <Link
                    to="/dashboard"
                    className="text-gray-700 hover:text-blue-600 transition-colors flex items-center space-x-2"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    <Home className="w-4 h-4" />
                    <span>Dashboard</span>
                  </Link>
                  
                  <Link
                    to="/documents"
                    className="text-gray-700 hover:text-blue-600 transition-colors flex items-center space-x-2"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    <FileText className="w-4 h-4" />
                    <span>Documents</span>
                  </Link>

                  {user?.role === 'superuser' && (
                    <>
                      <Link
                        to="/admin/requests"
                        className="text-gray-700 hover:text-blue-600 transition-colors flex items-center space-x-2"
                        onClick={() => setIsMobileMenuOpen(false)}
                      >
                        <Users className="w-4 h-4" />
                        <span>Requests</span>
                      </Link>
                      <Link
                        to="/admin/download-requests"
                        className="text-gray-700 hover:text-blue-600 transition-colors flex items-center space-x-2"
                        onClick={() => setIsMobileMenuOpen(false)}
                      >
                        <Download className="w-4 h-4" />
                        <span>Downloads</span>
                      </Link>
                      <Link
                        to="/admin/users"
                        className="text-gray-700 hover:text-blue-600 transition-colors flex items-center space-x-2"
                        onClick={() => setIsMobileMenuOpen(false)}
                      >
                        <Users className="w-4 h-4" />
                        <span>Users</span>
                      </Link>
                      <Link
                        to="/admin/roles"
                        className="text-gray-700 hover:text-blue-600 transition-colors flex items-center space-x-2"
                        onClick={() => setIsMobileMenuOpen(false)}
                      >
                        <Shield className="w-4 h-4" />
                        <span>Roles</span>
                      </Link>
                    </>
                  )}

                  <Link
                    to="/personalize"
                    className="text-gray-700 hover:text-blue-600 transition-colors flex items-center space-x-2"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    <Settings className="w-4 h-4" />
                    <span>Settings</span>
                  </Link>

                  <div className="flex items-center space-x-2 py-2">
                    <User className="w-4 h-4 text-gray-500" />
                    <span className="text-sm text-gray-600">{user?.username}</span>
                    <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
                      {user?.role}
                    </span>
                  </div>

                  <button
                    onClick={() => {
                      handleLogout();
                      setIsMobileMenuOpen(false);
                    }}
                    className="text-gray-700 hover:text-red-600 transition-colors flex items-center space-x-2"
                  >
                    <LogOut className="w-4 h-4" />
                    <span>Logout</span>
                  </button>
                </>
              ) : (
                <>
                  <Link
                    to="/login"
                    className="text-gray-700 hover:text-blue-600 transition-colors flex items-center space-x-2"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    <LogIn className="w-4 h-4" />
                    <span>Login</span>
                  </Link>
                  <Link
                    to="/signup"
                    className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    <UserPlus className="w-4 h-4" />
                    <span>Sign Up</span>
                  </Link>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
