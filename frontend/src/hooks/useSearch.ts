import { buscarUsuarios } from "@/services/SearchService";
import type { Page, UserSummary } from "@/services/UserService";
import { useQuery } from "@tanstack/react-query";

export function useSearchUsuarios(query: string, page = 0, size = 10) {
    return useQuery<Page<UserSummary>>({
        queryKey: ["search", "usuarios", { query, page, size }],
        queryFn: () => buscarUsuarios(query, page, size),
        enabled: query.trim().length > 0, //se ejecuta si se escribe algo en el input
        staleTime: 10_000, // 10 segundos para evitar hacer muchas consultas seguidas al escribir
    })
}