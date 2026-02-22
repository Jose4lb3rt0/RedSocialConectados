import { apiFetch } from "@/api/apibase";
import type { Page, UserSummary } from "./UserService";

export async function buscarUsuarios(query: string, page = 0, size = 10): Promise<Page<UserSummary>> {
    if (!query || query.trim().length === 0) {
        return { content: [], totalElements: 0, totalPages: 0, number: 0, size }
    }
    //el endpoint igual al del backend
    return apiFetch(`/search/users?query=${encodeURIComponent(query)}&page=${page}&size=${size}`)
}