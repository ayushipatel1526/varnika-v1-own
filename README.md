# Varnika Boutique - Premium Traditional Fashion

A sophisticated e-commerce platform for premium traditional fashion, featuring curated collections of sarees, lehengas, and designer wear that celebrate timeless elegance.

## Features

✨ **Modern E-commerce Experience**
- Responsive design optimized for all devices
- Shopping cart with persistent storage
- User authentication and admin panel
- Product catalog with detailed views
- Contact forms and customer support

🎨 **Elegant Design**
- Clean, minimalist interface
- Premium color palette and typography
- Smooth animations and interactions
- Professional product photography display

🛡️ **Secure & Scalable**
- Supabase backend for authentication and data
- TypeScript for type safety
- Modern React architecture
- Optimized build process with Vite

## Technology Stack

This project is built with modern web technologies:

- **Frontend**: React 18 + TypeScript
- **Styling**: Tailwind CSS + shadcn/ui components
- **Backend**: Supabase (PostgreSQL + Authentication)
- **Build Tool**: Vite
- **State Management**: React Context API
- **Routing**: React Router
- **Form Handling**: React Hook Form + Zod validation
- **UI Components**: Radix UI primitives

## Getting Started

### Prerequisites

- Node.js 18+ and npm/yarn
- Git

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd varnika-v1-main
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
cp .env.example .env
# Add your Supabase credentials to .env
```

4. Start the development server:
```bash
npm run dev
```

5. Open http://localhost:8080 in your browser

### Build for Production

```bash
npm run build
npm run preview
```

## Project Structure

```
src/
├── components/          # Reusable UI components
├── pages/              # Route components
├── contexts/           # React contexts (Auth, Cart)
├── hooks/              # Custom React hooks
├── lib/                # Utility functions
├── utils/              # Helper functions
└── types/              # TypeScript type definitions
```

## Key Components

- **Header**: Navigation with user authentication
- **Hero**: Landing section with brand introduction
- **FeaturedProducts**: Product showcase grid
- **ProductDialog**: Detailed product views
- **Cart**: Shopping cart management
- **AdminPanel**: Product management interface

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is proprietary software. All rights reserved.

---

**Varnika Boutique** - Where tradition meets contemporary elegance.
