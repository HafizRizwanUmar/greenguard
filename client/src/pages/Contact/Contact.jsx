import React, { useState } from 'react';
import { sendContact } from '../../api';
import Sidebar from '../../components/Sidebar';
import ComingSoon from '../../components/ComingSoon';
import { SITE_CONFIG } from '../../config/siteConfig';

const Contact = () => {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        subject: '',
        message: ''
    });
    const [status, setStatus] = useState('');

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setStatus('sending');
        try {
            await sendContact(formData);
            setStatus('success');
            setFormData({ name: '', email: '', subject: '', message: '' });
        } catch (error) {
            console.error(error);
            setStatus('error');
        }
    };

    if (!SITE_CONFIG.CONTACT_ACTIVE) {
        return (
            <div style={{ display: 'flex', minHeight: '100vh', background: 'var(--color-bg-body)' }}>
                <Sidebar />
                <main className="lg:ml-[280px] p-4 lg:p-8 flex-1 transition-all flex flex-col justify-center items-center">
                    <ComingSoon
                        title="Contact Support"
                        description="We are currently upgrading our support system to better assist you. Direct contact channels will be available soon."
                    />
                </main>
            </div>
        );
    }

    return (
        <div style={{ display: 'flex', minHeight: '100vh', background: 'var(--color-bg-body)', color: 'var(--color-text-main)' }}>
            <Sidebar />
            <main style={{ marginLeft: '280px', flex: 1, padding: '32px' }}>
                <div className="max-w-4xl mx-auto">
                    <h1 className="text-3xl font-serif font-bold text-[#ccff00] mb-6 text-center">Contact Authorities</h1>
                    <div className="gg-card">
                        <p className="mb-8 text-gray-400 text-center">
                            Report illegal deforestation, suggest improvements, or reach out to environmental agencies directly.
                        </p>

                        {status === 'success' && (
                            <div className="mb-6 p-4 bg-green-900/30 border border-green-500/50 text-green-400 rounded-lg text-center backdrop-blur-sm">
                                Message sent successfully!
                            </div>
                        )}

                        {status === 'error' && (
                            <div className="mb-6 p-4 bg-red-900/30 border border-red-500/50 text-red-400 rounded-lg text-center backdrop-blur-sm">
                                Failed to send message. Please try again.
                            </div>
                        )}

                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div className="grid md:grid-cols-2 gap-6">
                                <div className="gg-input-group">
                                    <label className="gg-input-label">Name</label>
                                    <input
                                        type="text"
                                        name="name"
                                        value={formData.name}
                                        onChange={handleChange}
                                        required
                                        className="gg-input"
                                        placeholder="Your Name"
                                    />
                                </div>
                                <div className="gg-input-group">
                                    <label className="gg-input-label">Email</label>
                                    <input
                                        type="email"
                                        name="email"
                                        value={formData.email}
                                        onChange={handleChange}
                                        required
                                        className="gg-input"
                                        placeholder="your@email.com"
                                    />
                                </div>
                            </div>
                            <div className="gg-input-group">
                                <label className="gg-input-label">Subject</label>
                                <input
                                    type="text"
                                    name="subject"
                                    value={formData.subject}
                                    onChange={handleChange}
                                    required
                                    className="gg-input"
                                    placeholder="Report Subject"
                                />
                            </div>
                            <div className="gg-input-group">
                                <label className="gg-input-label">Message</label>
                                <textarea
                                    name="message"
                                    value={formData.message}
                                    onChange={handleChange}
                                    required
                                    rows="5"
                                    className="gg-input"
                                    placeholder="Describe the issue..."
                                ></textarea>
                            </div>

                            <button
                                type="submit"
                                disabled={status === 'sending'}
                                className="gg-btn gg-btn-primary w-full justify-center"
                                style={{ color: 'black' }}
                            >
                                {status === 'sending' ? 'Sending...' : 'Send Message'}
                            </button>
                        </form>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default Contact;
