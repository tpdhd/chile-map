#!/bin/bash
# Chile Trip Map - Easy Deploy Script
# Run: ./deploy.sh

set -e

echo "🇨🇱 Chile Trip Map Deployment"
echo "=============================="
echo ""

# Build first
echo "📦 Building app..."
npm run build

echo ""
echo "✅ Build complete! Choose deployment option:"
echo ""
echo "1) Surge (free, instant) - surge.sh"
echo "2) Vercel (free, production) - vercel.com"
echo "3) Cloudflare Pages (free, fast) - pages.cloudflare.com"
echo "4) Just serve locally"
echo ""
read -p "Choice [1-4]: " choice

case $choice in
  1)
    echo ""
    echo "Deploying to Surge..."
    echo "(First time? It will ask for email/password)"
    npx surge dist chile-trip-map.surge.sh
    echo ""
    echo "🎉 Deployed to: https://chile-trip-map.surge.sh"
    ;;
  2)
    echo ""
    echo "Deploying to Vercel..."
    npx vercel dist --prod
    ;;
  3)
    echo ""
    echo "Deploying to Cloudflare Pages..."
    echo "(Needs CLOUDFLARE_API_TOKEN environment variable)"
    npx wrangler pages deploy dist --project-name=chile-trip-map
    ;;
  4)
    echo ""
    echo "Starting local server..."
    echo "Open: http://localhost:3000"
    npx serve dist -l 3000
    ;;
  *)
    echo "Invalid choice"
    exit 1
    ;;
esac
