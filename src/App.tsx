// src/App.tsx
import { Routes, Route, Link } from 'react-router-dom';
import { Hero } from './components/Hero';
import { Projects } from './components/Projects';
import { Books } from './components/Books';
import { BookDetailPage } from './pages/BookDetailPage';
import { GamesPage } from './pages/GamesPage';

function HomePage() {
  return (
    <>
      <Hero />
      <div className="text-center mb-8">
        {/* 👇 Use a default blue background color */}
        <Link to="/games" className="px-6 py-2 bg-blue-500 text-white font-bold rounded-lg hover:bg-blue-600 transition-colors">
          Play a Game!
        </Link>
      </div>
      <Projects />
      <Books />
    </>
  );
}

function App() {
  return (
    // 👇 Use a default gray background color
    <div className="bg-gray-100 text-black min-h-screen">
      <Link to="/" className="text-3xl font-bold text-center p-8 block">
        My Portfolio
      </Link>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/books/:bookId" element={<BookDetailPage />} />
        <Route path="/games" element={<GamesPage />} />
      </Routes>
    </div>
  );
}

export default App;