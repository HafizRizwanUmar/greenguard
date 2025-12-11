import React, { useState } from 'react';
import { analyzeArea } from '../../api';
import Sidebar from '../../components/Sidebar';
import MapComponent from '../../components/Map/MapComponent';
import ResultsPanel from '../../components/Dashboard/ResultsPanel';
import { RefreshCcw, Maximize2, Layers, Calendar, ChevronDown } from 'lucide-react';

const Dashboard = () => {
    const [selectedArea, setSelectedArea] = useState(null);
    const [analysisResults, setAnalysisResults] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const handleAreaSelected = (coordinates) => {
        setSelectedArea(coordinates);
        // Optional: Auto-analyze or wait for button click
        // setText("Area Selected. Click Analyze.");
    };

    const handleAnalyze = async () => {
        if (!selectedArea) {
            alert("Please select an area on the map first using the rectangle tool.");
            return;
        }

        setLoading(true);
        setError(null);
        try {
            const { data } = await analyzeArea({
                coordinates: selectedArea,
                startDate: '2024-01-01', // Default or from date picker
                endDate: '2024-12-31'
            });

            // Transform Python AI response to chart format
            if (data.status === 'success') {
                setAnalysisResults(data);
            } else {
                setError(data.message || "Analysis failed");
            }
        } catch (err) {
            console.error(err);
            setError("Analysis failed. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{ display: 'flex', minHeight: '100vh', background: 'var(--color-bg-body)' }}>
            <Sidebar />

            <main style={{ marginLeft: '280px', flex: 1, display: 'flex', flexDirection: 'column', height: '100vh' }}>
                {/* Header */}
                <header style={{
                    background: 'var(--color-bg-card)',
                    padding: '16px 32px',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    borderBottom: '1px solid rgba(0,0,0,0.05)',
                    zIndex: 10
                }}>
                    <div>
                        <h2 style={{ fontSize: '1.5rem', fontWeight: 700, margin: 0 }}>Satellite Analysis</h2>
                        <p style={{ color: 'var(--color-text-muted)', fontSize: '0.875rem', marginTop: '4px' }}>Monitor deforestation in real-time</p>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        {/* Interactive Controls */}
                        <div style={{ display: 'flex', gap: '8px' }}>
                            <button className="gg-btn" style={{
                                background: 'white',
                                border: '1px solid #e2e8f0',
                                padding: '8px 16px',
                                fontSize: '0.875rem'
                            }}>
                                <Calendar size={16} color="var(--color-text-muted)" />
                                <span>Dec 2024</span>
                                <ChevronDown size={14} color="var(--color-text-muted)" style={{ marginLeft: '4px' }} />
                            </button>

                            <button className="gg-btn" style={{
                                background: 'white',
                                border: '1px solid #e2e8f0',
                                padding: '8px',
                                aspectRatio: '1/1'
                            }}>
                                <Layers size={18} color="var(--color-text-muted)" />
                            </button>
                        </div>

                        <div style={{ width: '1px', height: '24px', background: '#e2e8f0', margin: '0 8px' }}></div>

                        <button
                            className="gg-btn gg-btn-primary"
                            style={{ padding: '8px 16px', fontSize: '0.875rem' }}
                            onClick={handleAnalyze}
                            disabled={loading}
                        >
                            <RefreshCcw size={16} className={loading ? "animate-spin" : ""} />
                            <span>{loading ? "Analyzing..." : "Run Analysis"}</span>
                        </button>
                    </div>
                </header>

                {/* Content Area */}
                <div style={{ flex: 1, position: 'relative', overflow: 'hidden', display: 'flex' }}>
                    {/* Map Section */}
                    <div style={{ flex: 1, position: 'relative', height: '100%' }}>
                        <MapComponent onAreaSelected={handleAreaSelected} />

                        {/* Floating Overlay Card */}
                        <div className="gg-glass-panel" style={{
                            position: 'absolute',
                            top: '24px',
                            left: '24px',
                            zIndex: 1000,
                            padding: '20px',
                            borderRadius: '16px',
                            maxWidth: '320px'
                        }}>
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                                <h3 style={{ margin: 0, fontSize: '1rem', fontWeight: 600 }}>Region Selector</h3>
                                <div style={{ display: 'flex', gap: '4px', alignItems: 'center' }}>
                                    <span style={{ height: '8px', width: '8px', background: selectedArea ? '#22c55e' : '#cbd5e1', borderRadius: '50%', display: 'inline-block' }}></span>
                                    <span style={{ fontSize: '0.75rem', fontWeight: 600, color: selectedArea ? '#22c55e' : '#64748b' }}>
                                        {selectedArea ? "Area Selected" : "No Selection"}
                                    </span>
                                </div>
                            </div>
                            <p style={{ margin: 0, fontSize: '0.875rem', color: '#475569', lineHeight: 1.5 }}>
                                Use the draw tools to select an area for immediate AI analysis.
                            </p>
                        </div>

                        {/* Map Controls */}
                        <div style={{ position: 'absolute', bottom: '32px', left: '24px', zIndex: 1000, display: 'flex', flexDirection: 'column', gap: '8px' }}>
                            <button className="gg-card" style={{ width: '40px', height: '40px', padding: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', border: 'none' }}>
                                <strong style={{ fontSize: '1.25rem', color: 'var(--color-text-main)' }}>+</strong>
                            </button>
                            <button className="gg-card" style={{ width: '40px', height: '40px', padding: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', border: 'none' }}>
                                <strong style={{ fontSize: '1.25rem', color: 'var(--color-text-main)' }}>−</strong>
                            </button>
                        </div>
                    </div>

                    {/* Results Sidebar */}
                    <div style={{
                        width: '380px',
                        background: 'var(--color-bg-card)',
                        borderLeft: '1px solid rgba(0,0,0,0.05)',
                        padding: '24px',
                        overflowY: 'auto',
                        boxShadow: '-4px 0 24px rgba(0,0,0,0.02)'
                    }}>
                        {error && (
                            <div style={{ padding: '12px', background: '#fef2f2', border: '1px solid #fecaca', borderRadius: '8px', marginBottom: '16px', color: '#dc2626', fontSize: '0.875rem' }}>
                                {error}
                            </div>
                        )}
                        <ResultsPanel data={analysisResults} />
                    </div>
                </div>
            </main>
        </div>
    );
};

export default Dashboard;
