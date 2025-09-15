import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import { Suspense, lazy } from 'react'
import './App.css'
import Navbar from './components/Navbar'
import Footer from './components/Footer'
import ProtectedRoute from './components/ProtectedRoute'

// Lazy load all pages
const Home = lazy(() => import('./pages/Home'))
const About = lazy(() => import('./pages/About'))
const Services = lazy(() => import('./pages/Services'))
const CreateService = lazy(() => import('./pages/CreateService'))
const MyServices = lazy(() => import('./pages/MyServices'))
const UpdateService = lazy(() => import('./pages/UpdateService'))
const ViewService = lazy(() => import('./pages/ViewService'))
const MessageRoom = lazy(() => import('./pages/MessageRoom'))
const MessageList = lazy(() => import('./pages/MessageList'))
import { NotificationProvider } from './contexts/NotificationContext'
import NotificationManager from './components/NotificationManager'
import LoadingSpinner from './components/LoadingSpinner'

// Wrapper component that includes notification system
const AppWithNotifications = ({ children }) => (
  <NotificationProvider>
    {children}
    <NotificationManager />
  </NotificationProvider>
)

function App() {
  const router = createBrowserRouter([
    {
      element: <AppWithNotifications><><Navbar /><Suspense fallback={<LoadingSpinner />}><Home /></Suspense><Footer /></></AppWithNotifications>,
      path: '/'
    },
    {
      element: <AppWithNotifications><><Navbar /><Services /></></AppWithNotifications>,
      path: '/services'
    },
    {
      element: <AppWithNotifications><><Navbar /><About /><Footer /></></AppWithNotifications>,
      path: '/about'
    },
    {
      element: <AppWithNotifications><ProtectedRoute><Navbar /><ViewService /></ProtectedRoute></AppWithNotifications>,
      path: '/services/:id'
    },
    {
      element: <AppWithNotifications><ProtectedRoute><MessageRoom /></ProtectedRoute></AppWithNotifications>,
      path: '/message/:id'
    },
    {
      element: <AppWithNotifications><ProtectedRoute><MessageRoom /></ProtectedRoute></AppWithNotifications>,
      path: '/chat/:id'
    },
    {
      element: <AppWithNotifications><ProtectedRoute><MessageList /></ProtectedRoute></AppWithNotifications>,
      path: '/chats'
    },
    {
      element: <AppWithNotifications><ProtectedRoute><CreateService /></ProtectedRoute></AppWithNotifications>,
      path: '/create-service'
    },
    {
      element: <AppWithNotifications><ProtectedRoute><><Navbar /><MyServices /></></ProtectedRoute></AppWithNotifications>,
      path: '/my-services'
    },
    {
      element: <AppWithNotifications><ProtectedRoute><><Navbar /><UpdateService /></></ProtectedRoute></AppWithNotifications>,
      path: `/services/update-service/:id`
    }
  ])

  return <RouterProvider router={router} />
}

export default App
