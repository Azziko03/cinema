import { NextRequest, NextResponse } from "next/server";
import { readFile } from "fs/promises";
import { join } from "path";

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const locale = searchParams.get("locale") || "ru";
    const namespace = searchParams.get("namespace") || "auth";

    const filePath = join(
      process.cwd(),
      "app",
      "i18n",
      "locales",
      locale,
      `${namespace}.json`
    );

    const fileContent = await readFile(filePath, "utf-8");
    const translations = JSON.parse(fileContent);

    return NextResponse.json(translations);
  } catch (error) {
    console.error("Error loading translations:", error);
    return NextResponse.json(
      { error: "Failed to load translations" },
      { status: 500 }
    );
  }
}
