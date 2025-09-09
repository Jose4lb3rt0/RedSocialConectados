import { apiFetch } from "../api/apibase"

export async function crearPost(
    payload: { 
        content: string 
        file?: File 
        type?: "text" | "profile_photo" | "banner_photo" 
    }
) {
    const formData = new FormData()
    formData.append("content", payload.content ?? "")
    formData.append("type", payload.type ?? "text")
    if (payload.file) formData.append("file", payload.file)

    return apiFetch("/posts", {
        method: "POST",
        body: formData, 
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