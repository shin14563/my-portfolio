// src/components/Books.tsx
import { Link } from 'react-router-dom';
import { bookData } from '../data/bookData'; // データをインポート

type Book = {
  id: string;
  title: string;
  author: string;
  summary: string;
  coverUrl: string;
  link: string;
};

// BookCardコンポーネントをBooks.tsx内に移動または定義
function BookCard({ title, author, coverUrl }: Omit<Book, 'summary' | 'link' | 'id'>) {
  return (
    <div className="border rounded-lg p-4 shadow-md hover:shadow-xl transition-shadow h-full bg-brand-surface">
      <img src={coverUrl} alt={`${title}の表紙`} className="w-full h-60 object-cover rounded-md mb-4" />
      <h3 className="text-xl font-bold text-brand-text">{title}</h3>
      <p className="text-sm text-slate-500 mt-1">{author}</p>
    </div>
  );
}

export function Books() {
  return (
    <section className="p-8">
      <h2 className="text-3xl font-bold text-center mb-8">Reading List</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 max-w-6xl mx-auto">
        {bookData.map((book) => (
          <Link to={`/books/${book.id}`} key={book.id}>
            <BookCard 
              title={book.title}
              author={book.author}
              coverUrl={book.coverUrl}
            />
          </Link>
        ))}
      </div>
    </section>
  );
}