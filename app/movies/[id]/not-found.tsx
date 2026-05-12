import Link from 'next/link'
import { Film } from 'lucide-react'

export default function NotFound() {
  return (
    <div className="min-h-screen bg-black text-white flex items-center justify-center">
      <div className="text-center space-y-6 px-4">
        <Film className="w-24 h-24 text-gray-700 mx-auto" />
        <h1 className="text-4xl font-bold">Фильм не найден</h1>
        <p className="text-gray-400 text-lg">
          К сожалению, запрашиваемый фильм не существует или был удален
        </p>
        <Link 
          href="/"
          className="inline-block px-8 py-3 bg-[#e50914] text-white rounded-lg font-semibold hover:bg-[#c50812] transition-colors"
        >
          Вернуться на главную
        </Link>
      </div>
    </div>
  )
}
