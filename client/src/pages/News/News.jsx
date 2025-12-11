import React, { useEffect, useState } from 'react';
import { fetchNews } from '../../api';
import Sidebar from '../../components/Sidebar';

const News = () => {
    const [articles, setArticles] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const getNews = async () => {
            try {
                const { data } = await fetchNews();
                setArticles(data);
            } catch (error) {
                console.error("Failed to fetch news", error);
            } finally {
                setLoading(false);
            }
        };
        getNews();
    }, []);

    return (
        <div style={{ display: 'flex', minHeight: '100vh', background: 'var(--color-bg-body)' }}>
            <Sidebar />
            <main style={{ marginLeft: '280px', flex: 1, padding: '32px' }}>
                <h1 className="text-3xl font-bold text-green-800 mb-6">Forest & Climate News</h1>
                {loading ? (
                    <div className="text-center text-gray-500">Loading Latest Updates...</div>
                ) : (
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {articles.map((article, index) => (
                            <div key={index} className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg transition">
                                <img
                                    src={article.urlToImage || 'https://via.placeholder.com/400x200?text=Forest+News'}
                                    alt={article.title}
                                    className="w-full h-48 object-cover"
                                />
                                <div className="p-4">
                                    <span className="text-xs font-semibold text-green-600 uppercase">
                                        {article.source.name}
                                    </span>
                                    <h2 className="text-xl font-bold mt-2 hover:text-green-700">
                                        <a href={article.url} target="_blank" rel="noopener noreferrer">
                                            {article.title}
                                        </a>
                                    </h2>
                                    <p className="text-gray-600 mt-2 text-sm">
                                        {article.description ? article.description.substring(0, 100) + '...' : ''}
                                    </p>
                                    <div className="mt-4 flex justify-between items-center text-xs text-gray-500">
                                        <span>{new Date(article.publishedAt).toLocaleDateString()}</span>
                                        {article.author && <span>{article.author}</span>}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </main>
        </div>
    );
};

export default News;
