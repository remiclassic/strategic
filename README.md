# Strategic Sloth Landing Page

A landing page for the Strategic Sloth business, built with Astro and Tailwind CSS.

## Local Development

```bash
# Install dependencies
npm install

# Start development server
npm run dev
```

## GitHub Pages Deployment

This site is configured to deploy to GitHub Pages at https://remiclassic.github.io/strategic/

The deployment is automated using GitHub Actions. When changes are pushed to the main branch, the site will be automatically built and deployed.

### Manual Deployment

If you need to manually trigger a deployment:

1. Go to the Actions tab in the GitHub repository
2. Select the "Deploy to GitHub Pages" workflow
3. Click "Run workflow"

## Project Structure

- `src/components/` - Astro components
- `src/layouts/` - Layout components
- `src/pages/` - Page components
- `public/` - Static assets

## Features

- 🚀 Built with Astro for optimal performance
- 💅 Styled with Tailwind CSS
- 📱 Fully responsive design
- 🎨 Clean, modern UI with soft shadows and rounded corners
- 💳 Integrated with Lemon Squeezy for payments
- 📦 Static site generation for easy deployment

## Configuration

1. Update the Lemon Squeezy checkout URLs in the following components:
   - `src/components/Pricing.astro`
   - `src/components/Upsell.astro`
   - `src/components/FinalCTA.astro`

2. Customize the content:
   - Update text, images, and pricing in each component
   - Replace placeholder images with your product screenshots
   - Modify colors and styling in the Tailwind classes

## Deployment

The site can be deployed to any static hosting service:

### Netlify
1. Push your code to GitHub
2. Connect your repository to Netlify
3. Set build command: `npm run build`
4. Set publish directory: `dist`

### Vercel
1. Push your code to GitHub
2. Import your repository in Vercel
3. Vercel will automatically detect Astro and configure the build settings

### GitHub Pages
1. Push your code to GitHub
2. Enable GitHub Pages in your repository settings
3. Set the source to the `gh-pages` branch
4. Add a GitHub Action to build and deploy your site

## License

MIT License - feel free to use this template for your own projects!

## Support

For support, please open an issue in the GitHub repository or contact us at [your-email@example.com]. 