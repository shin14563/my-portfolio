import { Hero } from './components/Hero' // Heroコンポーネントを読み込む

function App() {
  return (
    <div className="bg-white text-gray-800 min-h-screen">
      <h1 className="text-3xl font-bold text-center p-8">
        My Portfolio
      </h1>

      <Hero /> {/* 作ったコンポーネントをここに配置 */}

    </div>
  )
}

export default App