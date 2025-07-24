// 1. propsの型に`link`を追加
type ProjectCardProps = {
  title: string;
  description: string;
  tags: string[];
  link: string; // ← 追加
};

// カードの見た目を作るコンポーネント（変更なし）
function ProjectCard({ title, description, tags }: ProjectCardProps) {
  return (
    <div className="border rounded-lg p-4 shadow-md hover:shadow-xl transition-shadow h-full">
      <div className="w-full h-40 bg-slate-200 rounded-md mb-4"></div>
      <h3 className="text-xl font-bold">{title}</h3>
      <p className="mt-2 text-slate-600">{description}</p>
      <div className="mt-4 flex flex-wrap gap-2">
        {tags.map((tag) => (
          <span
            key={tag}
            className="bg-sky-100 text-sky-800 text-xs font-medium px-2.5 py-0.5 rounded-full"
          >
            {tag}
          </span>
        ))}
      </div>
    </div>
  );
}

// プロジェクトセクション全体
export function Projects() {
  const myProjects: ProjectCardProps[] = [
    {
      title: '私のポートフォリオサイト',
      description: 'ViteとReactを使って構築した、自身のスキルと実績をまとめたWebサイトです。',
      tags: ['React', 'TypeScript', 'Vite', 'Tailwind CSS'],
      link: 'https://github.com/shin14563/my-portfolio', // ← 2. リンク先のURLを追加
    },
    {
      title: '〇〇会社のコーポレートサイト',
      description: 'デザインからコーディングまで担当。シンプルで分かりやすい情報設計を心がけました。',
      tags: ['HTML', 'CSS', 'JavaScript'],
      link: 'https://example.com', // ← 2. リンク先のURLを追加
    },
    // ...他のプロジェクトも同様にlinkを追加
  ];

  return (
    <section className="p-8">
      <h2 className="text-3xl font-bold text-center mb-8">Projects</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
        {myProjects.map((project) => (
          // 3. カード全体を<a>タグで囲む
          <a
            key={project.title}
            href={project.link}
            target="_blank" // リンクを新しいタブで開く
            rel="noopener noreferrer"
            className="block" // <a>タグをブロック要素にして高さを揃える
          >
            <ProjectCard
              title={project.title}
              description={project.description}
              tags={project.tags}
              link={project.link} // propsとして渡す（今回は使わないが、念のため）
            />
          </a>
        ))}
      </div>
    </section>
  );
}