import React from 'react';

const CommunicationsDashboard = () => {
  return (
    <div className="p-4 md:p-6 lg:p-8 bg-gradient-to-br from-gray-50 to-gray-100 min-h-screen">
      <div className="mb-6">
        <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent">
          Communications
        </h1>
        <p className="text-gray-600 mt-2 flex items-center gap-2">
          <span className="w-1 h-1 bg-purple-600 rounded-full"></span>
          Manage internal communications and announcements
        </p>
      </div>
      <div className="bg-white rounded-2xl shadow-sm p-8 border border-gray-100 min-h-[400px] flex items-center justify-center">
        <div className="text-center">
          <div className="w-20 h-20 bg-purple-50 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-10 h-10 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
            </svg>
          </div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">No active communications</h2>
          <p className="text-gray-500 max-w-sm">
            All your internal messages, announcements, and alerts will be listed here.
          </p>
        </div>
      </div>
    </div>
  );
};

export default CommunicationsDashboard;
