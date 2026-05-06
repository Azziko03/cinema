import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import EditMovieClient from "./EditMovieClient";

export default async function EditMoviePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await auth();

  if (!session?.user || session.user.role !== "admin") {
    redirect("/admin/login");
  }

  const { id } = await params;

  const movieRaw = await prisma.movie.findUnique({
    where: { id },
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

  if (!movieRaw) {
    notFound();
  }

  // Преобразуем Decimal в number
  const movie = {
    ...movieRaw,
    metadata: movieRaw.metadata
      ? {
          ...movieRaw.metadata,
          imdbRating: movieRaw.metadata.imdbRating
            ? Number(movieRaw.metadata.imdbRating)
            : null,
          kinopoiskRating: movieRaw.metadata.kinopoiskRating
            ? Number(movieRaw.metadata.kinopoiskRating)
            : null,
        }
      : null,
  };

  return <EditMovieClient movie={movie} />;
}
