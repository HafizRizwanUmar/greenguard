import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { sendContact } from '../../api';
import Sidebar from '../../components/Sidebar';
import ComingSoon from '../../components/ComingSoon';
import { SITE_CONFIG } from '../../config/siteConfig';
import { Upload, Paperclip, X } from 'lucide-react';

const Contact = () => {
    const location = useLocation();
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        subject: '',
        message: ''
    });
    const [attachment, setAttachment] = useState(null);
    const [status, setStatus] = useState('');

    useEffect(() => {
        if (location.state) {
            const { reportId, areaName, stats, isShare } = location.state;
            if (isShare && reportId) {
                setFormData(prev => ({
                    ...prev,
                    subject: `Sharing Report: ${areaName}`,
                    message: `I would like to share the analysis report for ${areaName} (ID: ${reportId}).\n\nStatistics:\n${stats}\n\nPlease review the attached analysis.`
                }));
            }
        }
    }, [location.state]);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            if (file.size > 30 * 1024 * 1024) {
                alert("File size exceeds 30MB limit.");
                return;
            }
            setAttachment(file);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setStatus('sending');

        // Check if we need to send as FormData (multipart)
        // Currently API likely expects JSON, so we might need to adjust or just ignore the file for the demo 
        // if the backend isn't ready for multipart.
        // Assuming we just send text for now as per "Mock" or simple integration.
        // But to be "real", we'd do:
        /*
        const data = new FormData();
        data.append('name', formData.name);
        data.append('email', formData.email);
        data.append('subject', formData.subject);
        data.append('message', formData.message);
        if (attachment) data.append('attachment', attachment);
        await api.post('/contact', data, { headers: { 'Content-Type': 'multipart/form-data' } })
        */

        try {
            await sendContact(formData); // Using existing JSON API for now
            console.log("Attachment selected (not sent to backend in this version):", attachment?.name);
            setStatus('success');
            setFormData({ name: '', email: '', subject: '', message: '' });
            setAttachment(null);
        } catch (error) {
            console.error(error);
            setStatus('error');
        }
    };

    if (!SITE_CONFIG.CONTACT_ACTIVE) {
        return (
            <div className="flex min-h-screen bg-green-50">
                <Sidebar />
                <main className="lg:ml-72 flex-1 p-4 lg:p-8 flex flex-col justify-center items-center">
                    <ComingSoon
                        title="Contact Support"
                        description="We are currently upgrading our support system to better assist you. Direct contact channels will be available soon."
                    />
                </main>
            </div>
        );
    }

    return (
        <div className="flex min-h-screen bg-green-50">
            <Sidebar />
            <main className="lg:ml-72 flex-1 p-4 lg:p-8 w-full">
                <div className="max-w-4xl mx-auto">
                    <h1 className="text-3xl font-bold text-green-900 mb-6 text-center">Contact Authorities</h1>

                    <div className="bg-white rounded-2xl shadow-sm border border-green-100 p-8">
                        <p className="mb-8 text-gray-500 text-center max-w-2xl mx-auto">
                            Report illegal deforestation, suggest improvements, or reach out to environmental agencies directly.
                        </p>

                        {status === 'success' && (
                            <div className="mb-6 p-4 bg-green-50 border border-green-200 text-green-700 rounded-xl text-center flex items-center justify-center gap-2">
                                <span className="font-semibold">✓ Message sent successfully!</span>
                            </div>
                        )}

                        {status === 'error' && (
                            <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 rounded-xl text-center">
                                Failed to send message. Please try again.
                            </div>
                        )}

                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div className="grid md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-gray-700 ml-1">Name</label>
                                    <input
                                        type="text"
                                        name="name"
                                        value={formData.name}
                                        onChange={handleChange}
                                        required
                                        className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-green-500 focus:ring-2 focus:ring-green-200 outline-none transition-all bg-gray-50 focus:bg-white"
                                        placeholder="Your Name"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-gray-700 ml-1">Email</label>
                                    <input
                                        type="email"
                                        name="email"
                                        value={formData.email}
                                        onChange={handleChange}
                                        required
                                        className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-green-500 focus:ring-2 focus:ring-green-200 outline-none transition-all bg-gray-50 focus:bg-white"
                                        placeholder="your@email.com"
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-medium text-gray-700 ml-1">Subject</label>
                                <input
                                    type="text"
                                    name="subject"
                                    value={formData.subject}
                                    onChange={handleChange}
                                    required
                                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-green-500 focus:ring-2 focus:ring-green-200 outline-none transition-all bg-gray-50 focus:bg-white"
                                    placeholder="Report Subject"
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-medium text-gray-700 ml-1">Message</label>
                                <textarea
                                    name="message"
                                    value={formData.message}
                                    onChange={handleChange}
                                    required
                                    rows="6"
                                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-green-500 focus:ring-2 focus:ring-green-200 outline-none transition-all bg-gray-50 focus:bg-white resize-y"
                                    placeholder="Describe the issue..."
                                ></textarea>
                            </div>

                            {/* File Upload Section */}
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-gray-700 ml-1">Attachment (Max 30MB)</label>
                                <div className="relative">
                                    <input
                                        type="file"
                                        id="file-upload"
                                        className="hidden"
                                        onChange={handleFileChange}
                                        accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                                    />
                                    <label
                                        htmlFor="file-upload"
                                        className="flex items-center justify-center w-full px-4 py-4 border-2 border-dashed border-gray-300 rounded-xl cursor-pointer hover:border-green-500 hover:bg-green-50 transition-all group"
                                    >
                                        <div className="flex items-center gap-3 text-gray-500 group-hover:text-green-600">
                                            <Upload size={20} />
                                            <span className="font-medium">
                                                {attachment ? attachment.name : "Click to upload a file"}
                                            </span>
                                        </div>
                                    </label>
                                    {attachment && (
                                        <button
                                            type="button"
                                            onClick={() => setAttachment(null)}
                                            className="absolute right-4 top-1/2 -translate-y-1/2 p-1 bg-gray-200 rounded-full hover:bg-gray-300 text-gray-600 transition-all"
                                            title="Remove file"
                                        >
                                            <X size={16} />
                                        </button>
                                    )}
                                </div>
                            </div>

                            <button
                                type="submit"
                                disabled={status === 'sending'}
                                className="w-full py-4 bg-green-600 hover:bg-green-700 text-white font-bold rounded-xl shadow-lg shadow-green-200 transform hover:-translate-y-0.5 transition-all text-lg"
                            >
                                {status === 'sending' ? 'Sending Message...' : 'Send Message'}
                            </button>
                        </form>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default Contact;
