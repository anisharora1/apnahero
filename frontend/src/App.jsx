import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import './App.css'
import Navbar from './components/Navbar'
import About from './pages/About'
import Footer from './components/Footer'
import Services from './pages/Services'
import ProtectedRoute from './components/ProtectedRoute'
import CreateService from './pages/CreateService'
import MyServices from './pages/MyServices'
import UpdateService from './pages/UpdateService'
import Home from './pages/Home'
import ViewService from './pages/viewService'
import MessageRoom from './pages/MessageRoom'
import MessageList from './pages/MessageList'
import { NotificationProvider } from './contexts/NotificationContext'
import NotificationManager from './components/NotificationManager'

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
      element: <AppWithNotifications><><Navbar /><Home /><Footer /></></AppWithNotifications>,
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
      path:'/chat/:id'
    },
    {
      element: <AppWithNotifications><ProtectedRoute><MessageList /></ProtectedRoute></AppWithNotifications>,
      path:'/chats'
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
