import { Navigate, createBrowserRouter } from 'react-router'
import { projects } from './data/projects.js'
import RootLayout from './layouts/RootLayout.jsx'
import ContactPage from './pages/ContactPage.jsx'
import FairForLifePage from './pages/FairForLifePage.jsx'
import HomePage from './pages/HomePage.jsx'
import MediaPage from './pages/MediaPage.jsx'
import NotFoundPage from './pages/NotFoundPage.jsx'
import ProjectPage from './pages/ProjectPage.jsx'
import TrackOrderPage from './pages/TrackOrderPage.jsx'

export const router = createBrowserRouter([
  {
    path: '/',
    element: <RootLayout />,
    children: [
      { index: true, element: <HomePage /> },
      ...projects.map((project) => ({
        path: project.slug,
        element: <ProjectPage key={project.slug} project={project} />,
      })),
      { path: 'track-order', element: <TrackOrderPage /> },
      { path: 'gallery', element: <MediaPage /> },
      // Earlier name for the gallery; keeps old links working.
      { path: 'media', element: <Navigate to="/gallery" replace /> },
      { path: 'fair-for-life', element: <FairForLifePage /> },
      { path: 'contact', element: <ContactPage /> },
      { path: '*', element: <NotFoundPage /> },
    ],
  },
])
