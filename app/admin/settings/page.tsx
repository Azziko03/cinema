"use client";

import { useState } from "react";

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState("general");

  const tabs = [
    { id: "general", name: "Общие", nameKg: "Жалпы" },
    { id: "appearance", name: "Внешний вид", nameKg: "Көрүнүш" },
    { id: "localization", name: "Локализация", nameKg: "Локализация" },
    { id: "seo", name: "SEO", nameKg: "SEO" },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Настройки сайта</h1>
        <button className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors">
          Сохранить изменения
        </button>
      </div>

      <div className="bg-[#121d2e] rounded-lg border border-gray-800">
        {/* Tabs */}
        <div className="border-b border-gray-800">
          <nav className="flex space-x-8 px-6">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`py-4 px-2 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === tab.id
                    ? "border-[#e50914] text-[#e50914]"
                    : "border-transparent text-gray-400 hover:text-gray-300"
                }`}
              >
                {tab.name}
              </button>
            ))}
          </nav>
        </div>

        <div className="p-6">
          {activeTab === "general" && (
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium mb-2">Название кинотеатра</label>
                <input
                  type="text"
                  defaultValue="Cinema Plus"
                  className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#e50914]"
                />
                <p className="text-sm text-gray-400 mt-1">Отображается в заголовке сайта и документах</p>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Описание</label>
                <textarea
                  rows={3}
                  defaultValue="Современный кинотеатр с лучшими фильмами и комфортными залами"
                  className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#e50914]"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Контактный телефон</label>
                <input
                  type="tel"
                  defaultValue="+996 555 123 456"
                  className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#e50914]"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Email</label>
                <input
                  type="email"
                  defaultValue="info@cinemaplus.kg"
                  className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#e50914]"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Адрес</label>
                <input
                  type="text"
                  defaultValue="г. Бишкек, ул. Чуй 123"
                  className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#e50914]"
                />
              </div>
            </div>
          )}

          {activeTab === "appearance" && (
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium mb-2">Логотип</label>
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 bg-gray-800 rounded-lg flex items-center justify-center">
                    <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <div>
                    <button className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors">
                      Загрузить логотип
                    </button>
                    <p className="text-sm text-gray-400 mt-1">Рекомендуемый размер: 200x200px</p>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Основной цвет</label>
                <div className="flex items-center gap-4">
                  <input
                    type="color"
                    defaultValue="#e50914"
                    className="w-12 h-10 rounded border border-gray-700"
                  />
                  <input
                    type="text"
                    defaultValue="#e50914"
                    className="px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#e50914]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Фоновое изображение главной страницы</label>
                <button className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors">
                  Загрузить изображение
                </button>
                <p className="text-sm text-gray-400 mt-1">Рекомендуемый размер: 1920x1080px</p>
              </div>
            </div>
          )}

          {activeTab === "localization" && (
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium mb-2">Языки сайта</label>
                <div className="space-y-2">
                  <label className="flex items-center">
                    <input type="checkbox" defaultChecked className="mr-2" />
                    <span>Русский (RU)</span>
                  </label>
                  <label className="flex items-center">
                    <input type="checkbox" defaultChecked className="mr-2" />
                    <span>Кыргызский (KG)</span>
                  </label>
                  <label className="flex items-center">
                    <input type="checkbox" className="mr-2" />
                    <span>Английский (EN)</span>
                  </label>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Язык по умолчанию</label>
                <select className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#e50914]">
                  <option value="ru">Русский</option>
                  <option value="kg">Кыргызский</option>
                  <option value="en">Английский</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Валюта</label>
                <select className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#e50914]">
                  <option value="som">Сом (с)</option>
                  <option value="rub">Рубль (₽)</option>
                  <option value="usd">Доллар ($)</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Часовой пояс</label>
                <select className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#e50914]">
                  <option value="Asia/Bishkek">Asia/Bishkek (UTC+6)</option>
                  <option value="Asia/Almaty">Asia/Almaty (UTC+6)</option>
                  <option value="Europe/Moscow">Europe/Moscow (UTC+3)</option>
                </select>
              </div>
            </div>
          )}

          {activeTab === "seo" && (
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium mb-2">Meta Title</label>
                <input
                  type="text"
                  defaultValue="Cinema Plus - Лучший кинотеатр в Бишкеке"
                  className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#e50914]"
                />
                <p className="text-sm text-gray-400 mt-1">Рекомендуемая длина: 50-60 символов</p>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Meta Description</label>
                <textarea
                  rows={3}
                  defaultValue="Современный кинотеатр Cinema Plus в Бишкеке. Новинки кино, комфортные залы, онлайн бронирование билетов. Лучшие фильмы каждый день!"
                  className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#e50914]"
                />
                <p className="text-sm text-gray-400 mt-1">Рекомендуемая длина: 150-160 символов</p>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Ключевые слова</label>
                <input
                  type="text"
                  defaultValue="кинотеатр, фильмы, билеты, Бишкек, кино, сеансы"
                  className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#e50914]"
                />
                <p className="text-sm text-gray-400 mt-1">Разделяйте ключевые слова запятыми</p>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Google Analytics ID</label>
                <input
                  type="text"
                  placeholder="G-XXXXXXXXXX"
                  className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#e50914]"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Yandex.Metrica ID</label>
                <input
                  type="text"
                  placeholder="12345678"
                  className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#e50914]"
                />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}