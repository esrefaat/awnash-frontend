'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useTranslation } from 'react-i18next';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faSearch,
  faFilter,
  faCalendarAlt,
  faUser,
  faEye,
  faShare,
  faTags,
  faLanguage,
  faArrowRight,
  faGlobe,
  faNewspaper,
  faClock,
  faFire,
  faBookOpen,
  faLightbulb,
  faChartLine,
  faAward,
  faUsers,
  faChevronRight,
  faQuoteLeft,
  faPlay
} from '@fortawesome/free-solid-svg-icons';
import Link from 'next/link';
import { authenticatedGet } from '@/lib/apiUtils';
import { Button } from '@/components/ui/Button';

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

const ArticlesLandingPage: React.FC = () => {
  const router = useRouter();
  const { t, i18n } = useTranslation();
  const isRTL = i18n.language === 'ar';
  
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [selectedLanguage, setSelectedLanguage] = useState<string>('');
  const [sortBy, setSortBy] = useState<'publishDate' | 'viewCount' | 'featured'>('publishDate');

  useEffect(() => {
    const fetchArticles = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const result = await authenticatedGet('/content/articles') as any;
        if (result.success && result.data) {
          // Filter only published articles for public view
          const publishedArticles = result.data.articles?.filter((article: Article) => 
            article.status === 'published'
          ) || [];
          setArticles(publishedArticles);
        } else {
          setError(isRTL ? 'فشل في تحميل المقالات' : 'Failed to load articles');
        }
      } catch (err: any) {
        console.error('Error fetching articles:', err);
        setError(err.message || (isRTL ? 'خطأ في تحميل المقالات' : 'Failed to load articles'));
      } finally {
        setLoading(false);
      }
    };

    fetchArticles();
  }, [isRTL]);

  const filteredArticles = articles.filter(article => {
    if (searchTerm && !article.title.toLowerCase().includes(searchTerm.toLowerCase()) &&
        !article.excerpt.toLowerCase().includes(searchTerm.toLowerCase())) return false;
    if (selectedCategory && !article.category.includes(selectedCategory)) return false;
    if (selectedLanguage && article.language !== selectedLanguage) return false;
    return true;
  });

  const sortedArticles = [...filteredArticles].sort((a, b) => {
    if (sortBy === 'featured') {
      if (a.featured && !b.featured) return -1;
      if (!a.featured && b.featured) return 1;
    }
    
    let aValue, bValue;
    switch (sortBy) {
      case 'publishDate':
        aValue = new Date(a.publishDate).getTime();
        bValue = new Date(b.publishDate).getTime();
        break;
      case 'viewCount':
        aValue = a.viewCount;
        bValue = b.viewCount;
        break;
      default:
        return 0;
    }
    return bValue - aValue; // Always descending for landing page
  });

  const featuredArticles = articles.filter(article => article.featured).slice(0, 3);
  const categories = [...new Set(articles.flatMap(article => article.category))];

  if (loading) {
    return (
      <div className={`min-h-screen bg-gray-50 dark:bg-background flex items-center justify-center ${isRTL ? 'font-arabic' : 'font-montserrat'}`} dir={isRTL ? 'rtl' : 'ltr'}>
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-awnash-primary mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-muted-foreground">{isRTL ? 'جاري تحميل المقالات...' : 'Loading articles...'}</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`min-h-screen bg-gray-50 dark:bg-background flex items-center justify-center ${isRTL ? 'font-arabic' : 'font-montserrat'}`} dir={isRTL ? 'rtl' : 'ltr'}>
        <div className="text-center">
          <h1 className="text-4xl font-bold text-gray-800 dark:text-foreground mb-4">
            {isRTL ? 'خطأ' : 'Error'}
          </h1>
          <p className="text-gray-600 dark:text-muted-foreground mb-6">{error}</p>
          <Button 
            onClick={() => window.location.reload()}
            variant="default"
          >
            {isRTL ? 'إعادة المحاولة' : 'Try Again'}
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen bg-white dark:bg-card ${isRTL ? 'font-arabic' : 'font-montserrat'}`} dir={isRTL ? 'rtl' : 'ltr'}>
      {/* Navigation Header */}
      <nav className="bg-white dark:bg-card shadow-sm border-b dark:border-border sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-8">
              <Link href="/" className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-awnash-primary to-awnash-accent rounded-xl flex items-center justify-center">
                  <span className="text-black dark:text-foreground font-bold text-xl">A</span>
                </div>
                <span className="text-2xl font-bold text-gray-900 dark:text-foreground">Awnash</span>
              </Link>
              <div className="hidden md:flex items-center gap-6">
                <Link href="/equipment" className="text-gray-600 dark:text-muted-foreground hover:text-awnash-primary transition-colors">
                  {isRTL ? 'المعدات' : 'Equipment'}
                </Link>
                <Link href="/services" className="text-gray-600 dark:text-muted-foreground hover:text-awnash-primary transition-colors">
                  {isRTL ? 'الخدمات' : 'Services'}
                </Link>
                <Link href="/articles" className="text-awnash-primary font-semibold">
                  {isRTL ? 'المقالات' : 'Articles'}
                </Link>
                <Link href="/contact" className="text-gray-600 dark:text-muted-foreground hover:text-awnash-primary transition-colors">
                  {isRTL ? 'اتصل بنا' : 'Contact'}
                </Link>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <button 
                onClick={() => i18n.changeLanguage(isRTL ? 'en' : 'ar')}
                className="text-gray-600 dark:text-muted-foreground hover:text-awnash-primary transition-colors"
              >
                {isRTL ? 'English' : 'العربية'}
              </button>
              <Link
                href="/auth/login"
                className="bg-awnash-primary text-black dark:text-foreground px-6 py-2 rounded-full font-semibold hover:bg-awnash-primary-hover transition-colors"
              >
                {isRTL ? 'تسجيل الدخول' : 'Login'}
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-gray-900 via-gray-800 to-black text-white py-20 lg:py-32 overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0" style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.1'%3E%3Ccircle cx='30' cy='30' r='2'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          }} />
        </div>
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-4xl mx-auto">
            <div className="inline-flex items-center gap-2 bg-awnash-primary/20 text-awnash-primary px-4 py-2 rounded-full text-sm font-semibold mb-6">
              <FontAwesomeIcon icon={faBookOpen} className="h-4 w-4" />
              {isRTL ? 'مركز المعرفة' : 'Knowledge Hub'}
            </div>
            
            <h1 className="text-5xl md:text-7xl font-bold mb-6 bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
              {isRTL ? 'تعلم من الخبراء' : 'Learn from Experts'}
            </h1>
            
            <p className="text-xl md:text-2xl mb-8 text-gray-300 leading-relaxed">
              {isRTL 
                ? 'اكتشف أحدث الاتجاهات والتقنيات في عالم تأجير المعدات الإنشائية من خلال مقالاتنا المتخصصة'
                : 'Discover the latest trends and technologies in construction equipment rental through our expert articles'
              }
            </p>
            
            <div className="flex flex-wrap items-center justify-center gap-8 text-lg mb-12">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-awnash-primary/20 rounded-full flex items-center justify-center">
                  <FontAwesomeIcon icon={faNewspaper} className="h-6 w-6 text-awnash-primary" />
                </div>
                <div>
                  <div className="text-2xl font-bold text-white">{articles.length}+</div>
                  <div className="text-sm text-gray-400">{isRTL ? 'مقال متخصص' : 'Expert Articles'}</div>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-awnash-primary/20 rounded-full flex items-center justify-center">
                  <FontAwesomeIcon icon={faGlobe} className="h-6 w-6 text-awnash-primary" />
                </div>
                <div>
                  <div className="text-2xl font-bold text-white">2</div>
                  <div className="text-sm text-gray-400">{isRTL ? 'لغة' : 'Languages'}</div>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-awnash-primary/20 rounded-full flex items-center justify-center">
                  <FontAwesomeIcon icon={faUsers} className="h-6 w-6 text-awnash-primary" />
                </div>
                <div>
                  <div className="text-2xl font-bold text-white">10K+</div>
                  <div className="text-sm text-gray-400">{isRTL ? 'قارئ شهرياً' : 'Monthly Readers'}</div>
                </div>
              </div>
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Button 
                onClick={() => document.getElementById('articles-section')?.scrollIntoView({ behavior: 'smooth' })}
                variant="default"
                size="lg"
                className="rounded-full font-bold text-lg transform hover:scale-105 shadow-lg"
              >
                {isRTL ? 'استكشف المقالات' : 'Explore Articles'}
                <FontAwesomeIcon icon={faChevronRight} className={`h-5 w-5 ${isRTL ? 'mr-2' : 'ml-2'}`} />
              </Button>
              <Button variant="outline" size="lg" className="rounded-full font-bold text-lg border-2 border-white dark:border-border text-white hover:bg-white dark:hover:bg-muted hover:text-black dark:hover:text-white">
                <FontAwesomeIcon icon={faPlay} className={`h-5 w-5 ${isRTL ? 'ml-2' : 'mr-2'}`} />
                {isRTL ? 'شاهد الفيديو' : 'Watch Video'}
              </Button>
            </div>
          </div>
        </div>
        
        {/* Floating Elements */}
        <div className="absolute top-20 left-10 w-20 h-20 bg-awnash-primary/10 rounded-full blur-xl animate-pulse"></div>
        <div className="absolute bottom-20 right-10 w-32 h-32 bg-awnash-accent/10 rounded-full blur-xl animate-pulse delay-1000"></div>
      </section>

      {/* Featured Articles */}
      {featuredArticles.length > 0 && (
        <section className="py-20 bg-gray-50 dark:bg-background">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <div className="inline-flex items-center gap-2 bg-awnash-primary/10 text-awnash-primary px-4 py-2 rounded-full text-sm font-semibold mb-4">
                <FontAwesomeIcon icon={faFire} className="h-4 w-4" />
                {isRTL ? 'الأكثر قراءة' : 'Most Popular'}
              </div>
              <h2 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-foreground mb-4">
                {isRTL ? 'المقالات المميزة' : 'Featured Articles'}
              </h2>
              <p className="text-xl text-gray-600 dark:text-muted-foreground max-w-3xl mx-auto">
                {isRTL 
                  ? 'اكتشف أهم المقالات التي يقرأها المتخصصون في صناعة تأجير المعدات'
                  : 'Discover the most important articles read by professionals in the equipment rental industry'
                }
              </p>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {featuredArticles.map((article, index) => (
                <article 
                  key={article.id} 
                  className={`group relative bg-white dark:bg-card rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2 ${
                    index === 0 ? 'lg:col-span-2 lg:row-span-2' : ''
                  }`}
                >
                  {article.coverImage && (
                    <div className={`relative overflow-hidden ${index === 0 ? 'h-64 lg:h-80' : 'h-48'}`}>
                      <img 
                        src={article.coverImage} 
                        alt={article.title}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                      <div className="absolute top-4 left-4">
                        <span className="inline-flex items-center gap-1 bg-awnash-primary text-black dark:text-foreground px-3 py-1 rounded-full text-xs font-bold">
                          <FontAwesomeIcon icon={faAward} className="h-3 w-3" />
                          {isRTL ? 'مميز' : 'Featured'}
                        </span>
                      </div>
                      <div className="absolute bottom-4 left-4 right-4">
                        <div className="flex items-center gap-2 text-white/80 text-sm mb-2">
                          <FontAwesomeIcon icon={faLanguage} className="h-4 w-4" />
                          <span>{article.language === 'ar' ? 'العربية' : 'English'}</span>
                          <span>•</span>
                          <FontAwesomeIcon icon={faCalendarAlt} className="h-4 w-4" />
                          <span>{new Date(article.publishDate).toLocaleDateString(isRTL ? 'ar' : 'en')}</span>
                        </div>
                      </div>
                    </div>
                  )}
                  
                  <div className={`p-6 ${index === 0 ? 'lg:p-8' : ''}`}>
                    <h3 className={`font-bold text-gray-900 dark:text-foreground mb-3 line-clamp-2 group-hover:text-awnash-primary transition-colors ${
                      index === 0 ? 'text-2xl lg:text-3xl' : 'text-xl'
                    }`} dir={article.language === 'ar' ? 'rtl' : 'ltr'}>
                      {article.title}
                    </h3>

                    <p className={`text-gray-600 dark:text-muted-foreground mb-4 line-clamp-3 ${
                      index === 0 ? 'text-lg' : 'text-base'
                    }`} dir={article.language === 'ar' ? 'rtl' : 'ltr'}>
                      {article.excerpt}
                    </p>
                    
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4 text-sm text-gray-500 dark:text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <FontAwesomeIcon icon={faEye} className="h-4 w-4" />
                          <span>{article.viewCount.toLocaleString()}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <FontAwesomeIcon icon={faShare} className="h-4 w-4" />
                          <span>{article.shareCount}</span>
                        </div>
                      </div>
                      <Button
                        onClick={() => window.open(`/articles/${article.slug}`, '_blank')}
                        variant="link"
                        className="inline-flex items-center text-awnash-primary hover:text-awnash-accent font-semibold group p-0"
                      >
                        {isRTL ? 'اقرأ المزيد' : 'Read More'}
                        <FontAwesomeIcon 
                          icon={faArrowRight} 
                          className={`h-4 w-4 ${isRTL ? 'mr-2 rotate-180' : 'ml-2'} group-hover:translate-x-1 transition-transform`} 
                        />
                      </Button>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Search and Filters */}
      <section id="articles-section" className="py-12 bg-white dark:bg-card border-t dark:border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-gradient-to-r from-gray-50 to-gray-100 dark:from-background dark:to-card rounded-2xl p-8 shadow-inner">
            <div className="text-center mb-8">
              <h3 className="text-2xl font-bold text-gray-900 dark:text-foreground mb-2">
                {isRTL ? 'ابحث في مكتبة المعرفة' : 'Search Our Knowledge Library'}
              </h3>
              <p className="text-gray-600 dark:text-muted-foreground">
                {isRTL ? 'اعثر على المقال المناسب لاحتياجاتك' : 'Find the perfect article for your needs'}
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Search */}
              <div className="relative group">
                <FontAwesomeIcon 
                  icon={faSearch} 
                  className={`absolute top-4 h-5 w-5 text-gray-400 group-focus-within:text-awnash-primary transition-colors ${isRTL ? 'right-4' : 'left-4'}`} 
                />
                <input
                  type="text"
                  placeholder={isRTL ? "البحث في المقالات..." : "Search articles..."}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className={`w-full bg-white dark:bg-card border-2 border-gray-200 dark:border-border rounded-xl py-3 text-sm text-gray-900 dark:text-foreground focus:border-awnash-primary focus:outline-none focus:ring-0 transition-colors shadow-sm ${isRTL ? 'pr-12 pl-4' : 'pl-12 pr-4'}`}
                />
              </div>

              {/* Category Filter */}
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="bg-white dark:bg-card border-2 border-gray-200 dark:border-border rounded-xl px-4 py-3 text-sm text-gray-900 dark:text-foreground focus:border-awnash-primary focus:outline-none focus:ring-0 transition-colors shadow-sm"
              >
                <option value="">{isRTL ? 'جميع الفئات' : 'All Categories'}</option>
                {categories.map(category => (
                  <option key={category} value={category}>{category}</option>
                ))}
              </select>

              {/* Language Filter */}
              <select
                value={selectedLanguage}
                onChange={(e) => setSelectedLanguage(e.target.value)}
                className="bg-white dark:bg-card border-2 border-gray-200 dark:border-border rounded-xl px-4 py-3 text-sm text-gray-900 dark:text-foreground focus:border-awnash-primary focus:outline-none focus:ring-0 transition-colors shadow-sm"
              >
                <option value="">{isRTL ? 'جميع اللغات' : 'All Languages'}</option>
                <option value="en">English</option>
                <option value="ar">العربية</option>
              </select>

              {/* Sort */}
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="bg-white dark:bg-card border-2 border-gray-200 dark:border-border rounded-xl px-4 py-3 text-sm text-gray-900 dark:text-foreground focus:border-awnash-primary focus:outline-none focus:ring-0 transition-colors shadow-sm"
              >
                <option value="publishDate">{isRTL ? 'الأحدث' : 'Latest'}</option>
                <option value="viewCount">{isRTL ? 'الأكثر مشاهدة' : 'Most Viewed'}</option>
                <option value="featured">{isRTL ? 'المميزة أولاً' : 'Featured First'}</option>
              </select>
            </div>
          </div>
        </div>
      </section>

      {/* Articles Grid */}
      <section className="py-20 bg-gray-50 dark:bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-12">
            <div>
              <h2 className="text-4xl font-bold text-gray-900 dark:text-foreground mb-2">
                {isRTL ? 'جميع المقالات' : 'All Articles'}
              </h2>
              <p className="text-gray-600 dark:text-muted-foreground">
                {isRTL ? 'استكشف مجموعتنا الكاملة من المقالات المتخصصة' : 'Explore our complete collection of expert articles'}
              </p>
            </div>
            <div className="text-right">
              <div className="text-3xl font-bold text-awnash-primary">{sortedArticles.length}</div>
              <div className="text-sm text-gray-500 dark:text-muted-foreground">{isRTL ? 'مقال متاح' : 'Articles Available'}</div>
            </div>
          </div>

          {sortedArticles.length === 0 ? (
            <div className="text-center py-20">
              <div className="w-24 h-24 bg-gray-200 dark:bg-muted rounded-full flex items-center justify-center mx-auto mb-6">
                <FontAwesomeIcon icon={faNewspaper} className="h-12 w-12 text-gray-400" />
              </div>
              <h3 className="text-2xl font-bold text-gray-600 dark:text-muted-foreground mb-4">
                {isRTL ? 'لا توجد مقالات' : 'No Articles Found'}
              </h3>
              <p className="text-gray-500 dark:text-muted-foreground text-lg max-w-md mx-auto">
                {isRTL ? 'لم يتم العثور على مقالات تطابق البحث المحدد. جرب تغيير المرشحات.' : 'No articles found matching your search criteria. Try adjusting your filters.'}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {sortedArticles.map((article) => (
                <article key={article.id} className="group bg-white dark:bg-card rounded-2xl shadow-sm hover:shadow-xl transition-all duration-500 border dark:border-border overflow-hidden transform hover:-translate-y-1">
                  {article.coverImage && (
                    <div className="relative h-48 overflow-hidden">
                      <img 
                        src={article.coverImage} 
                        alt={article.title}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                      {article.featured && (
                        <div className="absolute top-3 right-3">
                          <span className="inline-flex items-center gap-1 bg-awnash-primary text-black dark:text-foreground px-2 py-1 rounded-full text-xs font-bold">
                            <FontAwesomeIcon icon={faFire} className="h-3 w-3" />
                            {isRTL ? 'مميز' : 'Featured'}
                          </span>
                        </div>
                      )}
                    </div>
                  )}
                  
                  <div className="p-6">
                    <div className="flex items-center gap-2 mb-3">
                      <FontAwesomeIcon icon={faLanguage} className="h-4 w-4 text-gray-400" />
                      <span className="text-sm text-gray-500 dark:text-muted-foreground">
                        {article.language === 'ar' ? 'العربية' : 'English'}
                      </span>
                      <span className="text-gray-300 dark:text-muted-foreground">•</span>
                      <FontAwesomeIcon icon={faUser} className="h-4 w-4 text-gray-400" />
                      <span className="text-sm text-gray-500 dark:text-muted-foreground">{article.author}</span>
                    </div>

                    <div className="flex flex-wrap gap-2 mb-4">
                      {article.category.slice(0, 2).map((cat, index) => (
                        <span 
                          key={index}
                          className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-awnash-primary/10 text-awnash-primary"
                        >
                          {cat}
                        </span>
                      ))}
                      {article.category.length > 2 && (
                        <span className="text-xs text-gray-400 dark:text-muted-foreground px-2 py-1">
                          +{article.category.length - 2} more
                        </span>
                      )}
                    </div>

                    <h3 className="text-xl font-bold text-gray-900 dark:text-foreground mb-3 line-clamp-2 group-hover:text-awnash-primary transition-colors" dir={article.language === 'ar' ? 'rtl' : 'ltr'}>
                      {article.title}
                    </h3>

                    <p className="text-gray-600 dark:text-muted-foreground mb-6 line-clamp-3 leading-relaxed" dir={article.language === 'ar' ? 'rtl' : 'ltr'}>
                      {article.excerpt}
                    </p>

                    <div className="flex items-center justify-between pt-4 border-t border-gray-100 dark:border-border">
                      <div className="flex items-center gap-4 text-sm text-gray-500 dark:text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <FontAwesomeIcon icon={faCalendarAlt} className="h-4 w-4" />
                          <span>{new Date(article.publishDate).toLocaleDateString(isRTL ? 'ar' : 'en')}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <FontAwesomeIcon icon={faEye} className="h-4 w-4" />
                          <span>{article.viewCount.toLocaleString()}</span>
                        </div>
                      </div>
                      <Button
                        onClick={() => window.open(`/articles/${article.slug}`, '_blank')}
                        variant="link"
                        className="inline-flex items-center text-awnash-primary hover:text-awnash-accent font-semibold group p-0"
                      >
                        {isRTL ? 'اقرأ المزيد' : 'Read More'}
                        <FontAwesomeIcon 
                          icon={faArrowRight} 
                          className={`h-4 w-4 ${isRTL ? 'mr-2 rotate-180' : 'ml-2'} group-hover:translate-x-1 transition-transform`} 
                        />
                      </Button>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Newsletter Section */}
      <section className="py-20 bg-gradient-to-br from-gray-900 to-black text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-flex items-center gap-2 bg-awnash-primary/20 text-awnash-primary px-4 py-2 rounded-full text-sm font-semibold mb-6">
            <FontAwesomeIcon icon={faLightbulb} className="h-4 w-4" />
            {isRTL ? 'ابق على اطلاع' : 'Stay Updated'}
          </div>
          
          <h2 className="text-4xl md:text-5xl font-bold mb-6">
            {isRTL ? 'اشترك في نشرتنا الإخبارية' : 'Subscribe to Our Newsletter'}
          </h2>
          
          <p className="text-xl text-gray-300 mb-8 leading-relaxed">
            {isRTL 
              ? 'احصل على أحدث المقالات والنصائح المتخصصة في تأجير المعدات مباشرة في بريدك الإلكتروني'
              : 'Get the latest articles and expert tips on equipment rental delivered straight to your inbox'
            }
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto">
            <input
              type="email"
              placeholder={isRTL ? 'أدخل بريدك الإلكتروني' : 'Enter your email'}
              className="flex-1 px-6 py-4 rounded-full text-black dark:text-foreground bg-white dark:bg-card focus:outline-none focus:ring-2 focus:ring-awnash-primary"
            />
            <Button variant="default" size="lg" className="rounded-full font-bold whitespace-nowrap">
              {isRTL ? 'اشترك الآن' : 'Subscribe Now'}
            </Button>
          </div>
          
          <p className="text-sm text-gray-400 mt-4">
            {isRTL ? 'لن نشارك بريدك الإلكتروني مع أي طرف ثالث' : 'We never share your email with third parties'}
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-black text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="col-span-1 md:col-span-2">
              <Link href="/" className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 bg-gradient-to-br from-awnash-primary to-awnash-accent rounded-xl flex items-center justify-center">
                  <span className="text-black dark:text-foreground font-bold text-2xl">A</span>
                </div>
                <span className="text-3xl font-bold">Awnash</span>
              </Link>
              <p className="text-gray-400 text-lg leading-relaxed mb-6">
                {isRTL 
                  ? 'منصة أونش الرائدة في تأجير المعدات الإنشائية في المملكة العربية السعودية. نوفر حلولاً متكاملة لجميع احتياجاتك من المعدات.'
                  : 'Awnash is the leading construction equipment rental platform in Saudi Arabia. We provide comprehensive solutions for all your equipment needs.'
                }
              </p>
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2 text-awnash-primary">
                  <FontAwesomeIcon icon={faChartLine} className="h-5 w-5" />
                  <span className="font-semibold">{isRTL ? 'نمو مستمر' : 'Growing Fast'}</span>
                </div>
                <div className="flex items-center gap-2 text-awnash-primary">
                  <FontAwesomeIcon icon={faAward} className="h-5 w-5" />
                  <span className="font-semibold">{isRTL ? 'جودة عالية' : 'High Quality'}</span>
                </div>
              </div>
            </div>
            
            <div>
              <h3 className="text-xl font-bold mb-6">{isRTL ? 'روابط سريعة' : 'Quick Links'}</h3>
              <ul className="space-y-3">
                <li><Link href="/equipment" className="text-gray-400 hover:text-awnash-primary transition-colors">{isRTL ? 'المعدات' : 'Equipment'}</Link></li>
                <li><Link href="/services" className="text-gray-400 hover:text-awnash-primary transition-colors">{isRTL ? 'الخدمات' : 'Services'}</Link></li>
                <li><Link href="/articles" className="text-gray-400 hover:text-awnash-primary transition-colors">{isRTL ? 'المقالات' : 'Articles'}</Link></li>
                <li><Link href="/about" className="text-gray-400 hover:text-awnash-primary transition-colors">{isRTL ? 'من نحن' : 'About Us'}</Link></li>
              </ul>
            </div>
            
            <div>
              <h3 className="text-xl font-bold mb-6">{isRTL ? 'تواصل معنا' : 'Contact Us'}</h3>
              <ul className="space-y-3 text-gray-400">
                <li>{isRTL ? 'الرياض، المملكة العربية السعودية' : 'Riyadh, Saudi Arabia'}</li>
                <li>+966 11 123 4567</li>
                <li>info@awnash.com</li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-gray-800 mt-12 pt-8 flex flex-col md:flex-row items-center justify-between">
            <p className="text-gray-400 text-center md:text-left">
              © 2024 Awnash. {isRTL ? 'جميع الحقوق محفوظة.' : 'All rights reserved.'}
            </p>
            <div className="flex items-center gap-6 mt-4 md:mt-0">
              <Link href="/privacy" className="text-gray-400 hover:text-awnash-primary transition-colors">
                {isRTL ? 'سياسة الخصوصية' : 'Privacy Policy'}
              </Link>
              <Link href="/terms" className="text-gray-400 hover:text-awnash-primary transition-colors">
                {isRTL ? 'الشروط والأحكام' : 'Terms of Service'}
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default ArticlesLandingPage;
