import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { BookOpen, Heart, Stethoscope, Apple, AlertTriangle, Activity, Filter } from 'lucide-react';

const Articles = () => {
  const [articles, setArticles] = useState([]);
  const [filter, setFilter] = useState('');
  const [loading, setLoading] = useState(false);

  const categoryIcons = {
    blood_donation_benefits: Heart,
    medical_health_tips: Stethoscope,
    nutrition_guidelines: Apple,
    emergency_first_aid: AlertTriangle,
    disease_awareness: Activity
  };

  const categoryLabels = {
    blood_donation_benefits: 'Blood Donation Benefits',
    medical_health_tips: 'Medical Health Tips',
    nutrition_guidelines: 'Nutrition Guidelines',
    emergency_first_aid: 'Emergency First Aid',
    disease_awareness: 'Disease Awareness'
  };

  const fetchArticles = async () => {
    setLoading(true);
    try {
      const { articleAPI } = await import('../services/api');
      const response = await articleAPI.getAllArticles(filter ? { category: filter } : {});
      setArticles(response.data);
    } catch (error) {
      console.error('Error fetching articles:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchArticles();
  }, [filter]);

  return (
    <div className="min-h-screen bg-light py-12 px-4">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-4xl font-bold text-dark mb-8">Health Articles</h1>

        <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
          <div className="flex items-center mb-4">
            <Filter className="h-5 w-5 text-primary mr-2" />
            <h2 className="text-xl font-semibold">Filter by Category</h2>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setFilter('')}
              className={`px-4 py-2 rounded-full ${filter === '' ? 'bg-primary text-white' : 'bg-gray-200 text-gray-700'}`}
            >
              All
            </button>
            {Object.entries(categoryLabels).map(([key, label]) => (
              <button
                key={key}
                onClick={() => setFilter(key)}
                className={`px-4 py-2 rounded-full ${filter === key ? 'bg-primary text-white' : 'bg-gray-200 text-gray-700'}`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {articles.map((article) => {
              const Icon = categoryIcons[article.category] || BookOpen;
              return (
                <Link key={article.id} to={`/articles/${article.id}`} className="card group cursor-pointer">
                  {article.image_url && (
                    <img src={article.image_url} alt={article.title} className="w-full h-48 object-cover rounded-lg mb-4" />
                  )}
                  <div className="flex items-center mb-3">
                    <Icon className="h-5 w-5 text-primary mr-2" />
                    <span className="text-sm text-gray-600">{categoryLabels[article.category]}</span>
                  </div>
                  <h3 className="text-xl font-semibold mb-2 group-hover:text-primary transition-colors">{article.title}</h3>
                  <p className="text-gray-600 mb-4 line-clamp-3">{article.content.substring(0, 150)}...</p>
                  <div className="flex justify-between items-center text-sm text-gray-500">
                    <span>{article.author_name || 'LifeLink Team'}</span>
                    <span>{article.views} views</span>
                  </div>
                </Link>
              );
            })}
          </div>
        )}

        {!loading && articles.length === 0 && (
          <div className="text-center py-12 text-gray-500">
            No articles found.
          </div>
        )}
      </div>
    </div>
  );
};

export default Articles;
