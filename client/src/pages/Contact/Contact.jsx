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
        <div style={{ display: 'flex', minHeight: '100vh', background: 'var(--color-bg-body)' }}>
            <Sidebar />
            <main style={{ marginLeft: '280px', flex: 1, padding: '32px' }}>
                <div className="max-w-4xl mx-auto">
                    <h1 className="text-3xl font-bold text-green-800 mb-6 text-center">Contact Authorities</h1>
                    <div className="bg-white p-8 rounded-2xl shadow-lg">
                        <p className="mb-6 text-gray-600 text-center">
                            Report illegal deforestation, suggest improvements, or reach out to environmental agencies directly.
                        </p>

                        {status === 'success' && (
                            <div className="mb-4 p-4 bg-green-100 text-green-700 rounded-lg">
                                Message sent successfully!
                            </div>
                        )}

                        {status === 'error' && (
                            <div className="mb-4 p-4 bg-red-100 text-red-700 rounded-lg">
                                Failed to send message. Please try again.
                            </div>
                        )}

                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="grid md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Name</label>
                                    <input
                                        type="text"
                                        name="name"
                                        value={formData.name}
                                        onChange={handleChange}
                                        required
                                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500 p-2 border"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Email</label>
                                    <input
                                        type="email"
                                        name="email"
                                        value={formData.email}
                                        onChange={handleChange}
                                        required
                                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500 p-2 border"
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Subject</label>
                                <input
                                    type="text"
                                    name="subject"
                                    value={formData.subject}
                                    onChange={handleChange}
                                    required
                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500 p-2 border"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Message</label>
                                <textarea
                                    name="message"
                                    value={formData.message}
                                    onChange={handleChange}
                                    required
                                    rows="5"
                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500 p-2 border"
                                ></textarea>
                            </div>

                            <button
                                type="submit"
                                disabled={status === 'sending'}
                                className={`w-full py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition ${status === 'sending' ? 'opacity-70 cursor-not-allowed' : ''}`}
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
