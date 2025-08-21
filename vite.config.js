
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// GitHub Pages: base must be '/<repo-name>/'
export default defineConfig({
  plugins: [react()],
  base: '/love-soldiers/',
})
