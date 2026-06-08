/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',

  // ─── Turbopack ────────────────────────────────────────────────────────────
  // Pastikan root project benar agar tidak ada multi-lockfile warning
  turbopack: {
    root: __dirname,
  },

  // ─── Kompresi ─────────────────────────────────────────────────────────────
  // Aktifkan gzip/brotli di server agar payload lebih kecil
  compress: true,

  // ─── allowedDevOrigins ────────────────────────────────────────────────────
  // Tambahkan semua origin yang mungkin dipakai selama development
  // (localhost, 127.0.0.1, WSL, maupun IP LAN)
  allowedDevOrigins: [
    'http://localhost:3000',
    'http://127.0.0.1:3000',
    'http://169.254.186.114:3000',
    'http://169.254.99.145:3000',
  ],

  // ─── Experimental ─────────────────────────────────────────────────────────
  experimental: {
    serverActions: {
      bodySizeLimit: '10mb',
    },
    // Tree-shake import besar secara otomatis — mengurangi ukuran bundle
    // dan waktu compile sehingga RAM turbo turun
    optimizePackageImports: [
      'lucide-react',
      'recharts',
      '@radix-ui/react-accordion',
      '@radix-ui/react-alert-dialog',
      '@radix-ui/react-avatar',
      '@radix-ui/react-checkbox',
      '@radix-ui/react-collapsible',
      '@radix-ui/react-context-menu',
      '@radix-ui/react-dialog',
      '@radix-ui/react-dropdown-menu',
      '@radix-ui/react-hover-card',
      '@radix-ui/react-label',
      '@radix-ui/react-menubar',
      '@radix-ui/react-navigation-menu',
      '@radix-ui/react-popover',
      '@radix-ui/react-progress',
      '@radix-ui/react-radio-group',
      '@radix-ui/react-scroll-area',
      '@radix-ui/react-select',
      '@radix-ui/react-separator',
      '@radix-ui/react-slider',
      '@radix-ui/react-switch',
      '@radix-ui/react-tabs',
      '@radix-ui/react-toast',
      '@radix-ui/react-toggle',
      '@radix-ui/react-tooltip',
      'date-fns',
    ],
  },

  // ─── Image Optimization ───────────────────────────────────────────────────
  images: {
    // Format modern — hemat bandwidth
    formats: ['image/avif', 'image/webp'],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '*.supabase.co',
        pathname: '/storage/v1/object/public/**',
      },
      {
        protocol: 'https',
        hostname: 'placehold.co',
      },
    ],
  },

  // ─── Webpack (fallback jika tidak pakai Turbopack) ────────────────────────
  webpack: (config, { dev, isServer }) => {
    // Batasi penggunaan RAM webpack di dev mode
    if (dev) {
      config.cache = {
        type: 'filesystem',
        buildDependencies: { config: [__filename] },
      }
    }
    return config
  },
};

module.exports = nextConfig;