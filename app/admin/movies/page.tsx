import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import MoviesClient from "./MoviesClient";

export default async function AdminMoviesPage() {
  const session = await auth();

  if (!session?.user || session.user.role !== "admin") {
    redirect("/admin/login");
  }

  const moviesRaw = await prisma.movie.findMany({
    orderBy: { createdAt: "desc" },
    take: 20,
    include: {
      translations: true,
      metadata: true,
      genres: {
        include: {
          genre: {
            include: {
              translations: true,
            },
          },
        },
      },
      mediaFiles: true,
    },
  });

  // Преобразуем Decimal в number для передачи в клиентский компонент
  const movies = moviesRaw.map((movie) => ({
    ...movie,
    metadata: movie.metadata
      ? {
          ...movie.metadata,
          imdbRating: movie.metadata.imdbRating
            ? Number(movie.metadata.imdbRating)
            : null,
          kinopoiskRating: movie.metadata.kinopoiskRating
            ? Number(movie.metadata.kinopoiskRating)
            : null,
        }
      : null,
  }));

  return <MoviesClient initialMovies={movies} />;
}
