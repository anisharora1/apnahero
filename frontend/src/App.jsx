import React, { useEffect } from 'react'
import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import './App.css'
import Navbar from './components/Navbar'
import About from './pages/About'
import Footer from './components/Footer'
import ProtectedRoute from './components/ProtectedRoute'
import CreateService from './pages/CreateService'
import { NotificationProvider } from './contexts/NotificationContext'
import NotificationManager from './components/NotificationManager'
const Services = React.lazy(() => import('./pages/Services'))
import { Suspense } from 'react'
const ViewService = React.lazy(() => import('./pages/ViewService'))
const Home = React.lazy(() => import('./pages/Home'))
const MyServices = React.lazy(() => import('./pages/MyServices'))
const UpdateService = React.lazy(() => import('./pages/UpdateService'))
const MessageRoom = React.lazy(() => import('./pages/MessageRoom'))
const MessageList = React.lazy(() => import('./pages/MessageList'))
import PageTracker from './components/PageTracker'
import { initGA } from './utils/analytics'


// Wrapper component that includes notification system
const AppWithNotifications = ({ children }) => (
  <NotificationProvider>
    <PageTracker />
    {children}
    <NotificationManager />
  </NotificationProvider>
)


function App() {

  // Initialize Google Analytics when app starts
  useEffect(() => {
    initGA();
  }, []);
  const router = createBrowserRouter([
    {
      element: <AppWithNotifications><Navbar /><Suspense fallback={<div>Loading...</div>}><Home /></Suspense><Footer /></AppWithNotifications>,
      path: '/'
    },
    {
      element: <AppWithNotifications><Navbar /><Suspense fallback={<div>Loading...</div>}><Services /></Suspense><Footer /></AppWithNotifications>,
      path: '/services'
    },
    {
      element: <AppWithNotifications><Navbar /><About /><Footer /></AppWithNotifications>,
      path: '/about'
    },
    {
      element: <AppWithNotifications><ProtectedRoute><Navbar /><Suspense fallback={<div>Loading...</div>}><ViewService /></Suspense></ProtectedRoute></AppWithNotifications>,
      path: '/services/:id'
    },
    {
      element: <AppWithNotifications><ProtectedRoute><Suspense fallback={<div>Loading...</div>}><MessageRoom /></Suspense></ProtectedRoute></AppWithNotifications>,
      path: '/message/:id'
    },
    {
      element: <AppWithNotifications><ProtectedRoute><Suspense fallback={<div>Loading...</div>}><MessageRoom /></Suspense></ProtectedRoute></AppWithNotifications>,
      path: '/chat/:id'
    },
    {
      element: <AppWithNotifications><ProtectedRoute><Suspense fallback={<div>Loading...</div>}><MessageList /></Suspense></ProtectedRoute></AppWithNotifications>,
      path: '/chats'
    },
    {
      element: <AppWithNotifications><ProtectedRoute><CreateService /></ProtectedRoute></AppWithNotifications>,
      path: '/create-service'
    },
    {
      element: <AppWithNotifications><ProtectedRoute><Suspense fallback={<div>Loading...</div>}><MyServices /></Suspense></ProtectedRoute></AppWithNotifications>,
      path: '/my-services'
    },
    {
      element: <AppWithNotifications><ProtectedRoute><Suspense fallback={<div>Loading...</div>}><UpdateService /></Suspense></ProtectedRoute></AppWithNotifications>,
      path: `/services/update-service/:id`
    }

  ])

  return <RouterProvider router={router} />
}

export default App
