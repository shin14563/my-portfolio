// src/pages/BookDetailPage.tsx
import { useParams, Link } from 'react-router-dom';
import ReactMarkdown from 'react-markdown';
import { bookData } from '../data/bookData'; // 分離したデータをインポート

export function BookDetailPage() {
  // 1. URLから本のIDを取得する (例: /books/software-architecture の 'software-architecture' 部分)
  const { bookId } = useParams();

  // 2. IDを元に、全データの中から該当する一冊を探す
  const book = bookData.find((b) => b.id === bookId);

  // 3. もし本が見つからなかった場合の表示
  if (!book) {
    return <div>本が見つかりませんでした。</div>;
  }

  // 4. 本が見つかった場合の詳細表示
  return (
    <div className="max-w-4xl mx-auto p-8">
      <Link to="/" className="text-brand-primary hover:underline mb-8 block">&larr; 読書リストに戻る</Link>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <img src={book.coverUrl} alt={`${book.title}の表紙`} className="w-full h-auto object-cover rounded-md" />
        <div className="md:col-span-2">
          <h1 className="text-4xl font-bold text-brand-text">{book.title}</h1>
          <p className="text-lg text-slate-500 mt-2">{book.author}</p>
          <div className="prose prose-lg mt-6">
            <ReactMarkdown>{book.summary}</ReactMarkdown>
          </div>
        </div>
      </div>
    </div>
  );
}