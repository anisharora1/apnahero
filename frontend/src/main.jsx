import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { ClerkProvider } from '@clerk/clerk-react'
import { Provider } from 'react-redux'
import { PersistGate } from 'redux-persist/integration/react'
import { Store, persistor } from './redux/Store'

const PUBLISHABLE_KEY = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY

  if (!PUBLISHABLE_KEY) {
    throw new Error('Add your Clerk Publishable Key to the .env file')
  }

const rootEl = document.getElementById('root')
const splashEl = document.getElementById('splash')

createRoot(rootEl).render(
  <StrictMode>
    <ClerkProvider publishableKey={PUBLISHABLE_KEY} signInFallbackRedirectUrl="/" signUpFallbackRedirectUrl="/">
        <Provider store={Store}>
            <PersistGate loading={<div>Loading...</div>} persistor={persistor}>
                <App />
            </PersistGate>
        </Provider>
    </ClerkProvider>
  </StrictMode>,
)

// Remove splash once React has mounted
queueMicrotask(() => {
  if (splashEl && splashEl.parentNode) {
    splashEl.parentNode.removeChild(splashEl)
  }
})

// Register service worker in production
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    const swUrl = '/sw.js';
    navigator.serviceWorker.register(swUrl).catch(() => {
      // ignore registration errors
    })
  })
}
