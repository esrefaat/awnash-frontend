# Changelog

## [New Features] - Content Management System - 2025-09-25

### 🎉 New Article Creation System
- **NEW**: Complete article creation page at `/content/articles/new`
- **NEW**: Rich text editor (Tiptap) with formatting capabilities
- **NEW**: Comprehensive article form with all required fields:
  - Headline (required) and sub-headline
  - Category selection and tags input
  - Rich text editor for article body (required)
  - Author field with publish date
  - SEO optimization fields (meta title, description, slug)
  - Image upload placeholder (UI ready, backend integration pending)
  - Status selection (draft/published/scheduled)
  - Language selection (English/Arabic)
  - Article excerpt field

### 🔧 Backend Implementation
- **NEW**: Complete NestJS backend module for content management
- **NEW**: `content` schema in PostgreSQL database (`awnash_adminv1`)
- **NEW**: `content.articles` table with full schema:
  - UUID primary keys, proper indexing
  - Support for multilingual content (en/ar)
  - SEO fields, publishing workflow, view/share counters
  - Foreign key relationships with users table
- **NEW**: RESTful API endpoints:
  - `GET /api/content/articles` - List articles with pagination
  - `POST /api/content/articles` - Create new articles (requires authentication)
  - `GET /api/content/articles/:id` - Get article by ID
  - `PATCH /api/content/articles/:id` - Update article
  - `DELETE /api/content/articles/:id` - Delete article
  - `GET /api/content/articles/slug/:slug` - Get article by slug

### 🎨 Frontend Enhancements
- **FIXED**: Tiptap SSR hydration mismatch error (added `immediatelyRender: false`)
- **FIXED**: Double `/api` URL issue in API calls (standardized base URL configuration)
- **FIXED**: Form submission data type validation (coverImage field handling)
- **NEW**: Rich text editor styling integrated with dark theme
- **NEW**: Form validation with error handling and loading states
- **NEW**: Responsive layout matching existing design system
- **NEW**: RTL (Arabic) support throughout the interface

### 🗄️ Database Setup
- **NEW**: Created `content` schema in `awnash_adminv1` database
- **NEW**: Complete migration scripts with:
  - Table creation with proper PostgreSQL data types
  - Performance indexes on key fields (slug, status, language, etc.)
  - Automatic `updatedAt` triggers
  - Sample seed data for testing
- **FIXED**: PostgreSQL compatibility (changed `datetime` to `timestamp`)

### 🔐 Authentication & Authorization
- **NEW**: Role-based access control for article management
- **NEW**: JWT authentication integration with article endpoints
- **NEW**: Permission guards for content creation (SUPER_ADMIN, CONTENT_ADMIN roles)

### 🛠️ Technical Improvements
- **FIXED**: TypeScript compilation issues in backend
- **FIXED**: Environment variable configuration for database connection
- **FIXED**: SSL connection handling for PostgreSQL
- **NEW**: Comprehensive error handling and validation
- **NEW**: API utility functions for authenticated requests

### 📝 API Documentation
- **NEW**: Swagger documentation available at `http://localhost:3001/api/docs`
- **NEW**: OpenAPI JSON spec at `http://localhost:3001/api/docs-json`

### 🔄 Navigation Updates
- **UPDATED**: Articles list page navigation to include "New Article" button
- **UPDATED**: Routing to properly redirect to new article creation page

## Files Changed

### Frontend (`awnash-frontend`)
- `src/app/(dashboard)/content/articles/new/page.tsx` - **NEW** article creation page
- `src/app/(dashboard)/content/articles/page.tsx` - Updated navigation links
- `src/components/ui/RichTextEditor.tsx` - **NEW** Tiptap rich text editor component
- `src/app/globals.css` - Added Tiptap editor styling
- `src/lib/apiUtils.ts` - Fixed API base URL configuration
- `src/app/api/content/articles/route.ts` - **NEW** mock API route for testing

### Backend (`awnash-backend`)
- `src/content/` - **NEW** complete content management module
  - `articles/entities/article.entity.ts` - **NEW** Article entity with content schema
  - `articles/dto/create-article.dto.ts` - **NEW** validation DTO for article creation
  - `articles/dto/update-article.dto.ts` - **NEW** validation DTO for article updates
  - `articles/dto/query-articles.dto.ts` - **NEW** pagination and filtering DTO
  - `articles/articles.service.ts` - **NEW** business logic for article management
  - `articles/articles.controller.ts` - **NEW** API endpoints for articles
  - `articles/articles.module.ts` - **NEW** NestJS module configuration
  - `content.module.ts` - **NEW** main content module
- `src/app.module.ts` - Added ContentModule to main app
- `src/main.ts` - Updated Swagger documentation
- `.env` - **NEW** database configuration file

### Database
- `create-content-schema.sql` - **NEW** schema creation script
- `articles-migration.sql` - **NEW** complete table migration with indexes

## Next Steps
- [ ] Implement file upload functionality for article images
- [ ] Add article editing capabilities
- [ ] Implement article search and filtering
- [ ] Add article preview functionality
- [ ] Create article publishing workflow
- [ ] Add article analytics and metrics

## Testing
- ✅ End-to-end article creation flow tested
- ✅ Database connectivity and operations verified
- ✅ API endpoints responding correctly
- ✅ Frontend form validation working
- ✅ Rich text editor functioning with SSR
- ✅ Authentication integration confirmed
