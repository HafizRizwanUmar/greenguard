import React from 'react';
import { LayoutDashboard, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

const ComingSoon = ({ title, description }) => {
    return (
        <div className="flex-1 flex flex-col items-center justify-center p-8 text-center bg-gray-50 min-h-screen">
            <div className="bg-white p-12 rounded-3xl shadow-xl max-w-lg w-full border border-gray-100 relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-green-400 to-green-600"></div>

                <div className="w-20 h-20 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-6 text-green-600">
                    <div className="animate-pulse">
                        <LayoutDashboard size={40} />
                    </div>
                </div>

                <h2 className="text-3xl font-bold text-gray-800 mb-3">{title || 'Coming Soon'}</h2>
                <p className="text-gray-500 mb-8 leading-relaxed">
                    {description || "We're working hard to bring you this feature. Stay tuned for updates!"}
                </p>

                <div className="space-y-4">
                    <button className="w-full py-3 px-6 bg-green-600 hover:bg-green-700 text-white rounded-xl font-medium transition-all shadow-lg shadow-green-200">
                        Notify Me When Ready
                    </button>
                    <Link
                        to="/dashboard"
                        className="flex items-center justify-center gap-2 text-gray-500 hover:text-green-600 font-medium transition-colors"
                    >
                        Return to Dashboard <ArrowRight size={16} />
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default ComingSoon;
