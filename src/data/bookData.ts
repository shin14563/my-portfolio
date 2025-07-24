// src/data/bookData.ts
import bookSummary1 from '../content/books/sample-book.md?raw';

// 本のデータの型定義
export type Book = {
  id: string; // URLに使うための一意のID
  title: string;
  author: string;
  summary: string;
  coverUrl: string;
  link: string;
};

// 本のデータ本体を定義してエクスポート
export const bookData: Book[] = [
  {
    id: 'software-architecture', // URLになる部分
    title: 'ソフトウェアアーキテクチャの基礎',
    author: 'Mark Richards & Neal Ford',
    summary: bookSummary1,
    coverUrl: 'https://placehold.jp/300x400.png',
    link: 'https://www.oreilly.co.jp/books/9784873119826/',
  },
  // ...他の本も同様にidを追加
];