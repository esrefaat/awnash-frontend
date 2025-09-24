import { NextRequest, NextResponse } from 'next/server';

// Mock database (in a real app, this would be in a database)
let mockArticles: any[] = [
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
    coverImage: '/images/safety-cover.jpg',
    excerpt: 'Essential safety protocols and best practices for operating heavy construction equipment.',
    content: '<p>Detailed content about safety guidelines...</p>',
    metaTitle: 'Heavy Equipment Safety Guidelines - Awnash',
    metaDescription: 'Learn essential safety protocols for heavy equipment operation. Complete guide for construction professionals.',
    ogImage: '/images/safety-og.jpg',
    viewCount: 1250,
    shareCount: 89,
    createdAt: '2024-05-25',
    updatedAt: '2024-06-01',
    featured: true,
    tags: ['safety', 'equipment', 'guidelines']
  }
];

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const page = parseInt(searchParams.get('page') || '1');
  const limit = parseInt(searchParams.get('limit') || '10');
  const search = searchParams.get('search');
  const status = searchParams.get('status');
  const category = searchParams.get('category');
  const language = searchParams.get('language');

  let filteredArticles = [...mockArticles];

  // Apply filters
  if (search) {
    filteredArticles = filteredArticles.filter(article =>
      article.title.toLowerCase().includes(search.toLowerCase()) ||
      article.excerpt.toLowerCase().includes(search.toLowerCase())
    );
  }

  if (status) {
    filteredArticles = filteredArticles.filter(article => article.status === status);
  }

  if (category) {
    filteredArticles = filteredArticles.filter(article => 
      article.category.includes(category)
    );
  }

  if (language) {
    filteredArticles = filteredArticles.filter(article => article.language === language);
  }

  // Pagination
  const total = filteredArticles.length;
  const totalPages = Math.ceil(total / limit);
  const offset = (page - 1) * limit;
  const paginatedArticles = filteredArticles.slice(offset, offset + limit);

  return NextResponse.json({
    success: true,
    data: {
      articles: paginatedArticles,
      pagination: {
        page,
        limit,
        total,
        totalPages
      }
    }
  });
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Validate required fields
    if (!body.title || !body.content) {
      return NextResponse.json({
        success: false,
        message: 'Title and content are required'
      }, { status: 400 });
    }

    // Generate slug from title
    const slug = body.title
      .toLowerCase()
      .replace(/[^\w\s-]/g, '')
      .replace(/\s+/g, '-')
      .trim();

    // Create new article
    const newArticle = {
      id: Date.now().toString(),
      title: body.title,
      subtitle: body.subtitle || '',
      slug: slug,
      author: body.author || 'Unknown Author',
      authorId: 'current-user-id',
      status: body.status || 'draft',
      category: Array.isArray(body.category) ? body.category : [body.category].filter(Boolean),
      language: body.language || 'en',
      publishDate: body.publishDate || new Date().toISOString().split('T')[0],
      scheduledDate: body.scheduledDate || null,
      coverImage: body.coverImage || null,
      imageCaption: body.imageCaption || '',
      excerpt: body.excerpt || '',
      content: body.content,
      metaTitle: body.metaTitle || body.title,
      metaDescription: body.metaDescription || '',
      ogImage: body.ogImage || null,
      viewCount: 0,
      shareCount: 0,
      featured: body.featured || false,
      tags: Array.isArray(body.tags) ? body.tags : (body.tags ? body.tags.split(',').map((tag: string) => tag.trim()) : []),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    // Add to mock database
    mockArticles.unshift(newArticle);

    return NextResponse.json({
      success: true,
      message: 'Article created successfully',
      data: newArticle
    }, { status: 201 });

  } catch (error: any) {
    console.error('Error creating article:', error);
    return NextResponse.json({
      success: false,
      message: 'Failed to create article'
    }, { status: 500 });
  }
}
