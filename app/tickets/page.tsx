import Header from '@/components/Header'
import BottomNav from '@/components/BottomNav'
import { getLocale } from '@/app/i18n/cookies'
import { getTranslations } from '@/app/i18n'

export default async function TicketsPage() {
  const locale = await getLocale()
  const translations = await getTranslations(locale, 'landing')

  return (
    <div className="min-h-screen bg-black text-white">
      <Header translations={translations} locale={locale} />
      
      <main className="container mx-auto px-4 py-24 mb-20 md:mb-0">
        <h1 className="text-3xl font-bold mb-8">Мои билеты</h1>
        <div className="text-center py-20">
          <p className="text-gray-400 text-lg">Здесь будут отображаться ваши билеты</p>
        </div>
      </main>

      <BottomNav />
    </div>
  )
}
