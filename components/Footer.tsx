'use client'

import { Camera, Send } from 'lucide-react'

export default function Footer() {
  return (
    <footer className="bg-gradient-to-b from-black to-gray-900 border-t border-gray-800">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
          {/* О нас */}
          <div className="space-y-4">
            <h3 className="text-xl font-bold text-white mb-4">О кинотеатре</h3>
            <p className="text-gray-400 text-sm leading-relaxed">
              Современный кинотеатр с комфортными залами и новейшим оборудованием. 
              Мы предлагаем лучшие фильмы и незабываемые впечатления.
            </p>
          </div>

          {/* Контакты */}
          <div className="space-y-4">
            <h3 className="text-xl font-bold text-white mb-4">Контакты</h3>
            <div className="space-y-3 text-sm">
              <p className="text-gray-400">
                <span className="text-white font-medium">Адрес:</span><br />
                г. Бишкек, ул. Абдыкадырова, 5
              </p>
              <p className="text-gray-400">
                <span className="text-white font-medium">Телефон:</span><br />
                +996 773 255 201
              </p>
              <p className="text-gray-400">
                <span className="text-white font-medium">Email:</span><br />
                tolubaevazimbek@gmail.com
              </p>
            </div>
          </div>

          {/* Социальные сети */}
          <div className="space-y-4">
            <h3 className="text-xl font-bold text-white mb-4">Мы в соцсетях</h3>
            <div className="flex flex-col gap-3">
              <a
                href="https://instagram.com/tolu6aev"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 text-gray-400 hover:text-white transition-colors group"
              >
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Camera className="w-5 h-5 text-white" />
                </div>
                <span className="text-sm">@tolu6aev</span>
              </a>
              
              <a
                href="https://t.me/Azziko"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 text-gray-400 hover:text-white transition-colors group"
              >
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Send className="w-5 h-5 text-white" />
                </div>
                <span className="text-sm">@Azziko</span>
              </a>
            </div>
          </div>
        </div>

        {/* Разделитель */}
        <div className="border-t border-gray-800 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-gray-500 text-sm text-center md:text-left">
              © {new Date().getFullYear()} Cinema. Все права защищены.
            </p>
            <div className="flex gap-6 text-sm">
              <a href="#" className="text-gray-500 hover:text-white transition-colors">
                Политика конфиденциальности
              </a>
              <a href="#" className="text-gray-500 hover:text-white transition-colors">
                Условия использования
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}
