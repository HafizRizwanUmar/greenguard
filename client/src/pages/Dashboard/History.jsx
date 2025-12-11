import React, { useEffect, useState } from 'react';
import Sidebar from '../../components/Sidebar';
import { Eye, Download, MapPin, Calendar, TrendingDown, Search, Filter } from 'lucide-react';
import { fetchReports } from '../../api';

const History = () => {
    const [reports, setReports] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const loadReports = async () => {
            try {
                const { data } = await fetchReports();
                console.log("History Page - Fetched Reports:", data);
                setReports(data || []);
            } catch (error) {
                console.error("Failed to fetch history", error);
                console.log("Error details:", error.response);
            } finally {
                setLoading(false);
            }
        };
        loadReports();
    }, []);

    const getStatusStyle = (status) => {
        // Simple logic mapping or use data from backend
        return 'bg-green-100 text-green-700 border-green-200';
    };

    return (
        <div className="flex min-h-screen bg-green-50">
            <Sidebar />
            <main className="ml-72 flex-1 p-8">
                {/* Header */}
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <h2 className="text-3xl font-bold text-green-900">Analysis History</h2>
                        <p className="text-gray-500 mt-1">View and manage your past analysis reports</p>
                    </div>
                </div>

                {/* Table */}
                <div className="bg-white rounded-xl border border-green-100 shadow-sm overflow-hidden">
                    {loading ? <div className="p-8 text-center">Loading history...</div> : (
                        <table className="w-full text-left">
                            <thead className="border-b border-green-100 bg-green-50">
                                <tr>
                                    <th className="px-6 py-4 font-semibold text-green-800 text-sm">Area Name</th>
                                    <th className="px-6 py-4 font-semibold text-green-800 text-sm">Date</th>
                                    <th className="px-6 py-4 font-semibold text-green-800 text-sm">Deforestation %</th>
                                    <th className="px-6 py-4 font-semibold text-green-800 text-sm">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-green-50">
                                {reports.length === 0 ? (
                                    <tr><td colSpan="4" className="p-6 text-center text-gray-500">No reports found.</td></tr>
                                ) : reports.map((report) => (
                                    <tr key={report._id} className="hover:bg-green-50 transition-colors">
                                        <td className="px-6 py-4">
                                            <div>
                                                <p className="font-medium text-green-900">{report.areaName || 'Untitled Area'}</p>
                                                <p className="text-xs text-gray-400 mt-0.5">Lat/Lng via Map</p>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-gray-600">{new Date(report.createdAt).toLocaleDateString()}</td>
                                        <td className="px-6 py-4">
                                            <span className="text-red-600 font-semibold">{report.deforestationPercent}%</span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-2">
                                                <button className="p-2 rounded-lg hover:bg-green-100 text-green-600 transition-all">
                                                    <Eye size={16} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>
            </main>
        </div>
    );
};

export default History;
