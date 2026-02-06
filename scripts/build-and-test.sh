#!/bin/bash

echo "🔨 Building Chile Map PWA..."
npm run build

echo "📦 Build complete!"
echo "📁 Output directory: dist/"
echo "📊 Size: $(du -sh dist/ | cut -f1)"

echo ""
echo "🚀 To deploy to Cloudflare Pages:"
echo "   npx wrangler pages deploy dist"
echo ""
echo "🌐 To preview locally:"
echo "   npm run preview"
echo ""
echo "📱 PWA features:"
echo "   - Installable on mobile/desktop"
echo "   - Offline-capable"
echo "   - Dark mode optimized"
echo "   - 12 destinations, 97 recommendations"