import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🔍 Проверяем настройки Telegram...');

  // Проверяем существующие настройки
  const existingSettings = await prisma.setting.findMany({
    where: {
      key: {
        in: ['ADMIN_TELEGRAM_BOT_TOKEN', 'ADMIN_TELEGRAM_USER_ID']
      }
    }
  });

  console.log(`Найдено настроек: ${existingSettings.length}`);

  if (existingSettings.length === 0) {
    console.log('⚠️  Настройки не найдены. Создаем...');

    await prisma.setting.createMany({
      data: [
        {
          key: 'ADMIN_TELEGRAM_BOT_TOKEN',
          value: '', // Заполнить вручную
        },
        {
          key: 'ADMIN_TELEGRAM_USER_ID',
          value: '', // Заполнить вручную
        }
      ],
      skipDuplicates: true,
    });

    console.log('✅ Настройки созданы!');
  } else {
    console.log('📋 Существующие настройки:');
    existingSettings.forEach(setting => {
      console.log(`  - ${setting.key}: ${setting.value ? '✓ заполнено' : '✗ пусто'}`);
    });
  }

  // Показываем все настройки
  const allSettings = await prisma.setting.findMany({
    where: {
      key: {
        in: ['ADMIN_TELEGRAM_BOT_TOKEN', 'ADMIN_TELEGRAM_USER_ID']
      }
    }
  });

  console.log('\n📊 Итоговое состояние:');
  allSettings.forEach(setting => {
    console.log(`  ${setting.key}: ${setting.value || '(пусто - нужно заполнить)'}`);
  });

  if (allSettings.some(s => !s.value)) {
    console.log('\n⚠️  ВНИМАНИЕ: Некоторые настройки пусты!');
    console.log('\n📝 Инструкция по заполнению:');
    console.log('1. Создайте Telegram бота через @BotFather');
    console.log('2. Получите User ID через @userinfobot');
    console.log('3. Откройте Prisma Studio: npm run db:studio');
    console.log('4. Заполните значения в таблице Setting');
    console.log('\nИли выполните SQL:');
    console.log(`
UPDATE settings 
SET value = 'ВАШ_ТОКЕН_БОТА' 
WHERE key = 'ADMIN_TELEGRAM_BOT_TOKEN';

UPDATE settings 
SET value = 'ВАШ_USER_ID' 
WHERE key = 'ADMIN_TELEGRAM_USER_ID';
    `);
  } else {
    console.log('\n✅ Все настройки заполнены! Можно входить в админ-панель.');
  }
}

main()
  .catch((e) => {
    console.error('❌ Ошибка:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
