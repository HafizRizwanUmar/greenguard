import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { TrendingDown, TreePine, Target, Download, AlertTriangle, ArrowUpRight } from 'lucide-react';
import Button from '../Button';
import api from '../../api';

const COLORS = ['#10b981', '#ef4444'];

const ResultsPanel = ({ data }) => {
    // Parse data from API or use defaults
    const hasData = data && data.totalForestArea;

    const chartData = hasData ? [
        { name: 'Remaining Forest', value: parseFloat((100 - data.deforestationPercent).toFixed(1)) },
        { name: 'Deforested Area', value: parseFloat(data.deforestationPercent.toFixed(1)) },
    ] : [
        { name: 'Remaining Forest', value: 75 },
        { name: 'Deforested Area', value: 25 },
    ];

    const stats = [
        {
            label: 'Total Area',
            value: hasData ? `${data.totalForestArea} km²` : '0 km²',
            icon: Target,
            color: '#3b82f6',
            bg: '#eff6ff'
        },
        {
            label: 'Forest Cover',
            value: hasData ? `${(100 - data.deforestationPercent).toFixed(1)}%` : '0%',
            icon: TreePine,
            color: '#10b981',
            bg: '#ecfdf5'
        },
        {
            label: 'Deforestation',
            value: hasData ? `${data.deforestationPercent}%` : '0%',
            icon: TrendingDown,
            color: '#ef4444',
            bg: '#fef2f2'
        },
    ];

    const CustomTooltip = ({ active, payload }) => {
        if (active && payload && payload.length) {
            return (
                <div style={{ background: 'white', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '12px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)' }}>
                    <p style={{ margin: 0, fontSize: '0.875rem', fontWeight: 600, color: '#1e293b' }}>{payload[0].name}</p>
                    <p style={{ margin: '4px 0 0', fontSize: '1.25rem', fontWeight: 700, color: payload[0].payload.fill }}>{payload[0].value}%</p>
                </div>
            );
        }
        return null;
    };

    // Handlers
    const handleSaveReport = async () => {
        if (!hasData) return;
        try {
            await api.post('/reports', {
                areaName: `Analysis - ${new Date().toLocaleDateString()}`,
                coordinates: { lat: 0, lng: 0 }, // Placeholder, ideally passed from prop
                startDate: new Date(),
                endDate: new Date(),
                totalForestArea: data.totalForestArea,
                deforestedArea: data.deforestedArea,
                deforestationPercent: data.deforestationPercent,
                mapImageUrl: data.image
            });
            alert('Report saved to history successfully!');
        } catch (err) {
            console.error(err);
            alert('Failed to save report.');
        }
    };

    const handleDownloadReport = () => {
        if (!hasData) return;
        const reportContent = `
GreenGuard Analysis Report
--------------------------
Date: ${new Date().toLocaleDateString()}
Total Area: ${data.totalForestArea} km²
Forest Cover: ${(100 - data.deforestationPercent).toFixed(1)}%
Deforestation: ${data.deforestationPercent}%

Analysis completed using DeepLabV3+ Model.
        `;
        const blob = new Blob([reportContent], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `GreenGuard_Report_${Date.now()}.txt`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    };

    return (
        <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
            {/* Header */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px' }}>
                <h3 style={{ fontSize: '1.125rem', fontWeight: 700, margin: 0 }}>Analysis Results</h3>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '4px 12px', background: '#fff7ed', border: '1px solid #ffedd5', borderRadius: '20px' }}>
                    <AlertTriangle size={12} color="#c2410c" />
                    <span style={{ fontSize: '0.75rem', fontWeight: 600, color: '#c2410c' }}>Attention</span>
                </div>
            </div>

            {/* AI Overlay Image Preview */}
            {hasData && data.image && (
                <div className="gg-card" style={{ padding: '0', marginBottom: '24px', overflow: 'hidden', border: '1px solid #e2e8f0', position: 'relative' }}>
                    <div style={{ padding: '12px', background: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
                        <span style={{ fontSize: '0.875rem', fontWeight: 600, color: '#64748b' }}>AI Detection Mask</span>
                    </div>
                    <img
                        src={data.image}
                        alt="AI Analysis"
                        style={{ width: '100%', height: 'auto', display: 'block' }}
                    />
                    <div style={{
                        position: 'absolute',
                        bottom: '10px',
                        right: '10px',
                        background: 'rgba(0,0,0,0.7)',
                        color: 'white',
                        padding: '4px 8px',
                        borderRadius: '4px',
                        fontSize: '0.75rem'
                    }}>
                        Avg Confidence: {data.confidence}
                    </div>
                </div>
            )}

            {/* Chart Card */}
            <div className="gg-card" style={{ padding: '24px', marginBottom: '24px', background: '#fafafa', border: 'none' }}>
                <div style={{ height: '200px' }}>
                    <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                            <Pie
                                data={chartData}
                                cx="50%"
                                cy="50%"
                                innerRadius={60}
                                outerRadius={80}
                                paddingAngle={5}
                                dataKey="value"
                                stroke="none"
                            >
                                {chartData.map((entry, index) => (
                                    <Cell
                                        key={`cell-${index}`}
                                        fill={COLORS[index % COLORS.length]}
                                        style={{ filter: 'drop-shadow(0px 4px 4px rgba(0,0,0,0.1))' }}
                                    />
                                ))}
                            </Pie>
                            <Tooltip content={<CustomTooltip />} />
                            <Legend
                                verticalAlign="bottom"
                                height={36}
                                iconType="circle"
                                formatter={(value) => (
                                    <span style={{ color: '#64748b', fontSize: '0.875rem', fontWeight: 500, marginLeft: '4px' }}>{value}</span>
                                )}
                            />
                        </PieChart>
                    </ResponsiveContainer>
                </div>
            </div>

            {/* Stats Grid */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '24px' }}>
                {stats.map((stat, i) => (
                    <div
                        key={i}
                        className="gg-card"
                        style={{ padding: '16px', display: 'flex', alignItems: 'center', justification: 'space-between', marginBottom: 0 }}
                    >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                            <div style={{
                                width: '40px',
                                height: '40px',
                                borderRadius: '10px',
                                background: stat.bg,
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center'
                            }}>
                                <stat.icon size={20} color={stat.color} />
                            </div>
                            <div>
                                <p style={{ margin: 0, fontSize: '0.75rem', color: '#64748b', fontWeight: 500 }}>{stat.label}</p>
                                <p style={{ margin: 0, fontSize: '1.125rem', fontWeight: 700, color: '#1e293b' }}>{stat.value}</p>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Action Buttons */}
            <div style={{ marginTop: 'auto', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <Button
                    className="w-full"
                    size="md"
                    icon={Download}
                    style={{ width: '100%' }}
                    onClick={handleDownloadReport}
                    disabled={!hasData}
                >
                    Download Report
                </Button>
                <button
                    className="gg-btn gg-btn-secondary"
                    style={{ width: '100%', justifyContent: 'center' }}
                    onClick={handleSaveReport}
                    disabled={!hasData}
                >
                    Save to History
                </button>
            </div>
        </div>
    );
};

export default ResultsPanel;
