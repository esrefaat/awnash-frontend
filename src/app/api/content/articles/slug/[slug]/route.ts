import { NextRequest, NextResponse } from 'next/server';
import { mockArticles } from '@/data/mockArticles';

export async function GET(
  request: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    const { slug } = params;
    
    // Find article by slug
    const article = mockArticles.find(article => article.slug === slug);
    
    if (!article) {
      return NextResponse.json({
        success: false,
        message: 'Article not found'
      }, { status: 404 });
    }

    // Only return published articles for public access
    if (article.status !== 'published') {
      return NextResponse.json({
        success: false,
        message: 'Article not found'
      }, { status: 404 });
    }

    // Increment view count (in a real app, this would be done in the database)
    article.viewCount += 1;

    return NextResponse.json({
      success: true,
      data: article
    });

  } catch (error: any) {
    console.error('Error fetching article by slug:', error);
    return NextResponse.json({
      success: false,
      message: 'Failed to fetch article'
    }, { status: 500 });
  }
}
