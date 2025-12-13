import React, { useEffect, useState } from 'react';
import Sidebar from '../../components/Sidebar';
import NewsFeed from '../../components/Dashboard/NewsFeed';
import Button from '../../components/Button';
import { ThumbsUp, MessageSquare, Share2 } from 'lucide-react';
import { fetchPosts, createPost } from '../../api';
import ComingSoon from '../../components/ComingSoon';
import { SITE_CONFIG } from '../../config/siteConfig';

const Community = () => {
    const [posts, setPosts] = useState([]);
    const [newPostContent, setNewPostContent] = useState('');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!SITE_CONFIG.COMMUNITY_ACTIVE) return;

        const loadPosts = async () => {
            try {
                const { data } = await fetchPosts();
                setPosts(data);
            } catch (error) {
                console.error("Failed to fetch posts", error);
            } finally {
                setLoading(false);
            }
        };
        loadPosts();
    }, []);

    const handlePostSubmit = async (e) => {
        if (e.key === 'Enter' && newPostContent.trim()) {
            try {
                // Get user info from localStorage
                const user = JSON.parse(localStorage.getItem('user'));
                if (!user || !user.id) {
                    alert("Please log in to post.");
                    return;
                }

                const newPost = {
                    authorId: user.id,
                    title: "Community Update",
                    content: newPostContent
                };
                const { data } = await createPost(newPost);
                setPosts([data, ...posts]);
                setNewPostContent('');
            } catch (error) {
                console.error("Failed to create post", error);
                alert("Failed to post. Please try again.");
            }
        }
    };

    if (!SITE_CONFIG.COMMUNITY_ACTIVE) {
        return (
            <div className="flex min-h-screen bg-gray-50">
                <Sidebar />
                <main className="lg:ml-[280px] flex-1 p-4 lg:p-8 transition-all">
                    <ComingSoon
                        title="Community Hub"
                        description="Connect with fellow environmentalists, share your analysis reports, and collaborate on preservation efforts. The GreenGuard Community is launching soon."
                    />
                </main>
            </div>
        );
    }

    return (
        <div className="flex min-h-screen bg-gray-100">
            <Sidebar />
            <main className="lg:ml-[280px] flex-1 p-4 lg:p-8 transition-all w-full overflow-hidden">
                <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8">

                    {/* Feed Section */}
                    <div className="lg:col-span-2 space-y-6">
                        <div className="flex justify-between items-center mb-2">
                            <h2 className="text-2xl font-bold text-gray-800">Community Feed</h2>
                            <Button>New Post</Button>
                        </div>

                        {/* Create Post Input */}
                        <div className="bg-white p-4 rounded-xl shadow-sm flex gap-4">
                            <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center text-gg-primary font-bold">
                                me
                            </div>
                            <input
                                type="text"
                                placeholder="Share your analysis or ask a question... (Press Enter)"
                                className="flex-1 bg-gray-50 rounded-lg px-4 focus:outline-none focus:ring-1 focus:ring-gg-primary"
                                value={newPostContent}
                                onChange={(e) => setNewPostContent(e.target.value)}
                                onKeyDown={handlePostSubmit}
                            />
                        </div>

                        {/* Posts */}
                        {loading ? <p>Loading discussions...</p> : posts.map(post => (
                            <div key={post._id} className="bg-white p-6 rounded-xl shadow-sm">
                                <div className="flex items-center gap-3 mb-4">
                                    <div className="w-10 h-10 rounded-full bg-gray-200"></div>
                                    <div>
                                        <h4 className="font-bold text-gray-900">{post.authorId?.name || 'Anonymous user'}</h4>
                                        <p className="text-xs text-gray-500">{new Date(post.date).toLocaleString()}</p>
                                    </div>
                                </div>
                                <p className="text-gray-700 mb-4 leading-relaxed">
                                    {post.content}
                                </p>
                                <div className="flex items-center gap-6 text-gray-500 text-sm border-t pt-4">
                                    <button className="flex items-center gap-2 hover:text-gg-primary transition-colors">
                                        <ThumbsUp size={18} /> {post.likes?.length || 0} Likes
                                    </button>
                                    <button className="flex items-center gap-2 hover:text-gg-primary transition-colors">
                                        <MessageSquare size={18} /> {post.comments?.length || 0} Comments
                                    </button>
                                    <button className="flex items-center gap-2 hover:text-gg-primary transition-colors ml-auto">
                                        <Share2 size={18} /> Share
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Widgets Section */}
                    <div className="lg:col-span-1 space-y-6">
                        <NewsFeed />

                        <div className="bg-gradient-to-br from-gg-dark to-gg-primary rounded-xl p-6 text-white shadow-lg">
                            <h3 className="font-bold text-lg mb-2">Monthly Impact</h3>
                            <p className="text-green-100 text-sm mb-4">Your analysis has contributed to monitoring over 5,000 km² of forest this month.</p>
                            <div className="h-2 bg-white/20 rounded-full overflow-hidden">
                                <div className="h-full bg-white w-[75%]"></div>
                            </div>
                            <p className="text-right text-xs mt-2 font-mono">75% of Goal</p>
                        </div>
                    </div>

                </div>
            </main>
        </div>
    );
};

export default Community;
