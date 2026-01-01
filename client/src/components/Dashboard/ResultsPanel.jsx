import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { TrendingDown, TreePine, Target, Download, AlertTriangle, Maximize } from 'lucide-react';
import Button from '../Button';
import api from '../../api';

const COLORS = ['#ccff00', '#ef4444']; // Neon Lime & Red

const ResultCard = ({ title, value, unit, icon: Icon, color }) => (
    <div className="gg-card" style={{ padding: '16px', display: 'flex', alignItems: 'center', gap: '16px', marginBottom: 0 }}>
        <div style={{
            width: '40px',
            height: '40px',
            borderRadius: '10px',
            background: `${color}20`, // 20% opacity
            color: color,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
        }}>
            <Icon size={20} />
        </div>
        <div>
            <p style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', margin: 0 }}>{title}</p>
            <p style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--color-text-main)', margin: 0 }}>
                {value} <span style={{ fontSize: '0.875rem', fontWeight: 400, color: 'var(--color-text-muted)' }}>{unit}</span>
            </p>
        </div>
    </div>
);

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
            value: hasData ? `${data.totalForestArea}` : '0',
            unit: 'km²',
            icon: Target,
            color: '#3b82f6',
        },
        {
            label: 'Perimeter',
            value: hasData && data.perimeter ? `${data.perimeter}` : 'N/A',
            unit: 'km',
            icon: Maximize,
            color: '#8b5cf6',
        },
        {
            label: 'Forest Cover',
            value: hasData ? `${(100 - data.deforestationPercent).toFixed(1)}` : '0',
            unit: '%',
            icon: TreePine,
            color: '#ccff00',
        },
        {
            label: 'Deforestation',
            value: hasData ? `${data.deforestationPercent}` : '0',
            unit: '%',
            icon: TrendingDown,
            color: '#ef4444',
        },
    ];

    const CustomTooltip = ({ active, payload }) => {
        if (active && payload && payload.length) {
            return (
                <div style={{ background: 'var(--color-bg-card)', border: 'var(--glass-border)', borderRadius: '8px', padding: '12px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)', backdropFilter: 'blur(10px)' }}>
                    <p style={{ margin: 0, fontSize: '0.875rem', fontWeight: 600, color: 'var(--color-text-main)' }}>{payload[0].name}</p>
                    <p style={{ margin: '4px 0 0', fontSize: '1.25rem', fontWeight: 700, color: payload[0].payload.fill }}>{payload[0].value}%</p>
                </div>
            );
        }
        return null;
    };

    // Handlers
    const handleSaveReport = async () => {
        if (!hasData) return;

        const userProvidedName = window.prompt("Enter a name for this area (e.g., 'North District Zone A')");
        if (userProvidedName === null) return; // Cancelled

        const areaName = userProvidedName.trim() || `Analysis - ${new Date().toLocaleDateString()}`;

        try {
            await api.post('/reports', {
                areaName: areaName,
                coordinates: { lat: 0, lng: 0 }, // Placeholder or actual coordinates if available in props
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

        import('jspdf').then(jsPDF => {
            import('jspdf-autotable').then(autoTable => {
                const doc = new jsPDF.default();

                // Header
                doc.setFontSize(22);
                doc.setTextColor(204, 255, 0); // Neon Lime
                doc.text("GreenGuard Analysis Report", 14, 22);

                doc.setFontSize(10);
                doc.setTextColor(100);
                doc.text(`Generated: ${new Date().toLocaleDateString()} ${new Date().toLocaleTimeString()}`, 14, 30);

                // Divider
                doc.setDrawColor(204, 255, 0);
                doc.line(14, 35, 196, 35);

                // Summary Stats
                doc.setFontSize(16);
                doc.setTextColor(0);
                doc.text("Deforestation Overview", 14, 45);

                const tableData = [
                    ["Total Forest Area", `${data.totalForestArea} km²`],
                    ["Perimeter (Boundary)", `${data.perimeter || 'N/A'} km`],
                    ["Remaining Forest", `${(100 - data.deforestationPercent).toFixed(1)}%`],
                    ["Deforested Area", `${data.deforestationPercent}%`],
                    ["AI Confidence Score", `${data.confidence || 'N/A'}`]
                ];

                autoTable.default(doc, {
                    startY: 50,
                    head: [['Metric', 'Value']],
                    body: tableData,
                    theme: 'grid',
                    headStyles: { fillColor: [40, 40, 40] }, // Dark header
                    styles: { fontSize: 12, cellPadding: 6 }
                });

                // Explanation
                const finalY = doc.lastAutoTable.finalY || 100;
                doc.setFontSize(11);
                doc.setTextColor(80);
                doc.text("This report was generated using GreenGuard's advanced satellite imagery analysis powered by deep learning models (DeepLabV3+).", 14, finalY + 15, { maxWidth: 180 });

                // Save
                doc.save(`GreenGuard_Report_${Date.now()}.pdf`);
            });
        });
    };

    return (
        <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
            {/* Header */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px' }}>
                <h3 style={{ fontSize: '1.125rem', fontWeight: 700, margin: 0, color: 'var(--color-text-main)' }}>Analysis Results</h3>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '4px 12px', background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.2)', borderRadius: '20px' }}>
                    <AlertTriangle size={12} color="#ef4444" />
                    <span style={{ fontSize: '0.75rem', fontWeight: 600, color: '#ef4444' }}>Attention</span>
                </div>
            </div>

            {/* AI Overlay Image Preview */}
            {hasData && data.image && (
                <div className="gg-card" style={{ padding: '0', marginBottom: '24px', overflow: 'hidden', border: 'var(--glass-border)', position: 'relative' }}>
                    <div style={{ padding: '12px', background: 'rgba(255,255,255,0.05)', borderBottom: 'var(--glass-border)' }}>
                        <span style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--color-text-muted)' }}>AI Detection Mask</span>
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
            <div className="gg-card" style={{ padding: '24px', marginBottom: '24px', background: 'transparent', border: 'none' }}>
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
                                    <span style={{ color: 'var(--color-text-muted)', fontSize: '0.875rem', fontWeight: 500, marginLeft: '4px' }}>{value}</span>
                                )}
                            />
                        </PieChart>
                    </ResponsiveContainer>
                </div>
            </div>

            {/* Stats Grid */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '24px' }}>
                {stats.map((stat, i) => (
                    <ResultCard
                        key={i}
                        title={stat.label}
                        value={stat.value}
                        unit={stat.unit}
                        icon={stat.icon}
                        color={stat.color}
                    />
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
                    style={{ width: '100%', justifyContent: 'center', background: 'transparent', color: 'var(--color-primary)', borderColor: 'var(--color-primary)' }}
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
