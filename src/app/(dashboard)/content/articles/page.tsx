'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useTranslation } from 'react-i18next';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faPlus,
  faEdit,
  faTrash,
  faEye,
  faSearch,
  faFilter,
  faCalendarAlt,
  faGlobe,
  faFileAlt,
  faUser,
  faTags,
  faClock,
  faCheckCircle,
  faTimesCircle,
  faLanguage,
  faImage,
  faExternalLinkAlt,
  faBell,
  faFlag
} from '@fortawesome/free-solid-svg-icons';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/Dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/AlertDialog';
import { cn } from '@/lib/utils';
import { authenticatedGet } from '@/lib/apiUtils';

interface Article {
  id: string;
  title: string;
  slug: string;
  author: string;
  authorId: string;
  status: 'draft' | 'published' | 'scheduled';
  category: string[];
  language: 'en' | 'ar';
  publishDate: string;
  scheduledDate?: string;
  coverImage?: string;
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
}

const ArticlesManagement: React.FC = () => {
  const router = useRouter();
  const { t, i18n } = useTranslation();
  const isRTL = i18n.language === 'ar';
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [selectedLanguage, setSelectedLanguage] = useState<string>('');
  const [selectedAuthor, setSelectedAuthor] = useState<string>('');
  const [dateRange, setDateRange] = useState<{ start: string; end: string }>({
    start: '',
    end: ''
  });
  const [sortBy, setSortBy] = useState<'publishDate' | 'viewCount' | 'created'>('publishDate');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  // Mock articles data
  const mockArticles: Article[] = [
    {
      id: '1',
      title: 'Safety Guidelines for Heavy Equipment Operation',
      slug: 'safety-guidelines-heavy-equipment-operation',
      author: 'Ahmad Al-Rashid',
      authorId: 'admin1',
      status: 'published',
      category: ['Safety', 'Guidelines'],
      language: 'en',
      publishDate: '2024-06-01',
      coverImage: '/images/safety-cover.svg',
      excerpt: 'Essential safety protocols and best practices for operating heavy construction equipment.',
      content: 'Detailed content about safety guidelines...',
      metaTitle: 'Heavy Equipment Safety Guidelines - Awnash',
      metaDescription: 'Learn essential safety protocols for heavy equipment operation. Complete guide for construction professionals.',
      ogImage: '/images/safety-og.jpg',
      viewCount: 1250,
      shareCount: 89,
      createdAt: '2024-05-25',
      updatedAt: '2024-06-01',
      featured: true
    },
    {
      id: '2',
      title: 'إرشادات السلامة لتشغيل المعدات الثقيلة',
      slug: 'safety-guidelines-heavy-equipment-ar',
      author: 'محمد العنزي',
      authorId: 'admin2',
      status: 'published',
      category: ['السلامة', 'الإرشادات'],
      language: 'ar',
      publishDate: '2024-06-02',
      coverImage: '/images/safety-cover-ar.svg',
      excerpt: 'بروتوكولات السلامة الأساسية وأفضل الممارسات لتشغيل معدات البناء الثقيلة.',
      content: 'محتوى مفصل حول إرشادات السلامة...',
      metaTitle: 'إرشادات السلامة للمعدات الثقيلة - أونش',
      metaDescription: 'تعلم بروتوكولات السلامة الأساسية لتشغيل المعدات الثقيلة. دليل شامل للمهنيين في البناء.',
      ogImage: '/images/safety-og-ar.jpg',
      viewCount: 980,
      shareCount: 67,
      createdAt: '2024-05-26',
      updatedAt: '2024-06-02',
      featured: true
    },
    {
      id: '3',
      title: 'Equipment Maintenance Best Practices',
      slug: 'equipment-maintenance-best-practices',
      author: 'Sarah Johnson',
      authorId: 'admin3',
      status: 'draft',
      category: ['Maintenance', 'Tips'],
      language: 'en',
      publishDate: '2024-06-15',
      coverImage: '/images/maintenance-cover.svg',
      excerpt: 'How to maintain your heavy equipment for optimal performance and longevity.',
      content: 'Draft content about maintenance practices...',
      metaTitle: 'Heavy Equipment Maintenance Guide',
      metaDescription: 'Expert tips for maintaining heavy construction equipment.',
      viewCount: 0,
      shareCount: 0,
      createdAt: '2024-06-08',
      updatedAt: '2024-06-10',
      featured: false
    },
    {
      id: '4',
      title: 'Latest Technology in Construction Equipment',
      slug: 'latest-technology-construction-equipment',
      author: 'Omar Al-Zahra',
      authorId: 'admin4',
      status: 'scheduled',
      category: ['Technology', 'Industry News'],
      language: 'en',
      publishDate: '2024-06-20',
      scheduledDate: '2024-06-20T09:00:00',
      coverImage: '/images/tech-cover.svg',
      excerpt: 'Exploring the newest technological advances in construction equipment.',
      content: 'Comprehensive overview of latest tech...',
      metaTitle: 'Latest Construction Equipment Technology',
      metaDescription: 'Discover cutting-edge technology in modern construction equipment.',
      viewCount: 0,
      shareCount: 0,
      createdAt: '2024-06-05',
      updatedAt: '2024-06-12',
      featured: false
    },
    {
      id: '5',
      title: 'Cost-Effective Equipment Rental Strategies',
      slug: 'cost-effective-equipment-rental-strategies',
      author: 'Ahmad Al-Rashid',
      authorId: 'admin1',
      status: 'published',
      category: ['Business', 'Tips'],
      language: 'en',
      publishDate: '2024-05-28',
      coverImage: '/images/cost-cover.svg',
      excerpt: 'Smart strategies to reduce equipment rental costs without compromising quality.',
      content: 'Detailed strategies for cost optimization...',
      metaTitle: 'Cost-Effective Equipment Rental Strategies',
      metaDescription: 'Learn how to optimize your equipment rental costs with proven strategies.',
      viewCount: 2150,
      shareCount: 145,
      createdAt: '2024-05-20',
      updatedAt: '2024-05-28',
      featured: false
    }
  ];

  const categories = [
    'Safety', 'Maintenance', 'Technology', 'Industry News', 'Tips', 
    'Business', 'Guidelines', 'السلامة', 'الصيانة', 'التكنولوجيا', 'أخبار الصناعة', 'نصائح', 'الأعمال', 'الإرشادات'
  ];

  const authors = [
    'Ahmad Al-Rashid', 'محمد العنزي', 'Sarah Johnson', 'Omar Al-Zahra'
  ];

  useEffect(() => {
    const fetchArticles = async () => {
      try {
        setLoading(true);
        const result = await authenticatedGet('/content/articles');
        if (result.success && result.data) {
          setArticles(result.data.articles || []);
        } else {
          // Fallback to mock data if API fails
          setArticles(mockArticles);
        }
      } catch (error) {
        console.error('Error fetching articles:', error);
        // Fallback to mock data if API fails
        setArticles(mockArticles);
      } finally {
        setLoading(false);
      }
    };

    fetchArticles();
  }, []);

  const filteredArticles = articles.filter(article => {
    if (searchTerm && !article.title.toLowerCase().includes(searchTerm.toLowerCase()) &&
        !article.excerpt.toLowerCase().includes(searchTerm.toLowerCase())) return false;
    if (selectedStatus && article.status !== selectedStatus) return false;
    if (selectedCategory && !article.category.includes(selectedCategory)) return false;
    if (selectedLanguage && article.language !== selectedLanguage) return false;
    if (selectedAuthor && article.author !== selectedAuthor) return false;
    if (dateRange.start && article.publishDate < dateRange.start) return false;
    if (dateRange.end && article.publishDate > dateRange.end) return false;
    return true;
  });

  const sortedArticles = [...filteredArticles].sort((a, b) => {
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
      case 'created':
        aValue = new Date(a.createdAt).getTime();
        bValue = new Date(b.createdAt).getTime();
        break;
      default:
        return 0;
    }
    return sortOrder === 'asc' ? aValue - bValue : bValue - aValue;
  });

  const getStatusBadge = (status: Article['status']) => {
    switch (status) {
      case 'published':
        return 'bg-green-100 text-green-800 border border-green-200';
      case 'draft':
        return 'bg-gray-100 text-gray-800 border border-gray-200';
      case 'scheduled':
        return 'bg-yellow-100 text-yellow-800 border border-yellow-200';
      default:
        return 'bg-gray-100 text-gray-800 border border-gray-200';
    }
  };

  const getStatusIcon = (status: Article['status']) => {
    switch (status) {
      case 'published':
        return faCheckCircle;
      case 'draft':
        return faFileAlt;
      case 'scheduled':
        return faClock;
      default:
        return faFileAlt;
    }
  };

  const handleDeleteArticle = async (articleId: string) => {
    setArticles(prev => prev.filter(article => article.id !== articleId));
  };

  const handleDuplicateArticle = async (articleId: string) => {
    const article = articles.find(a => a.id === articleId);
    if (!article) return;

    const duplicate = {
      ...article,
      id: `${articleId}-copy`,
      title: `${article.title} (Copy)`,
      slug: `${article.slug}-copy`,
      status: 'draft' as const,
      publishDate: new Date().toISOString().split('T')[0],
      createdAt: new Date().toISOString().split('T')[0],
      updatedAt: new Date().toISOString().split('T')[0],
      viewCount: 0,
      shareCount: 0
    };

    setArticles(prev => [duplicate, ...prev]);
  };

  const statsData = {
    total: articles.length,
    published: articles.filter(a => a.status === 'published').length,
    drafts: articles.filter(a => a.status === 'draft').length,
    scheduled: articles.filter(a => a.status === 'scheduled').length,
    totalViews: articles.reduce((sum, a) => sum + a.viewCount, 0),
    totalShares: articles.reduce((sum, a) => sum + a.shareCount, 0)
  };

  return (
    <div className={`min-h-screen bg-gray-900 ${isRTL ? 'font-arabic' : 'font-montserrat'}`} dir={isRTL ? 'rtl' : 'ltr'}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-bold text-white mb-2">
              {isRTL ? 'إدارة المقالات' : 'Articles Management'}
            </h1>
            <p className="text-gray-400">
              {isRTL ? 'إنشاء وتحرير ونشر المقالات المتعلقة بصناعة تأجير المعدات' : 'Create, edit, and publish articles related to equipment rental industry'}
            </p>
          </div>
          <Button
            onClick={() => router.push('/content/articles/new')}
            className="bg-awnash-primary hover:bg-awnash-primary-hover text-black rounded-2xl shadow-lg"
          >
            <FontAwesomeIcon icon={faPlus} className={`h-4 w-4 ${isRTL ? 'ml-2' : 'mr-2'}`} />
            {isRTL ? 'مقال جديد' : 'New Article'}
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-6 gap-4 mb-8">
          <Card className="bg-gray-800 border-gray-700">
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-white">{statsData.total}</div>
              <div className="text-sm text-gray-400">{isRTL ? 'إجمالي المقالات' : 'Total Articles'}</div>
            </CardContent>
          </Card>
          <Card className="bg-gray-800 border-gray-700">
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-green-400">{statsData.published}</div>
              <div className="text-sm text-gray-400">{isRTL ? 'منشورة' : 'Published'}</div>
            </CardContent>
          </Card>
          <Card className="bg-gray-800 border-gray-700">
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-gray-400">{statsData.drafts}</div>
              <div className="text-sm text-gray-400">{isRTL ? 'مسودات' : 'Drafts'}</div>
            </CardContent>
          </Card>
          <Card className="bg-gray-800 border-gray-700">
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-yellow-400">{statsData.scheduled}</div>
              <div className="text-sm text-gray-400">{isRTL ? 'مجدولة' : 'Scheduled'}</div>
            </CardContent>
          </Card>
          <Card className="bg-gray-800 border-gray-700">
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-blue-400">{statsData.totalViews.toLocaleString()}</div>
              <div className="text-sm text-gray-400">{isRTL ? 'إجمالي المشاهدات' : 'Total Views'}</div>
            </CardContent>
          </Card>
          <Card className="bg-gray-800 border-gray-700">
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-purple-400">{statsData.totalShares.toLocaleString()}</div>
              <div className="text-sm text-gray-400">{isRTL ? 'إجمالي المشاركات' : 'Total Shares'}</div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card className="mb-6 bg-gray-800 border-gray-700">
          <CardContent className="p-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
              {/* Search */}
              <div className="relative">
                <FontAwesomeIcon 
                  icon={faSearch} 
                  className={cn("absolute top-2.5 h-4 w-4 text-gray-400", isRTL ? "right-3" : "left-3")} 
                />
                <input
                  type="text"
                  placeholder={isRTL ? "البحث في المقالات..." : "Search articles..."}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className={cn(
                    "w-full bg-gray-700 border-gray-600 text-white placeholder-gray-400 rounded-md py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500",
                    isRTL ? "pr-10 pl-3" : "pl-10 pr-3"
                  )}
                />
              </div>

              {/* Status Filter */}
              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="bg-gray-700 border-gray-600 text-white rounded-md px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              >
                <option value="">{isRTL ? 'جميع الحالات' : 'All Status'}</option>
                <option value="published">{isRTL ? 'منشورة' : 'Published'}</option>
                <option value="draft">{isRTL ? 'مسودة' : 'Draft'}</option>
                <option value="scheduled">{isRTL ? 'مجدولة' : 'Scheduled'}</option>
              </select>

              {/* Category Filter */}
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="bg-gray-700 border-gray-600 text-white rounded-md px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
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
                className="bg-gray-700 border-gray-600 text-white rounded-md px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              >
                <option value="">{isRTL ? 'جميع اللغات' : 'All Languages'}</option>
                <option value="en">English</option>
                <option value="ar">العربية</option>
              </select>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Author Filter */}
              <select
                value={selectedAuthor}
                onChange={(e) => setSelectedAuthor(e.target.value)}
                className="bg-gray-700 border-gray-600 text-white rounded-md px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              >
                <option value="">{isRTL ? 'جميع المؤلفين' : 'All Authors'}</option>
                {authors.map(author => (
                  <option key={author} value={author}>{author}</option>
                ))}
              </select>

              {/* Date Range */}
              <input
                type="date"
                value={dateRange.start}
                onChange={(e) => setDateRange(prev => ({ ...prev, start: e.target.value }))}
                className="bg-gray-700 border-gray-600 text-white rounded-md px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
              <input
                type="date"
                value={dateRange.end}
                onChange={(e) => setDateRange(prev => ({ ...prev, end: e.target.value }))}
                className="bg-gray-700 border-gray-600 text-white rounded-md px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>

            {/* Sort Options */}
            <div className="flex items-center gap-4 mt-4">
              <label className="text-sm text-gray-300">{isRTL ? 'ترتيب بواسطة:' : 'Sort by:'}</label>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="bg-gray-700 border-gray-600 text-white rounded-md px-3 py-1 text-sm"
              >
                <option value="publishDate">{isRTL ? 'تاريخ النشر' : 'Publish Date'}</option>
                <option value="viewCount">{isRTL ? 'عدد المشاهدات' : 'View Count'}</option>
                <option value="created">{isRTL ? 'تاريخ الإنشاء' : 'Created Date'}</option>
              </select>
              <button
                onClick={() => setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc')}
                className="text-sm text-blue-400 hover:text-blue-300"
              >
                {sortOrder === 'asc' ? '↑' : '↓'}
              </button>
            </div>
          </CardContent>
        </Card>

        {/* Articles Table */}
        <Card className="bg-gray-800 border-gray-700">
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-700">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                      {isRTL ? 'المقال' : 'Article'}
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                      {isRTL ? 'المؤلف' : 'Author'}
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                      {isRTL ? 'الحالة' : 'Status'}
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                      {isRTL ? 'الفئات' : 'Categories'}
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                      {isRTL ? 'اللغة' : 'Language'}
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                      {isRTL ? 'تاريخ النشر' : 'Publish Date'}
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                      {isRTL ? 'الإحصائيات' : 'Stats'}
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                      {isRTL ? 'الإجراءات' : 'Actions'}
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-gray-800 divide-y divide-gray-700">
                  {sortedArticles.map((article) => (
                    <tr key={article.id} className="hover:bg-gray-700 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-start gap-3">
                          <div className="w-16 h-12 bg-gray-600 rounded-lg flex items-center justify-center flex-shrink-0 overflow-hidden">
                            {article.coverImage ? (
                              <img 
                                src={article.coverImage} 
                                alt={article.title}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <FontAwesomeIcon icon={faFileAlt} className="h-6 w-6 text-gray-400" />
                            )}
                          </div>
                          <div className="min-w-0 flex-1">
                            <div className="font-medium text-white text-sm mb-1 line-clamp-2">
                              {article.title}
                              {article.featured && (
                                <FontAwesomeIcon icon={faBell} className={`h-3 w-3 text-yellow-400 ${isRTL ? 'ml-2' : 'mr-2'}`} />  
                              )}
                            </div>
                            <div className="text-xs text-gray-400 line-clamp-2">
                              {article.excerpt}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <FontAwesomeIcon icon={faUser} className={`h-4 w-4 text-gray-400 ${isRTL ? 'ml-2' : 'mr-2'}`} />
                          <span className="text-sm text-gray-300">{article.author}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <FontAwesomeIcon icon={getStatusIcon(article.status)} className="h-4 w-4" />
                          <Badge className={getStatusBadge(article.status)}>
                            {article.status}
                          </Badge>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex flex-wrap gap-1">
                          {article.category.slice(0, 2).map((cat, index) => (
                            <Badge key={index} className="bg-blue-100 text-blue-800 border border-blue-200 text-xs">
                              {cat}
                            </Badge>
                          ))}
                          {article.category.length > 2 && (
                            <span className="text-xs text-gray-400">
                              +{article.category.length - 2}
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <FontAwesomeIcon icon={faLanguage} className={`h-4 w-4 text-gray-400 ${isRTL ? 'ml-2' : 'mr-2'}`} />
                          <span className="text-sm text-gray-300">
                            {article.language === 'en' ? 'English' : 'العربية'}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <FontAwesomeIcon icon={faCalendarAlt} className={`h-4 w-4 text-gray-400 ${isRTL ? 'ml-2' : 'mr-2'}`} />
                          <span className="text-sm text-gray-300">{article.publishDate}</span>
                        </div>
                        {article.status === 'scheduled' && article.scheduledDate && (
                          <div className="text-xs text-yellow-400 mt-1">
                            Scheduled: {new Date(article.scheduledDate).toLocaleString()}
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-300">
                          <div>{article.viewCount.toLocaleString()} views</div>
                          <div className="text-xs text-gray-400">{article.shareCount} shares</div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <Button
                            onClick={() => window.open(`/articles/${article.slug}`, '_blank')}
                            variant="outline"
                            size="sm"
                            className="border-awnash-accent text-awnash-accent hover:bg-awnash-accent hover:text-white rounded-2xl"
                            title={isRTL ? 'معاينة المقال' : 'Preview Article'}
                          >
                            <FontAwesomeIcon icon={faEye} className="h-3 w-3" />
                          </Button>
                          <Button
                            onClick={() => router.push(`/content/articles/${article.id}/edit`)}
                            variant="outline"
                            size="sm"
                            className="border-awnash-accent text-awnash-accent hover:bg-awnash-accent hover:text-white rounded-2xl"
                            title={isRTL ? 'تحرير المقال' : 'Edit Article'}
                          >
                            <FontAwesomeIcon icon={faEdit} className="h-3 w-3" />
                          </Button>
                          <Button
                            onClick={() => handleDuplicateArticle(article.id)}
                            variant="outline"
                            size="sm"
                            className="border-awnash-accent text-awnash-accent hover:bg-awnash-accent hover:text-white rounded-2xl"
                          >
                            <FontAwesomeIcon icon={faFileAlt} className="h-3 w-3" />
                          </Button>
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button
                                variant="outline"
                                size="sm"
                                className="border-red-600 text-red-400 hover:bg-red-600 hover:text-white rounded-2xl"
                              >
                                <FontAwesomeIcon icon={faTrash} className="h-3 w-3" />
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent className="bg-gray-800 border-gray-700 text-white">
                              <AlertDialogHeader>
                                <AlertDialogTitle>Delete Article</AlertDialogTitle>
                                <AlertDialogDescription className="text-gray-300">
                                  Are you sure you want to delete "{article.title}"? This action cannot be undone.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel className="bg-gray-700 border-gray-600 text-gray-300 hover:bg-gray-600">
                                  Cancel
                                </AlertDialogCancel>
                                <AlertDialogAction
                                  onClick={() => handleDeleteArticle(article.id)}
                                  className="bg-red-600 hover:bg-red-700 text-white"
                                >
                                  Delete
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        {/* Empty State */}
        {sortedArticles.length === 0 && (
          <Card className="bg-gray-800 border-gray-700 mt-6">
            <CardContent className="p-12 text-center">
              <FontAwesomeIcon icon={faFileAlt} className="h-16 w-16 text-gray-600 mb-4" />
              <h3 className="text-lg font-semibold text-gray-300 mb-2">
                {isRTL ? 'لا توجد مقالات' : 'No Articles Found'}
              </h3>
              <p className="text-gray-400 mb-4">
                {isRTL ? 'لم يتم العثور على مقالات تطابق المرشحات المحددة' : 'No articles found matching the selected filters'}
              </p>
              <Button
                onClick={() => router.push('/content/articles/new')}
                className="bg-awnash-primary hover:bg-awnash-primary-hover text-black rounded-2xl shadow-lg"
              >
                <FontAwesomeIcon icon={faPlus} className={`h-4 w-4 ${isRTL ? 'ml-2' : 'mr-2'}`} />
                {isRTL ? 'إنشاء مقال جديد' : 'Create New Article'}
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default ArticlesManagement;
