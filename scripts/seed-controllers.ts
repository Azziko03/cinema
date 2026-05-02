import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const firstNames = [
  "Алексей", "Дмитрий", "Сергей", "Андрей", "Максим", "Иван", "Артем", "Егор", "Никита", "Павел",
  "Михаил", "Владимир", "Александр", "Роман", "Денис", "Кирилл", "Антон", "Олег", "Виктор", "Игорь",
  "Айбек", "Нурлан", "Бакыт", "Талант", "Эмиль", "Тимур", "Азамат", "Руслан", "Марат", "Данияр",
  "Анна", "Мария", "Елена", "Ольга", "Наталья", "Татьяна", "Ирина", "Светлана", "Екатерина", "Юлия",
  "Айгуль", "Гульнара", "Жанара", "Назира", "Асель", "Бермет", "Динара", "Элина", "Жылдыз", "Нургуль"
];

const lastNames = [
  "Иванов", "Петров", "Сидоров", "Смирнов", "Кузнецов", "Попов", "Васильев", "Соколов", "Михайлов", "Новиков",
  "Федоров", "Морозов", "Волков", "Алексеев", "Лебедев", "Семенов", "Егоров", "Павлов", "Козлов", "Степанов",
  "Асанов", "Токтомушев", "Жумабаев", "Мамытов", "Сулайманов", "Абдыкадыров", "Турсунов", "Исаков", "Бекмуратов", "Омуралиев",
  "Иванова", "Петрова", "Сидорова", "Смирнова", "Кузнецова", "Попова", "Васильева", "Соколова", "Михайлова", "Новикова",
  "Асанова", "Токтомушева", "Жумабаева", "Мамытова", "Сулайманова", "Абдыкадырова", "Турсунова", "Исакова", "Бекмуратова", "Омуралиева"
];

async function main() {
  console.log("Начинаем добавление 120 контроллеров...");

  const controllers = [];

  for (let i = 1; i <= 120; i++) {
    const firstName = firstNames[Math.floor(Math.random() * firstNames.length)];
    const lastName = lastNames[Math.floor(Math.random() * lastNames.length)];
    const fullName = `${firstName} ${lastName}`;
    
    const email = `controller${i}@cinema.kg`;
    const status = Math.random() > 0.2 ? "active" : "inactive"; // 80% активных
    const emailVerified = Math.random() > 0.3; // 70% подтвержденных
    
    // Случайная дата создания за последние 6 месяцев
    const createdAt = new Date();
    createdAt.setDate(createdAt.getDate() - Math.floor(Math.random() * 180));

    controllers.push({
      email,
      fullName,
      role: "controller" as const,
      status: status as "active" | "inactive",
      emailVerified,
      createdAt,
      updatedAt: createdAt,
    });
  }

  // Создаем контроллеров пачками по 20
  for (let i = 0; i < controllers.length; i += 20) {
    const batch = controllers.slice(i, i + 20);
    await prisma.user.createMany({
      data: batch,
      skipDuplicates: true,
    });
    console.log(`Добавлено ${Math.min(i + 20, controllers.length)} из ${controllers.length} контроллеров`);
  }

  console.log("✅ Успешно добавлено 120 контроллеров!");
}

main()
  .catch((e) => {
    console.error("❌ Ошибка:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
