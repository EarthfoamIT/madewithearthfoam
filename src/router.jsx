import { createBrowserRouter } from 'react-router'
import { projects } from './data/projects.js'
import RootLayout from './layouts/RootLayout.jsx'
import ContactPage from './pages/ContactPage.jsx'
import HomePage from './pages/HomePage.jsx'
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
      { path: 'contact', element: <ContactPage /> },
      { path: '*', element: <NotFoundPage /> },
    ],
  },
])
