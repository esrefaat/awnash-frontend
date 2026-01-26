#!/bin/bash

# Frontend (Next.js) Cache Clearing Script
# Cleans up all caches, build artifacts, and kills running processes

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR"

echo "🧹 Clearing Frontend Cache..."
echo "================================"

# Kill any processes running on port 3000
echo "→ Stopping processes on port 3000..."
lsof -ti:3000 | xargs kill -9 2>/dev/null || echo "  No processes found on port 3000"

# Kill any node processes related to next
echo "→ Stopping Next.js dev server processes..."
pkill -f "next dev" 2>/dev/null || echo "  No Next.js dev processes found"
pkill -f "next-server" 2>/dev/null || echo "  No Next.js server processes found"

# Remove Next.js build cache
echo "→ Removing .next/ build cache..."
rm -rf .next

# Remove npm cache in project
echo "→ Removing .npm cache..."
rm -rf .npm

# Remove TypeScript build info
echo "→ Removing TypeScript cache..."
rm -rf tsconfig.tsbuildinfo
rm -rf .tsbuildinfo

# Remove ESLint cache
echo "→ Removing ESLint cache..."
rm -rf .eslintcache

# Remove general cache directories
echo "→ Removing other cache directories..."
rm -rf .cache
rm -rf .turbo

# Remove package-lock.json (optional - uncomment if needed)
# echo "→ Removing package-lock.json..."
# rm -f package-lock.json

echo ""
echo "================================"
echo "✅ Frontend cache cleared successfully!"
echo ""
echo "To start fresh:"
echo "  npm run dev"
