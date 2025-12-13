import React, { useEffect, useState } from 'react';
import Sidebar from '../../components/Sidebar';
import { Eye, Download, X, MapPin, Calendar, TrendingDown, Trees, AlertTriangle, CheckCircle, Clock, BarChart3, Leaf, Target } from 'lucide-react';
import { fetchReports } from '../../api';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

const History = () => {
    const [reports, setReports] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedReport, setSelectedReport] = useState(null);

    useEffect(() => {
        const loadReports = async () => {
            try {
                const { data } = await fetchReports();
                console.log("History Page - Fetched Reports:", data);
                setReports(data || []);
            } catch (error) {
                console.error("Failed to fetch history", error);
            } finally {
                setLoading(false);
            }
        };
        loadReports();
    }, []);

    // Get risk level based on deforestation percentage
    const getRiskLevel = (percent) => {
        if (percent >= 50) return { level: 'Critical', color: '#dc2626', bg: '#fef2f2' };
        if (percent >= 30) return { level: 'High', color: '#ea580c', bg: '#fff7ed' };
        if (percent >= 15) return { level: 'Moderate', color: '#ca8a04', bg: '#fefce8' };
        return { level: 'Low', color: '#16a34a', bg: '#f0fdf4' };
    };

    // Chart data for the modal
    const getChartData = (report) => {
        const remaining = 100 - (report.deforestationPercent || 0);
        return [
            { name: 'Remaining Forest', value: parseFloat(remaining.toFixed(1)), color: '#16a34a' },
            { name: 'Deforested Area', value: parseFloat((report.deforestationPercent || 0).toFixed(1)), color: '#dc2626' }
        ];
    };

    const generatePDF = (report) => {
        const doc = new jsPDF();

        // Header with gradient effect simulation
        doc.setFillColor(22, 163, 74);
        doc.rect(0, 0, 210, 40, 'F');

        doc.setFontSize(24);
        doc.setTextColor(255, 255, 255);
        doc.text("GreenGuard", 14, 18);
        doc.setFontSize(12);
        doc.text("Deforestation Analysis Report", 14, 28);

        // Report ID Badge
        doc.setFontSize(8);
        doc.text(`Report ID: ${report._id}`, 14, 36);

        // Meta Info Section
        doc.setFontSize(10);
        doc.setTextColor(100);
        doc.text(`Generated: ${new Date().toLocaleDateString()} at ${new Date().toLocaleTimeString()}`, 14, 50);

        // Summary Section
        doc.setFontSize(16);
        doc.setTextColor(22, 163, 74);
        doc.text("Analysis Summary", 14, 65);

        const risk = getRiskLevel(report.deforestationPercent || 0);

        const data = [
            ["Area Name", report.areaName || "Untitled Area"],
            ["Analysis Date", new Date(report.createdAt).toLocaleDateString()],
            ["Time Period", `${report.startDate ? new Date(report.startDate).toLocaleDateString() : 'N/A'} - ${report.endDate ? new Date(report.endDate).toLocaleDateString() : 'N/A'}`],
            ["Total Forest Area", report.totalForestArea ? `${report.totalForestArea.toFixed(2)} sq km` : "N/A"],
            ["Deforested Area", report.deforestedArea ? `${report.deforestedArea.toFixed(2)} sq km` : "N/A"],
            ["Deforestation Rate", `${report.deforestationPercent || 0}%`],
            ["Risk Level", risk.level],
            ["NE Coordinates", report.coordinates?.ne ? `${report.coordinates.ne.lat.toFixed(5)}, ${report.coordinates.ne.lng.toFixed(5)}` : "N/A"],
            ["SW Coordinates", report.coordinates?.sw ? `${report.coordinates.sw.lat.toFixed(5)}, ${report.coordinates.sw.lng.toFixed(5)}` : "N/A"],
            ["Status", "Completed"],
            ["Monthly Updates", report.isSubscribedToMonthlyUpdates ? "Subscribed" : "Not Subscribed"]
        ];

        autoTable(doc, {
            startY: 70,
            head: [['Metric', 'Value']],
            body: data,
            theme: 'striped',
            headStyles: { fillColor: [22, 163, 74], fontSize: 11 },
            styles: { fontSize: 10, cellPadding: 5 },
            alternateRowStyles: { fillColor: [240, 253, 244] }
        });

        // Footer
        const finalY = doc.lastAutoTable.finalY || 180;
        doc.setFontSize(9);
        doc.setTextColor(100);
        doc.text("This report was generated using GreenGuard's satellite imagery analysis powered by DeepLabV3+ deep learning models.", 14, finalY + 15, { maxWidth: 180 });

        doc.setFontSize(8);
        doc.text("© " + new Date().getFullYear() + " GreenGuard - Environmental Monitoring Platform", 14, finalY + 25);

        doc.save(`GreenGuard_Report_${report._id.substr(0, 8)}.pdf`);
    };

    // Enhanced Report View Modal Component
    const ReportModal = ({ report, onClose }) => {
        const risk = getRiskLevel(report.deforestationPercent || 0);
        const chartData = getChartData(report);
        const remainingForest = 100 - (report.deforestationPercent || 0);

        return (
            <div className="fixed inset-0 z-[1001] flex items-center justify-center p-4" style={{ backgroundColor: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(8px)' }}>
                <div
                    className="bg-white rounded-3xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden"
                    style={{ animation: 'fadeInUp 0.3s ease-out' }}
                >
                    {/* Header */}
                    <div
                        className="p-6 text-white relative overflow-hidden"
                        style={{
                            background: 'linear-gradient(135deg, #16a34a 0%, #14532d 100%)',
                        }}
                    >
                        <div className="absolute top-0 right-0 w-64 h-64 opacity-10">
                            <Leaf size={256} />
                        </div>
                        <div className="relative z-10 flex justify-between items-start">
                            <div>
                                <p className="text-green-200 text-sm font-medium mb-1">GreenGuard Analysis Report</p>
                                <h3 className="text-2xl font-bold">{report.areaName || 'Untitled Area'}</h3>
                                <div className="flex items-center gap-4 mt-3 text-green-100 text-sm">
                                    <span className="flex items-center gap-1">
                                        <Calendar size={14} />
                                        {new Date(report.createdAt).toLocaleDateString('en-US', {
                                            year: 'numeric',
                                            month: 'long',
                                            day: 'numeric'
                                        })}
                                    </span>
                                    <span className="flex items-center gap-1">
                                        <Clock size={14} />
                                        {new Date(report.createdAt).toLocaleTimeString('en-US', {
                                            hour: '2-digit',
                                            minute: '2-digit'
                                        })}
                                    </span>
                                </div>
                            </div>
                            <button
                                onClick={onClose}
                                className="p-2 hover:bg-white/20 rounded-full transition-all"
                            >
                                <X size={24} />
                            </button>
                        </div>
                        <div className="mt-4 flex items-center gap-2">
                            <span
                                className="px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1"
                                style={{ backgroundColor: 'rgba(255,255,255,0.2)' }}
                            >
                                <CheckCircle size={12} /> Completed
                            </span>
                            <span className="text-xs text-green-200">ID: {report._id}</span>
                        </div>
                    </div>

                    {/* Content */}
                    <div className="p-6 overflow-y-auto" style={{ maxHeight: 'calc(90vh - 280px)' }}>
                        {/* Risk Alert Banner */}
                        <div
                            className="rounded-xl p-4 mb-6 flex items-center gap-4"
                            style={{ backgroundColor: risk.bg, border: `1px solid ${risk.color}20` }}
                        >
                            <div
                                className="w-12 h-12 rounded-full flex items-center justify-center"
                                style={{ backgroundColor: risk.color + '20' }}
                            >
                                <AlertTriangle size={24} style={{ color: risk.color }} />
                            </div>
                            <div>
                                <p className="font-semibold" style={{ color: risk.color }}>
                                    {risk.level} Risk Level
                                </p>
                                <p className="text-sm text-gray-600">
                                    {report.deforestationPercent >= 50
                                        ? 'Immediate action required. Critical deforestation detected.'
                                        : report.deforestationPercent >= 30
                                            ? 'Significant deforestation observed. Monitoring recommended.'
                                            : report.deforestationPercent >= 15
                                                ? 'Moderate deforestation levels. Continue observation.'
                                                : 'Healthy forest coverage. Minimal deforestation detected.'
                                    }
                                </p>
                            </div>
                        </div>

                        {/* Stats Grid */}
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                            <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-4 border border-green-200">
                                <div className="flex items-center gap-2 text-green-600 mb-2">
                                    <Trees size={18} />
                                    <span className="text-xs font-medium uppercase tracking-wide">Total Forest</span>
                                </div>
                                <p className="text-2xl font-bold text-green-800">
                                    {report.totalForestArea ? `${report.totalForestArea.toFixed(1)}` : '--'}
                                </p>
                                <p className="text-xs text-green-600">sq km</p>
                            </div>

                            <div className="bg-gradient-to-br from-red-50 to-red-100 rounded-xl p-4 border border-red-200">
                                <div className="flex items-center gap-2 text-red-600 mb-2">
                                    <TrendingDown size={18} />
                                    <span className="text-xs font-medium uppercase tracking-wide">Deforested</span>
                                </div>
                                <p className="text-2xl font-bold text-red-800">
                                    {report.deforestedArea ? `${report.deforestedArea.toFixed(1)}` : '--'}
                                </p>
                                <p className="text-xs text-red-600">sq km</p>
                            </div>

                            <div className="bg-gradient-to-br from-amber-50 to-amber-100 rounded-xl p-4 border border-amber-200">
                                <div className="flex items-center gap-2 text-amber-600 mb-2">
                                    <BarChart3 size={18} />
                                    <span className="text-xs font-medium uppercase tracking-wide">Deforestation</span>
                                </div>
                                <p className="text-2xl font-bold text-amber-800">
                                    {report.deforestationPercent || 0}%
                                </p>
                                <p className="text-xs text-amber-600">of total area</p>
                            </div>

                            <div className="bg-gradient-to-br from-emerald-50 to-emerald-100 rounded-xl p-4 border border-emerald-200">
                                <div className="flex items-center gap-2 text-emerald-600 mb-2">
                                    <Target size={18} />
                                    <span className="text-xs font-medium uppercase tracking-wide">Remaining</span>
                                </div>
                                <p className="text-2xl font-bold text-emerald-800">
                                    {remainingForest.toFixed(1)}%
                                </p>
                                <p className="text-xs text-emerald-600">forest cover</p>
                            </div>
                        </div>

                        {/* Chart and Details Row */}
                        <div className="grid md:grid-cols-2 gap-6">
                            {/* Pie Chart */}
                            <div className="bg-gray-50 rounded-xl p-6 border border-gray-200">
                                <h4 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                                    <BarChart3 size={20} className="text-green-600" />
                                    Forest Coverage Analysis
                                </h4>
                                <div style={{ height: 220 }}>
                                    <ResponsiveContainer width="100%" height="100%">
                                        <PieChart>
                                            <Pie
                                                data={chartData}
                                                cx="50%"
                                                cy="50%"
                                                innerRadius={50}
                                                outerRadius={80}
                                                paddingAngle={2}
                                                dataKey="value"
                                            >
                                                {chartData.map((entry, index) => (
                                                    <Cell key={`cell-${index}`} fill={entry.color} />
                                                ))}
                                            </Pie>
                                            <Tooltip
                                                formatter={(value) => `${value}%`}
                                                contentStyle={{
                                                    borderRadius: '8px',
                                                    border: 'none',
                                                    boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
                                                }}
                                            />
                                            <Legend
                                                verticalAlign="bottom"
                                                height={36}
                                                formatter={(value) => <span className="text-sm text-gray-600">{value}</span>}
                                            />
                                        </PieChart>
                                    </ResponsiveContainer>
                                </div>
                            </div>

                            {/* Location Details */}
                            <div className="bg-gray-50 rounded-xl p-6 border border-gray-200">
                                <h4 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                                    <MapPin size={20} className="text-green-600" />
                                    Location Details
                                </h4>

                                <div className="space-y-4">
                                    <div className="bg-white rounded-lg p-4 border border-gray-100">
                                        <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Northeast Bound</p>
                                        <p className="font-mono text-sm text-gray-800">
                                            {report.coordinates?.ne
                                                ? `${report.coordinates.ne.lat.toFixed(6)}, ${report.coordinates.ne.lng.toFixed(6)}`
                                                : 'N/A'
                                            }
                                        </p>
                                    </div>

                                    <div className="bg-white rounded-lg p-4 border border-gray-100">
                                        <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Southwest Bound</p>
                                        <p className="font-mono text-sm text-gray-800">
                                            {report.coordinates?.sw
                                                ? `${report.coordinates.sw.lat.toFixed(6)}, ${report.coordinates.sw.lng.toFixed(6)}`
                                                : 'N/A'
                                            }
                                        </p>
                                    </div>

                                    <div className="bg-white rounded-lg p-4 border border-gray-100">
                                        <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Analysis Period</p>
                                        <p className="text-sm text-gray-800">
                                            {report.startDate
                                                ? `${new Date(report.startDate).toLocaleDateString()} — ${new Date(report.endDate).toLocaleDateString()}`
                                                : 'Single Date Analysis'
                                            }
                                        </p>
                                    </div>

                                    <div className="flex items-center gap-2 text-sm">
                                        <span className={`w-2 h-2 rounded-full ${report.isSubscribedToMonthlyUpdates ? 'bg-green-500' : 'bg-gray-400'}`}></span>
                                        <span className="text-gray-600">
                                            {report.isSubscribedToMonthlyUpdates ? 'Monthly updates enabled' : 'Monthly updates disabled'}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Footer */}
                    <div className="bg-gray-50 px-6 py-4 border-t flex flex-col sm:flex-row justify-between items-center gap-4">
                        <p className="text-xs text-gray-500">
                            Analysis powered by DeepLabV3+ • GreenGuard © {new Date().getFullYear()}
                        </p>
                        <div className="flex gap-3">
                            <button
                                onClick={onClose}
                                className="px-5 py-2.5 border border-gray-300 rounded-xl hover:bg-gray-100 text-gray-700 font-medium transition-all"
                            >
                                Close
                            </button>
                            <button
                                onClick={() => generatePDF(report)}
                                className="px-5 py-2.5 bg-gradient-to-r from-green-600 to-green-700 text-white rounded-xl hover:from-green-700 hover:to-green-800 font-medium shadow-lg shadow-green-500/25 transition-all flex items-center gap-2"
                            >
                                <Download size={18} />
                                Download PDF
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        );
    };

    return (
        <div className="flex min-h-screen bg-green-50">
            <Sidebar />
            <main className="lg:ml-72 flex-1 p-4 lg:p-8 w-full overflow-x-hidden">
                {/* Header */}
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <h2 className="text-3xl font-bold text-green-900">Analysis History</h2>
                        <p className="text-gray-500 mt-1">View and manage your past analysis reports</p>
                    </div>
                </div>

                {/* Table */}
                <div className="bg-white rounded-xl border border-green-100 shadow-sm overflow-x-auto">
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
                                                <button
                                                    onClick={() => setSelectedReport(report)}
                                                    className="p-2 rounded-lg hover:bg-green-100 text-green-600 transition-all"
                                                    title="View Details"
                                                >
                                                    <Eye size={16} />
                                                </button>
                                                <button
                                                    onClick={() => generatePDF(report)}
                                                    className="p-2 rounded-lg hover:bg-green-100 text-green-600 transition-all"
                                                    title="Download PDF"
                                                >
                                                    <Download size={16} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>

                {/* Report Modal */}
                {selectedReport && (
                    <ReportModal
                        report={selectedReport}
                        onClose={() => setSelectedReport(null)}
                    />
                )}
            </main>
        </div>
    );
};

export default History;
