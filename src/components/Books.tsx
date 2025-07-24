// src/components/Books.tsx
import { Link } from 'react-router-dom'; // <a>の代わりにLinkをインポート
import { bookData } from '../data/bookData'; // データをインポート

import ReactMarkdown from 'react-markdown';

// 1. 表示したい本のMarkdownファイルをインポートする
import bookSummary1 from '../content/books/sample-book.md?raw';

// 本のカードが持つ情報の「設計図」
type BookCardProps = {
  title: string;
  author: string;
  summary: string;
  coverUrl: string;
  link: string;
};

// 本のカードの見た目を作るコンポーネント
function BookCard({ title, author, summary, coverUrl, link }: BookCardProps) {
  return (
    <a href={link} target="_blank" rel="noopener noreferrer" className="block border rounded-lg p-4 shadow-md hover:shadow-xl transition-shadow h-full bg-brand-surface">
      <img src={coverUrl} alt={`${title}の表紙`} className="w-full h-60 object-cover rounded-md mb-4" />
      <h3 className="text-xl font-bold text-brand-text">{title}</h3>
      <p className="text-sm text-slate-500 mt-1">{author}</p>
      {/* ReactMarkdownでサマリーを表示 */}
      <div className="prose prose-sm mt-2 text-slate-600">
        <ReactMarkdown>{summary}</ReactMarkdown>
      </div>
    </a>
  );
}

// 読んだ本セクション全体
export function Books() {
  return (
    <section className="p-8">
      <h2 className="text-3xl font-bold text-center mb-8">Reading List</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 max-w-6xl mx-auto">
        {/* 👇 mapの中身を書き換える */}
        {bookData.map((book) => (
          // keyをここに移動し、toで行き先を指定
          <Link to={`/books/${book.id}`} key={book.id}>
            <BookCard {...book} />
          </Link>
        ))}
      </div>
    </section>
  );
}

