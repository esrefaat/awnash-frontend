'use client';

import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { useTranslation } from 'react-i18next';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faCalendarAlt,
  faUser,
  faEye,
  faShare,
  faTags,
  faArrowLeft,
  faLanguage
} from '@fortawesome/free-solid-svg-icons';
import Link from 'next/link';
import { authenticatedGet } from '@/lib/apiUtils';

interface Article {
  id: string;
  title: string;
  subtitle?: string;
  slug: string;
  author: string;
  authorId: string;
  status: 'draft' | 'published' | 'scheduled';
  category: string[];
  language: 'en' | 'ar';
  publishDate: string;
  scheduledDate?: string;
  coverImage?: string;
  imageCaption?: string;
  excerpt: string;
  content: string;
  metaTitle?: string;
  metaDescription?: string;
  ogImage?: string;
  viewCount: number;
  shareCount: number;
  createdAt: string;
  updatedAt: string;
  featured: boolean;
  tags?: string[];
}

const ArticlePreviewPage: React.FC = () => {
  const params = useParams();
  const { t, i18n } = useTranslation();
  const isRTL = i18n.language === 'ar';
  
  const [article, setArticle] = useState<Article | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);


  useEffect(() => {
    const loadArticle = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Try to fetch from API first
        try {
          const result = await authenticatedGet(`/content/articles/slug/${params?.slug}`) as any;
          if (result?.success && result?.data) {
            setArticle(result.data);
            return;
          }
        } catch (apiError) {
          console.log('API fetch failed, trying mock data:', apiError);
        }
        
        // If API fails, show error
        setError(isRTL ? 'المقال غير موجود' : 'Article not found');
      } catch (err: any) {
        console.error('Error loading article:', err);
        setError(err.message || (isRTL ? 'خطأ في تحميل المقال' : 'Failed to load article'));
      } finally {
        setLoading(false);
      }
    };

    if (params?.slug) {
      loadArticle();
    }
  }, [params?.slug, isRTL]);

  if (loading) {
    return (
      <div className={`min-h-screen bg-gray-50 flex items-center justify-center ${isRTL ? 'font-arabic' : 'font-montserrat'}`} dir={isRTL ? 'rtl' : 'ltr'}>
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-awnash-primary mx-auto mb-4"></div>
          <p className="text-gray-600">{isRTL ? 'جاري تحميل المقال...' : 'Loading article...'}</p>
        </div>
      </div>
    );
  }

  if (error || !article) {
    return (
      <div className={`min-h-screen bg-gray-50 flex items-center justify-center ${isRTL ? 'font-arabic' : 'font-montserrat'}`} dir={isRTL ? 'rtl' : 'ltr'}>
        <div className="text-center">
          <h1 className="text-4xl font-bold text-gray-800 mb-4">404</h1>
          <p className="text-gray-600 mb-6">{error}</p>
          <Link 
            href="/articles"
            className="inline-flex items-center px-4 py-2 bg-awnash-primary text-black rounded-lg hover:bg-awnash-primary-hover transition-colors"
          >
            <FontAwesomeIcon icon={faArrowLeft} className={`h-4 w-4 ${isRTL ? 'ml-2' : 'mr-2'}`} />
            {isRTL ? 'العودة للمقالات' : 'Back to Articles'}
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen bg-white ${isRTL ? 'font-arabic' : 'font-montserrat'}`} dir={isRTL ? 'rtl' : 'ltr'}>
      {/* Navigation Header */}
      <nav className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link 
              href="/articles"
              className="inline-flex items-center text-gray-600 hover:text-awnash-primary transition-colors font-medium"
            >
              <FontAwesomeIcon icon={faArrowLeft} className={`h-4 w-4 ${isRTL ? 'ml-2' : 'mr-2'}`} />
              {isRTL ? 'العودة للمقالات' : 'Back to Articles'}
            </Link>
            
            <div className="flex items-center gap-4">
              <button 
                onClick={() => i18n.changeLanguage(isRTL ? 'en' : 'ar')}
                className="text-gray-600 hover:text-awnash-primary transition-colors"
              >
                {isRTL ? 'English' : 'العربية'}
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Article Content */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8" dir={article.language === 'ar' ? 'rtl' : 'ltr'}>
        {/* Article Header */}
        <header className="py-12 border-b border-gray-200">
          {/* Categories */}
          <div className="flex flex-wrap gap-2 mb-6">
            {article.category.map((cat, index) => (
              <span 
                key={index}
                className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-awnash-primary/10 text-awnash-primary"
              >
                {cat}
              </span>
            ))}
          </div>

          {/* Title */}
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6 leading-tight">
            {article.title}
          </h1>

          {/* Subtitle */}
          {article.subtitle && (
            <p className="text-xl md:text-2xl text-gray-600 mb-8 leading-relaxed">
              {article.subtitle}
            </p>
          )}

          {/* Author and Meta Info */}
          <div className="flex flex-wrap items-center gap-6 text-gray-600">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-awnash-primary/20 rounded-full flex items-center justify-center">
                <FontAwesomeIcon icon={faUser} className="h-5 w-5 text-awnash-primary" />
              </div>
              <div>
                <div className="font-semibold text-gray-900">{article.author}</div>
                <div className="text-sm text-gray-500">
                  {new Date(article.publishDate).toLocaleDateString(isRTL ? 'ar' : 'en', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </div>
              </div>
            </div>
            
            <div className="flex items-center gap-4 text-sm">
              <div className="flex items-center gap-1">
                <FontAwesomeIcon icon={faEye} className="h-4 w-4" />
                <span>{article.viewCount.toLocaleString()}</span>
              </div>
              <div className="flex items-center gap-1">
                <FontAwesomeIcon icon={faLanguage} className="h-4 w-4" />
                <span>{article.language === 'ar' ? 'العربية' : 'English'}</span>
              </div>
            </div>
          </div>

          {/* Tags */}
          {article.tags && article.tags.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-6">
              {article.tags.map((tag, index) => (
                <span 
                  key={index}
                  className="text-sm text-gray-500 hover:text-awnash-primary cursor-pointer transition-colors"
                >
                  #{tag}
                </span>
              ))}
            </div>
          )}
        </header>

        {/* Cover Image */}
        {article.coverImage && (
          <div className="my-12">
            <div className="w-full h-64 md:h-96 overflow-hidden rounded-xl">
              <img 
                src={article.coverImage} 
                alt={article.title}
                className="w-full h-full object-cover"
              />
            </div>
            {article.imageCaption && (
              <p className="text-sm text-gray-500 italic mt-3 text-center">
                {article.imageCaption}
              </p>
            )}
          </div>
        )}

        {/* Article Body */}
        <article className="py-8">
          {/* Excerpt as highlighted intro */}
          <div className="text-xl text-gray-700 mb-12 p-6 bg-gradient-to-r from-awnash-primary/5 to-awnash-accent/5 rounded-xl border-l-4 border-awnash-primary">
            <p className="font-medium leading-relaxed">{article.excerpt}</p>
          </div>

          {/* Content */}
          <div 
            className="article-content-modern"
            dangerouslySetInnerHTML={{ __html: article.content }}
            style={{
              direction: article.language === 'ar' ? 'rtl' : 'ltr'
            }}
          />
        </article>

        {/* Article Footer */}
        <footer className="py-12 border-t border-gray-200">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div className="flex items-center gap-4">
              <div className="text-sm text-gray-500">
                {isRTL ? 'آخر تحديث:' : 'Last updated:'} {new Date(article.updatedAt).toLocaleDateString(isRTL ? 'ar' : 'en')}
              </div>
            </div>
            
            <div className="flex items-center gap-4">
              <button 
                className="inline-flex items-center gap-2 px-4 py-2 bg-awnash-primary text-black rounded-lg hover:bg-awnash-primary-hover transition-colors font-medium"
                onClick={() => {
                  // Increment share count logic here
                  console.log('Share article');
                }}
              >
                <FontAwesomeIcon icon={faShare} className="h-4 w-4" />
                {isRTL ? 'مشاركة المقال' : 'Share Article'}
              </button>
            </div>
          </div>
        </footer>
      </main>
    </div>
  );
};

export default ArticlePreviewPage;
