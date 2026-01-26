'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useTranslation } from 'react-i18next';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faSave,
  faTimes,
  faImage,
  faCalendarAlt,
  faTags,
  faUser,
  faGlobe,
  faFileAlt,
  faEye,
  faUpload
} from '@fortawesome/free-solid-svg-icons';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Label } from '@/components/ui/Label';
import { Select } from '@/components/ui/Select';
import { Textarea } from '@/components/ui/Textarea';
import RichTextEditor from '@/components/ui/RichTextEditor';
import { cn } from '@/lib/utils';
import { authenticatedPost, authenticatedFileUpload } from '@/lib/apiUtils';

interface ArticleFormData {
  title: string;
  subtitle: string;
  category: string[];
  coverImage: File | null;
  coverImageUrl?: string;
  imageCaption: string;
  content: string;
  author: string;
  publishDate: string;
  tags: string[];
  slug: string;
  excerpt: string;
  metaTitle: string;
  metaDescription: string;
  status: 'draft' | 'published' | 'scheduled';
  language: 'en' | 'ar';
}

interface FormErrors {
  title?: string;
  content?: string;
  general?: string;
}

const NewArticlePage: React.FC = () => {
  const router = useRouter();
  const { t, i18n } = useTranslation();
  const isRTL = i18n.language === 'ar';
  
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<FormErrors>({});
  const [currentTag, setCurrentTag] = useState('');
  
  const [formData, setFormData] = useState<ArticleFormData>({
    title: '',
    subtitle: '',
    category: [],
    coverImage: null,
    imageCaption: '',
    content: '',
    author: '',
    publishDate: new Date().toISOString().split('T')[0],
    tags: [],
    slug: '',
    excerpt: '',
    metaTitle: '',
    metaDescription: '',
    status: 'draft',
    language: 'en'
  });

  const categories = [
    'Safety', 'Maintenance', 'Technology', 'Industry News', 'Tips', 
    'Business', 'Guidelines', 'السلامة', 'الصيانة', 'التكنولوجيا', 'أخبار الصناعة', 'نصائح', 'الأعمال', 'الإرشادات'
  ];

  const authors = [
    'Ahmad Al-Rashid', 'محمد العنزي', 'Sarah Johnson', 'Omar Al-Zahra'
  ];

  // Arabic-friendly slug generation that preserves Arabic characters for SEO
  const generateSlug = (title: string) => {
    // For Arabic text, preserve Arabic characters for SEO benefits
    if (/[\u0600-\u06FF]/.test(title)) {
      return title
        .trim()
        // Remove punctuation and special characters but keep Arabic letters, numbers
        .replace(/[^\u0600-\u06FF\u0660-\u0669a-zA-Z0-9\s]/g, '')
        // Replace spaces with hyphens
        .replace(/\s+/g, '-')
        // Remove multiple consecutive hyphens
        .replace(/-+/g, '-')
        // Remove leading and trailing hyphens
        .replace(/^-+|-+$/g, '')
        || 'مقال-عربي';
    }
    
    // Handle English text
    return title
      .toLowerCase()
      .replace(/[^\w\s-]/g, '')
      .replace(/\s+/g, '-')
      .trim();
  };

  const handleInputChange = (field: keyof ArticleFormData, value: any) => {
    setFormData(prev => {
      const updated = { ...prev, [field]: value };
      
      // Auto-generate slug when title changes
      if (field === 'title' && value) {
        updated.slug = generateSlug(value);
      }
      
      // Auto-generate meta title if not manually set
      if (field === 'title' && value && !prev.metaTitle) {
        updated.metaTitle = value;
      }
      
      return updated;
    });

    // Clear field-specific errors
    if (errors[field as keyof FormErrors]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  const handleCategoryChange = (category: string) => {
    setFormData(prev => ({
      ...prev,
      category: prev.category.includes(category)
        ? prev.category.filter(c => c !== category)
        : [...prev.category, category]
    }));
  };

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      try {
        setLoading(true);
        
        // Upload image to media service
        const uploadFormData = new FormData();
        uploadFormData.append('file', file);
        uploadFormData.append('alt_text', 'Article cover image');
        uploadFormData.append('description', `Cover image for article: ${formData.title || 'New Article'}`);

        const uploadResult = await authenticatedFileUpload('/media/upload', uploadFormData);
        setFormData(prev => ({ 
          ...prev, 
          coverImage: null, // Clear the file object
          coverImageUrl: uploadResult.url // Store the URL instead
        }));
      } catch (error) {
        console.error('Error uploading image:', error);
        // Fallback to storing the file
        setFormData(prev => ({ ...prev, coverImage: file }));
      } finally {
        setLoading(false);
      }
    }
  };

  // Tags functionality
  const handleTagKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && currentTag.trim()) {
      e.preventDefault();
      const newTag = currentTag.trim();
      if (!formData.tags.includes(newTag)) {
        setFormData(prev => ({
          ...prev,
          tags: [...prev.tags, newTag]
        }));
      }
      setCurrentTag('');
    }
  };

  const removeTag = (tagToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }));
  };

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    if (!formData.title.trim()) {
      newErrors.title = isRTL ? 'العنوان مطلوب' : 'Title is required';
    }

    if (!formData.content.trim()) {
      newErrors.content = isRTL ? 'محتوى المقال مطلوب' : 'Article content is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setLoading(true);
    setErrors({});

    try {
      // Prepare form data for submission
      const submitData = {
        title: formData.title,
        subtitle: formData.subtitle,
        content: formData.content,
        author: formData.author,
        publishDate: formData.publishDate,
        slug: formData.slug,
        excerpt: formData.excerpt,
        metaTitle: formData.metaTitle,
        metaDescription: formData.metaDescription,
        status: formData.status,
        language: formData.language,
        category: formData.category,
        tags: formData.tags,
        coverImage: formData.coverImageUrl || null,
        imageCaption: formData.imageCaption
      };

      // Submit to API
      await authenticatedPost('/content/articles', submitData);
      
      // Redirect back to articles list on success
      router.push('/content/articles');
    } catch (error: any) {
      console.error('Error creating article:', error);
      setErrors({ 
        general: error.message || (isRTL ? 'حدث خطأ في إنشاء المقال' : 'Failed to create article')
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    router.push('/content/articles');
  };

  return (
    <div className={`min-h-screen bg-gray-900 ${isRTL ? 'font-arabic' : 'font-montserrat'}`} dir={isRTL ? 'rtl' : 'ltr'}>
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-bold text-white mb-2">
              {isRTL ? 'مقال جديد' : 'New Article'}
            </h1>
            <p className="text-gray-400">
              {isRTL ? 'إنشاء مقال جديد لمنصة أونش' : 'Create a new article for the Awnash platform'}
            </p>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-8">
          {/* General Error */}
          {errors.general && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-2xl">
              {errors.general}
            </div>
          )}

          {/* Basic Information */}
          <Card className="bg-gray-800 border-gray-700">
            <CardHeader>
              <CardTitle className="text-xl font-semibold text-white">
                {isRTL ? 'المعلومات الأساسية' : 'Basic Information'}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Title */}
              <div>
                <Label htmlFor="title" className="text-gray-300">
                  {isRTL ? 'العنوان' : 'Headline'} <span className="text-red-400">*</span>
                </Label>
                <Input
                  id="title"
                  type="text"
                  value={formData.title}
                  onChange={(e) => handleInputChange('title', e.target.value)}
                  className="bg-gray-700 border-gray-600 text-white mt-1"
                  placeholder={isRTL ? 'أدخل عنوان المقال' : 'Enter article headline'}
                />
                {errors.title && (
                  <p className="text-red-400 text-sm mt-1">{errors.title}</p>
                )}
              </div>

              {/* Subtitle */}
              <div>
                <Label htmlFor="subtitle" className="text-gray-300">
                  {isRTL ? 'العنوان الفرعي' : 'Sub-headline'}
                </Label>
                <Input
                  id="subtitle"
                  type="text"
                  value={formData.subtitle}
                  onChange={(e) => handleInputChange('subtitle', e.target.value)}
                  className="bg-gray-700 border-gray-600 text-white mt-1"
                  placeholder={isRTL ? 'أدخل العنوان الفرعي' : 'Enter sub-headline'}
                />
              </div>

              {/* Language and Status */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="language" className="text-gray-300">
                    {isRTL ? 'اللغة' : 'Language'}
                  </Label>
                  <Select
                    id="language"
                    value={formData.language}
                    onChange={(e) => handleInputChange('language', e.target.value)}
                    className="bg-gray-700 border-gray-600 text-white mt-1"
                  >
                    <option value="en">English</option>
                    <option value="ar">العربية</option>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="status" className="text-gray-300">
                    {isRTL ? 'الحالة' : 'Status'}
                  </Label>
                  <Select
                    id="status"
                    value={formData.status}
                    onChange={(e) => handleInputChange('status', e.target.value)}
                    className="bg-gray-700 border-gray-600 text-white mt-1"
                  >
                    <option value="draft">{isRTL ? 'مسودة' : 'Draft'}</option>
                    <option value="published">{isRTL ? 'منشور' : 'Published'}</option>
                    <option value="scheduled">{isRTL ? 'مجدول' : 'Scheduled'}</option>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Categories and Tags */}
          <Card className="bg-gray-800 border-gray-700">
            <CardHeader>
              <CardTitle className="text-xl font-semibold text-white">
                {isRTL ? 'التصنيف والعلامات' : 'Categories and Tags'}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Categories */}
              <div>
                <Label className="text-gray-300 mb-3 block">
                  {isRTL ? 'الفئات' : 'Categories'}
                </Label>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                  {categories.map((category) => (
                    <label key={category} className="flex items-center space-x-2 space-x-reverse">
                      <input
                        type="checkbox"
                        checked={formData.category.includes(category)}
                        onChange={() => handleCategoryChange(category)}
                        className="rounded border-gray-600 bg-gray-700"
                      />
                      <span className="text-sm text-gray-300">{category}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Tags */}
              <div>
                <Label htmlFor="tags" className="text-gray-300">
                  {isRTL ? 'العلامات' : 'Tags'}
                </Label>
                <div className="mt-1">
                  {/* Existing Tags */}
                  {formData.tags.length > 0 && (
                    <div className="flex flex-wrap gap-2 mb-2">
                      {formData.tags.map((tag, index) => (
                        <span
                          key={index}
                          className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-awnash-primary text-black"
                        >
                          {tag}
                          <button
                            type="button"
                            onClick={() => removeTag(tag)}
                            className={`${isRTL ? 'mr-2' : 'ml-2'} text-black hover:text-red-600 focus:outline-none`}
                          >
                            ×
                          </button>
                        </span>
                      ))}
                    </div>
                  )}
                  {/* Tag Input */}
                  <Input
                    id="tags"
                    type="text"
                    value={currentTag}
                    onChange={(e) => setCurrentTag(e.target.value)}
                    onKeyPress={handleTagKeyPress}
                    className="bg-gray-700 border-gray-600 text-white"
                    placeholder={isRTL ? 'اكتب علامة واضغط Enter' : 'Type a tag and press Enter'}
                  />
                  <p className="text-xs text-gray-400 mt-1">
                    {isRTL ? 'اكتب علامة واضغط Enter لإضافتها' : 'Type a tag and press Enter to add it'}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Media */}
          <Card className="bg-gray-800 border-gray-700">
            <CardHeader>
              <CardTitle className="text-xl font-semibold text-white">
                {isRTL ? 'الوسائط' : 'Media'}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Image Upload */}
              <div>
                <Label htmlFor="coverImage" className="text-gray-300">
                  {isRTL ? 'صورة الغلاف' : 'Cover Image'}
                </Label>
                <div className="mt-1">
                  <input
                    id="coverImage"
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                  />
                  <Button
                    type="button"
                    onClick={() => document.getElementById('coverImage')?.click()}
                    variant="outline"
                    className="border-gray-600 text-gray-300 hover:bg-gray-700"
                  >
                    <FontAwesomeIcon icon={faUpload} className={`h-4 w-4 ${isRTL ? 'ml-2' : 'mr-2'}`} />
                    {isRTL ? 'رفع صورة' : 'Upload Image'}
                  </Button>
                  {(formData.coverImage || formData.coverImageUrl) && (
                    <div className="mt-2">
                      {formData.coverImageUrl ? (
                        <div className="flex items-center gap-2">
                          <img 
                            src={formData.coverImageUrl} 
                            alt="Cover preview" 
                            className="w-16 h-16 object-cover rounded border"
                          />
                          <div>
                            <p className="text-sm text-green-400">✓ Image uploaded successfully</p>
                            <button
                              type="button"
                              onClick={() => setFormData(prev => ({ ...prev, coverImageUrl: undefined, coverImage: null }))}
                              className="text-xs text-red-400 hover:text-red-300"
                            >
                              Remove image
                            </button>
                          </div>
                        </div>
                      ) : (
                        <p className="text-sm text-gray-400">{formData.coverImage?.name}</p>
                      )}
                    </div>
                  )}
                </div>
              </div>

              {/* Image Caption */}
              <div>
                <Label htmlFor="imageCaption" className="text-gray-300">
                  {isRTL ? 'تسمية الصورة' : 'Image Caption'}
                </Label>
                <Input
                  id="imageCaption"
                  type="text"
                  value={formData.imageCaption}
                  onChange={(e) => handleInputChange('imageCaption', e.target.value)}
                  className="bg-gray-700 border-gray-600 text-white mt-1"
                  placeholder={isRTL ? 'وصف للصورة' : 'Description for the image'}
                />
              </div>
            </CardContent>
          </Card>

          {/* Content */}
          <Card className="bg-gray-800 border-gray-700">
            <CardHeader>
              <CardTitle className="text-xl font-semibold text-white">
                {isRTL ? 'محتوى المقال' : 'Article Content'}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Article Body */}
              <div>
                <Label htmlFor="content" className="text-gray-300">
                  {isRTL ? 'محتوى المقال' : 'Article Body'} <span className="text-red-400">*</span>
                </Label>
                <div className="mt-1">
                  <RichTextEditor
                    content={formData.content}
                    onChange={(content) => handleInputChange('content', content)}
                    placeholder={isRTL ? 'اكتب محتوى المقال هنا...' : 'Write your article content here...'}
                    className="bg-gray-800"
                  />
                </div>
                {errors.content && (
                  <p className="text-red-400 text-sm mt-1">{errors.content}</p>
                )}
              </div>

              {/* Excerpt */}
              <div>
                <Label htmlFor="excerpt" className="text-gray-300">
                  {isRTL ? 'مقتطف' : 'Excerpt'}
                </Label>
                <Textarea
                  id="excerpt"
                  value={formData.excerpt}
                  onChange={(e) => handleInputChange('excerpt', e.target.value)}
                  className="bg-gray-700 border-gray-600 text-white mt-1"
                  rows={3}
                  placeholder={isRTL ? 'ملخص قصير للمقال' : 'Short summary of the article'}
                />
              </div>
            </CardContent>
          </Card>

          {/* Publishing Details */}
          <Card className="bg-gray-800 border-gray-700">
            <CardHeader>
              <CardTitle className="text-xl font-semibold text-white">
                {isRTL ? 'تفاصيل النشر' : 'Publishing Details'}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Author */}
                <div>
                  <Label htmlFor="author" className="text-gray-300">
                    {isRTL ? 'المؤلف' : 'Author'}
                  </Label>
                  <Select
                    id="author"
                    value={formData.author}
                    onChange={(e) => handleInputChange('author', e.target.value)}
                    className="bg-gray-700 border-gray-600 text-white mt-1"
                  >
                    <option value="">{isRTL ? 'اختر المؤلف' : 'Select Author'}</option>
                    {authors.map((author) => (
                      <option key={author} value={author}>{author}</option>
                    ))}
                  </Select>
                </div>

                {/* Publish Date */}
                <div>
                  <Label htmlFor="publishDate" className="text-gray-300">
                    {isRTL ? 'تاريخ النشر' : 'Publish Date'}
                  </Label>
                  <Input
                    id="publishDate"
                    type="date"
                    value={formData.publishDate}
                    onChange={(e) => handleInputChange('publishDate', e.target.value)}
                    className="bg-gray-700 border-gray-600 text-white mt-1"
                  />
                </div>
              </div>

              {/* Slug */}
              <div>
                <Label htmlFor="slug" className="text-gray-300">
                  {isRTL ? 'الرابط (Slug)' : 'Slug'}
                </Label>
                <Input
                  id="slug"
                  type="text"
                  value={formData.slug}
                  onChange={(e) => handleInputChange('slug', e.target.value)}
                  className="bg-gray-700 border-gray-600 text-white mt-1"
                  placeholder={isRTL ? 'رابط-المقال' : 'article-slug'}
                />
              </div>
            </CardContent>
          </Card>

          {/* SEO */}
          <Card className="bg-gray-800 border-gray-700">
            <CardHeader>
              <CardTitle className="text-xl font-semibold text-white">
                {isRTL ? 'تحسين محركات البحث (SEO)' : 'SEO Optimization'}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* SEO Title */}
              <div>
                <Label htmlFor="metaTitle" className="text-gray-300">
                  {isRTL ? 'عنوان SEO' : 'SEO Title'}
                </Label>
                <Input
                  id="metaTitle"
                  type="text"
                  value={formData.metaTitle}
                  onChange={(e) => handleInputChange('metaTitle', e.target.value)}
                  className="bg-gray-700 border-gray-600 text-white mt-1"
                  placeholder={isRTL ? 'عنوان محسن لمحركات البحث' : 'SEO optimized title'}
                />
              </div>

              {/* SEO Description */}
              <div>
                <Label htmlFor="metaDescription" className="text-gray-300">
                  {isRTL ? 'وصف SEO' : 'SEO Description'}
                </Label>
                <Textarea
                  id="metaDescription"
                  value={formData.metaDescription}
                  onChange={(e) => handleInputChange('metaDescription', e.target.value)}
                  className="bg-gray-700 border-gray-600 text-white mt-1"
                  rows={3}
                  placeholder={isRTL ? 'وصف محسن لمحركات البحث (150-160 حرف)' : 'SEO optimized description (150-160 characters)'}
                />
              </div>
            </CardContent>
          </Card>

          {/* Form Actions */}
          <div className="flex justify-end gap-4">
            <Button
              type="button"
              onClick={handleCancel}
              variant="outline"
              className="border-gray-600 text-gray-300 hover:bg-gray-700 rounded-2xl"
            >
              <FontAwesomeIcon icon={faTimes} className={`h-4 w-4 ${isRTL ? 'ml-2' : 'mr-2'}`} />
              {isRTL ? 'إلغاء' : 'Cancel'}
            </Button>
            <Button
              type="submit"
              disabled={loading}
              className="bg-awnash-primary hover:bg-awnash-primary-hover text-black rounded-2xl shadow-lg"
            >
              {loading ? (
                <>
                  <div className={`animate-spin rounded-full h-4 w-4 border-b-2 border-black ${isRTL ? 'ml-2' : 'mr-2'}`}></div>
                  {isRTL ? 'جاري الحفظ...' : 'Saving...'}
                </>
              ) : (
                <>
                  <FontAwesomeIcon icon={faSave} className={`h-4 w-4 ${isRTL ? 'ml-2' : 'mr-2'}`} />
                  {isRTL ? 'حفظ' : 'Save'}
                </>
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default NewArticlePage;
