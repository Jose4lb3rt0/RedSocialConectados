import { apiFetch } from "../api/apibase"

export type UpdatePostPayload = {
    content?: string
    file?: File
    removeMedia?: boolean
}

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

export async function obtenerPost(id: number) {
    return apiFetch(`/posts/${id}`)
}

export async function obtenerFeed(page = 0, size = 10) {
    return apiFetch(`/posts/feed?page=${page}&size=${size}`)
}

export async function actualizarPost(id: number, payload: UpdatePostPayload) {
    const hasFile = payload.file instanceof File

    if (hasFile) {
        const form = new FormData()
        if (payload.content !== undefined) form.append("content", payload.content ?? "")
        form.append("file", payload.file as File)
        if (payload.removeMedia !== undefined) form.append("removeMedia", String(payload.removeMedia))
        return apiFetch(`/posts/${id}`, { method: "PATCH", body: form })
    }

    return apiFetch(`/posts/${id}`, {
        method: "PATCH",
        body: JSON.stringify({
            content: payload.content ?? undefined,
            removeMedia: payload.removeMedia ?? undefined,
        }),
    })
}

export async function eliminarPost(id: number) {
    return await apiFetch(`/posts/${id}`, {
        method: "DELETE",
    })
}