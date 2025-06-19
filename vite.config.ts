import path from "path"
import tailwindcss from "@tailwindcss/vite"
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import dts from 'vite-plugin-dts'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(), 
    tailwindcss(),
    dts({ 
      insertTypesEntry: true,
      rollupTypes: true 
    })
  ],
  build: {
    lib: {
      entry: {
        index: path.resolve(__dirname, 'src/index.ts'),
        login: path.resolve(__dirname, 'src/components/LoginForm.tsx'),
        register: path.resolve(__dirname, 'src/components/RegistrationForm.tsx'),
        auth: path.resolve(__dirname, 'src/lib/auth.ts'),
      },
      name: 'AuthComponents',
      formats: ['es', 'cjs'],
      fileName: (format, entryName) => `${entryName}.${format === 'es' ? 'mjs' : 'cjs'}`
    },
    rollupOptions: {
      external: [
        'react', 
        'react-dom', 
        'react/jsx-runtime',
        '@radix-ui/react-checkbox',
        '@radix-ui/react-label', 
        '@radix-ui/react-slot',
        'class-variance-authority',
        'clsx',
        'lucide-react',
        'tailwind-merge'
      ],
      output: {
        globals: {
          react: 'React',
          'react-dom': 'ReactDOM',
          'react/jsx-runtime': 'jsxRuntime',
          '@radix-ui/react-checkbox': 'RadixCheckbox',
          '@radix-ui/react-label': 'RadixLabel',
          '@radix-ui/react-slot': 'RadixSlot',
          'class-variance-authority': 'classVarianceAuthority',
          'clsx': 'clsx',
          'lucide-react': 'lucideReact',
          'tailwind-merge': 'tailwindMerge'
        }
      }
    },
    sourcemap: true,
    minify: false
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
})
