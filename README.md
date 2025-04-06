# Digital Product Landing Page

A modern, responsive landing page built with Astro and Tailwind CSS for selling digital products. The page includes a hero section, features, testimonials, pricing, upsell, and final call-to-action sections.

## Features

- 🚀 Built with Astro for optimal performance
- 💅 Styled with Tailwind CSS
- 📱 Fully responsive design
- 🎨 Clean, modern UI with soft shadows and rounded corners
- 💳 Integrated with Lemon Squeezy for payments
- 📦 Static site generation for easy deployment

## Getting Started

1. Clone the repository:
```bash
git clone <your-repo-url>
cd <your-repo-name>
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

4. Build for production:
```bash
npm run build
```

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