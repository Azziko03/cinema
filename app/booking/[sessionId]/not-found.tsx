import Link from 'next/link'
import { Film } from 'lucide-react'

export default function NotFound() {
  return (
    <div className="min-h-screen bg-[#0c1321] text-white flex items-center justify-center px-4">
      <div className="text-center max-w-md">
        <Film className="w-20 h-20 text-gray-600 mx-auto mb-6" />
        <h1 className="text-4xl font-bold mb-4">Сеанс не найден</h1>
        <p className="text-gray-400 mb-8">
          К сожалению, этот сеанс не существует или уже начался
        </p>
        <Link
          href="/"
          className="inline-block px-8 py-3 bg-[#e50914] hover:bg-[#c50812] text-white font-bold rounded-lg transition-colors"
        >
          Вернуться на главную
        </Link>
      </div>
    </div>
  )
}
