import { Routes, Route } from 'react-router-dom'
import Whitepaper from './pages/Whitepaper'
import Apply from './pages/Apply'

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Whitepaper />} />
      <Route path="/apply" element={<Apply />} />
    </Routes>
  )
}
