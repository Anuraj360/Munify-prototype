import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import {defineConfig} from 'vite';

export default defineConfig(() => {
  return {
    plugins: [react(), tailwindcss()],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    build: {
      rollupOptions: {
        input: {
          main: path.resolve(__dirname, 'index.html'),
          userIndex: path.resolve(__dirname, 'views/user/index.html'),
          dashboard: path.resolve(__dirname, 'views/user/dashboard.html'),
          register: path.resolve(__dirname, 'views/user/register.html'),
          userMunDashboard: path.resolve(__dirname, 'views/user/mun-dashboard.html'),
          about: path.resolve(__dirname, 'views/user/about.html'),
          contact: path.resolve(__dirname, 'views/contact.html'),
          userContact: path.resolve(__dirname, 'views/user/contact.html'),
          login: path.resolve(__dirname, 'views/login.html'),
          userLogin: path.resolve(__dirname, 'views/user/login.html'),
          signup: path.resolve(__dirname, 'views/signup.html'),
          userSignup: path.resolve(__dirname, 'views/user/signup.html'),
          adminLogin: path.resolve(__dirname, 'views/admin/login.html'),
          adminDashboard: path.resolve(__dirname, 'views/admin/dashboard.html'),
          adminCreateMun: path.resolve(__dirname, 'views/admin/create-mun.html'),
          chairDashboard: path.resolve(__dirname, 'views/chair/dashboard.html'),
        },
      },
    },
    server: {
      // HMR is disabled in AI Studio via DISABLE_HMR env var.
      // Do not modifyâfile watching is disabled to prevent flickering during agent edits.
      hmr: process.env.DISABLE_HMR !== 'true',
      // Disable file watching when DISABLE_HMR is true to save CPU during agent edits.
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
    },
  };
});
