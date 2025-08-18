import { apiFetch } from "../api/apibase";

export async function crearPost(payload: { content: string, mediaUrl?: string }) {
    return apiFetch("/posts", {
        method: "POST",
        body: JSON.stringify(payload),
    })
}

export async function obtenerFeed(page = 0, size = 10) {
    return apiFetch(`/posts/feed?page=${page}&size=${size}`)
}

export async function actualizarPost(id: number, payload: { content: string }) {
    return await apiFetch(`/posts/${id}`, {
        method: "PATCH",
        body: JSON.stringify(payload),
    })
}

export async function eliminarPost(id: number) {
    return await apiFetch(`/posts/${id}`, {
        method: "DELETE",
    })
}