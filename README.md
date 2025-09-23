# Awnash Equipment Rental Platform - Frontend

This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app) for the Awnash equipment rental platform.

## Prerequisites

Before running this project, make sure you have:
- Node.js (version 18 or higher)
- npm, yarn, pnpm, or bun package manager
- The Awnash backend API running

## Environment Configuration

### API Configuration

This frontend application connects to a backend API. You need to configure the API URL using environment variables.

#### Option 1: Create a `.env.local` file (Recommended for development)

Create a `.env.local` file in the root directory of this project:

```bash
# API Configuration
NEXT_PUBLIC_API_URL=http://localhost:3001
```

> **Note:** You can create a `.env.local.example` file as a template and copy it to `.env.local` for easier setup.

#### Option 2: Set environment variables directly

You can also set the environment variable when running the development server:

```bash
NEXT_PUBLIC_API_URL=http://localhost:3001 npm run dev
```

#### Production Configuration

For production deployment, set the `NEXT_PUBLIC_API_URL` environment variable to your production API URL:

```bash
NEXT_PUBLIC_API_URL=https://api.yourapp.com
```

### Default API URL

If no environment variable is set, the application will default to `http://localhost:3001` for the API base URL.

## Getting Started

1. **Install dependencies:**
   ```bash
   npm install
   # or
   yarn install
   # or
   pnpm install
   # or
   bun install
   ```

2. **Configure the API URL** (see Environment Configuration above)

3. **Start the development server:**
   ```bash
   npm run dev
   # or
   yarn dev
   # or
   pnpm dev
   # or
   bun dev
   ```

4. **Open your browser:**
   Navigate to [http://localhost:3000](http://localhost:3000) to see the application.

## Project Structure

- `src/app/` - Next.js App Router pages and layouts
- `src/components/` - Reusable React components
- `src/services/` - API service classes for backend communication
- `src/types/` - TypeScript type definitions
- `src/lib/` - Utility functions and configurations
- `src/contexts/` - React context providers
- `src/hooks/` - Custom React hooks

## API Integration

The frontend communicates with the backend through various service classes:

- `equipmentService.ts` - Equipment management operations
- `usersService.ts` - User management operations
- `requestsService.ts` - Rental request operations
- `bidsService.ts` - Bidding operations
- `rolesService.ts` - Role and permission management

All API calls use the configured `NEXT_PUBLIC_API_URL` environment variable.

## Features

- Equipment management (CRUD operations)
- User management with role-based access control
- Rental request and bidding system
- Multi-language support (English/Arabic)
- Responsive design with dark theme
- Image upload and management
- Real-time notifications

## Troubleshooting

### API Connection Issues

If you're experiencing issues connecting to the backend API:

1. **Check if the backend is running:**
   - Ensure your backend API server is running on the configured port
   - Default backend port is `3001` (http://localhost:3001)

2. **Verify environment variables:**
   - Make sure `NEXT_PUBLIC_API_URL` is set correctly in your `.env.local` file
   - Restart the development server after changing environment variables
   - Check the browser's Network tab for failed API requests

3. **CORS Issues:**
   - Ensure your backend API has CORS configured to allow requests from `http://localhost:3000`
   - Check browser console for CORS error messages

4. **Common Error Messages:**
   - `Failed to fetch` - Usually indicates the backend is not running or wrong URL
   - `CORS error` - Backend needs to allow frontend origin
   - `401 Unauthorized` - Authentication issues, check if you're logged in
   - `403 Forbidden` - Permission issues, check user roles

### Development Tips

- Use browser developer tools to inspect API requests and responses
- Check the console for error messages
- Verify environment variables are loaded correctly by logging them in the browser

## Development

The page auto-updates as you edit files. You can start editing by modifying `src/app/page.tsx`.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
