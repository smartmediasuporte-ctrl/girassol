import { NextResponse } from "next/server";

export function ok<T>(data: T, count?: number) {
  return NextResponse.json(
    {
      data,
      status: "success",
      count: count ?? (Array.isArray(data) ? data.length : 1),
      http_status: 200,
    },
    { status: 200 },
  );
}

export function notFound(message = "Não foi possível encontrar dados para a loja em questão.") {
  // Replica fielmente o status 214 que vimos no debug do Instabuy
  return NextResponse.json(
    {
      data: message,
      status: "error",
      count: 0,
      http_status: 214,
    },
    { status: 214 },
  );
}

export function badRequest(message: string) {
  return NextResponse.json(
    { data: message, status: "error", count: 0, http_status: 400 },
    { status: 400 },
  );
}
