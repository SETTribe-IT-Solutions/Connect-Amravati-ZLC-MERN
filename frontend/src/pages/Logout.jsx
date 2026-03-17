import React, { useState } from 'react';
import { ArrowRightOnRectangleIcon, XMarkIcon, CheckCircleIcon } from '@heroicons/react/24/outline';

const Logout = ({ onLogout, onClose }) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleLogout = () => {
    setIsProcessing(true);
    
    // Simulate logout process
    setTimeout(() => {
      setIsProcessing(false);
      setIsSuccess(true);
      
      // Redirect after success
      setTimeout(() => {
        if (onLogout) {
          onLogout();
        }
      }, 1500);
    }, 1500);
  };

  // Success view
  if (isSuccess) {
    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-xl max-w-md w-full p-8 text-center">
          <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircleIcon className="h-8 w-8 text-white" />
          </div>
          <h3 className="text-lg font-bold text-gray-900 mb-2">Logged Out Successfully!</h3>
          <p className="text-sm text-gray-600">Redirecting to login page...</p>
        </div>
      </div>
    );
  }

  // Processing view
  if (isProcessing) {
    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-xl max-w-md w-full p-8 text-center">
          <div className="w-16 h-16 border-4 border-red-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <h3 className="text-lg font-bold text-gray-900 mb-2">Logging out...</h3>
          <p className="text-sm text-gray-600">Please wait</p>
        </div>
      </div>
    );
  }

  // Confirm view
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl max-w-lg w-full overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-red-500 to-red-600 p-6 text-white">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <ArrowRightOnRectangleIcon className="h-6 w-6" />
              <h2 className="text-xl font-bold">Ready to Leave?</h2>
            </div>
            <button 
              onClick={onClose} 
              className="hover:bg-white/20 p-1 rounded-lg transition-colors"
            >
              <XMarkIcon className="h-5 w-5" />
            </button>
          </div>
          <p className="text-red-100 text-sm mt-2">We'll save your progress</p>
        </div>
        
        {/* Body */}
        <div className="p-6">
          <div className="bg-blue-50 p-4 rounded-lg mb-4">
            <div className="flex items-center space-x-3">
              <div className="bg-blue-100 p-2 rounded-lg">
                <span className="text-blue-600 font-bold">2h 30m</span>
              </div>
              <div>
                <p className="text-sm text-gray-600">Session Duration</p>
                <p className="text-xs text-gray-500">Logged in at 09:30 AM</p>
              </div>
            </div>
          </div>

          <p className="text-gray-600 mb-6">
            Are you sure you want to logout? You have <span className="font-bold text-red-500">3 pending tasks</span>.
          </p>
          
          {/* Action Buttons */}
          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors font-medium"
            >
              Cancel
            </button>
            <button
              onClick={handleLogout}
              className="flex-1 px-4 py-2 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-lg hover:from-red-600 hover:to-red-700 transition-all font-medium flex items-center justify-center"
            >
              <ArrowRightOnRectangleIcon className="h-5 w-5 mr-2" />
              Logout
            </button>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3 bg-gray-50 border-t border-gray-100">
          <p className="text-xs text-gray-500 text-center">
            Session will expire automatically after 4 hours of inactivity
          </p>
        </div>
      </div>
    </div>
  );
};

export default Logout;