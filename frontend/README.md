# React + Vite

## PWA

This app is configured as a Progressive Web App.

- Manifest: `public/site.webmanifest`
- Service Worker: `public/sw.js` (registered in `src/main.jsx`)

Development notes:
- Service worker registers on page load. In dev (`vite`), you may need to open on `http://localhost` and refresh after changes due to SW caching. Use the browser Application tab to unregister/clear storage if needed.
- Install prompt appears on supported browsers after first visit over HTTPS or localhost.

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Babel](https://babeljs.io/) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

## Expanding the ESLint configuration

If you are developing a production application, we recommend using TypeScript with type-aware lint rules enabled. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) for information on how to integrate TypeScript and [`typescript-eslint`](https://typescript-eslint.io) in your project.
