import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { RouterProvider } from 'react-router/dom'
import { router } from './router.jsx'
import './styles/global.css'

console.groupCollapsed('Site Credits')
console.log('Web Design by Michael Mitzman https://mitz.nyc')
console.log('Web Development by Sensor Station https://www.sensorstation.co')
console.groupEnd()

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <RouterProvider router={router} />
  </StrictMode>,
)
