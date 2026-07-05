import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { BookOpen, Calendar, Eye, ArrowLeft, Heart, Stethoscope, Apple, AlertTriangle, Activity } from 'lucide-react';

const ArticleDetail = () => {
  const { article_id } = useParams();
  const [article, setArticle] = useState(null);
  const [loading, setLoading] = useState(true);

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

  useEffect(() => {
    const fetchArticle = async () => {
      try {
        const { articleAPI } = await import('../services/api');
        const response = await articleAPI.getArticle(article_id);
        setArticle(response.data);
      } catch (error) {
        console.error('Error fetching article:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchArticle();
  }, [article_id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!article) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="text-center text-gray-500">Article not found.</div>
      </div>
    );
  }

  const Icon = categoryIcons[article.category] || BookOpen;

  return (
    <div className="min-h-screen bg-light py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <Link to="/articles" className="inline-flex items-center text-primary hover:underline mb-8">
          <ArrowLeft className="h-5 w-5 mr-2" />
          Back to Articles
        </Link>

        <article className="bg-white rounded-xl shadow-lg p-8">
          {article.image_url && (
            <img src={article.image_url} alt={article.title} className="w-full h-64 object-cover rounded-lg mb-6" />
          )}

          <div className="flex items-center mb-4">
            <Icon className="h-5 w-5 text-primary mr-2" />
            <span className="text-sm text-gray-600">{categoryLabels[article.category]}</span>
          </div>

          <h1 className="text-4xl font-bold text-gradient mb-4">{article.title}</h1>

          <div className="flex items-center space-x-4 text-sm text-gray-500 mb-6">
            <div className="flex items-center">
              <Calendar className="h-4 w-4 mr-1" />
              {new Date(article.created_at).toLocaleDateString()}
            </div>
            <div className="flex items-center">
              <Eye className="h-4 w-4 mr-1" />
              {article.views} views
            </div>
            <span>By {article.author_name || 'LifeLink Team'}</span>
          </div>

          <div className="prose max-w-none">
            <div className="text-gray-700 leading-relaxed whitespace-pre-line">
              {article.content}
            </div>
          </div>

          <div className="mt-8 pt-6 border-t">
            <Link to="/articles" className="btn-primary inline-block">
              Read More Articles
            </Link>
          </div>
        </article>
      </div>
    </div>
  );
};

export default ArticleDetail;
