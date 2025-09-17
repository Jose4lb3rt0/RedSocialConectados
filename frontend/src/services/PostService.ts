import { apiFetch } from "../api/apibase"

export type UpdatePostPayload = {
    content?: string
    file?: File
    removeMedia?: boolean
}

export type UpdateCommentPayload = {
    comment?: string
    file?: File
    removeMedia?: boolean
}

export type ReactionEnum = "LIKE" | "LOVE" | "CARE" | "HAHA" | "WOW" | "SAD" | "ANGRY"
export type ReactionKey = "like" | "love" | "care" | "haha" | "wow" | "sad" | "angry"

export type ReactionSummary = {
    postId: number
    total: number
    counts: Record<ReactionEnum, number>
    myReaction: ReactionEnum | null
}

// Funciones para interactuar con los posts

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

// Funciones para interactuar con los comentarios

export async function cargarComentarios(postId: number, page = 0, size = 10) {
    return apiFetch(`/posts/${postId}/comments?page=${page}&size=${size}`, {
        method: "GET",
    })
}

export async function obtenerComentario(commentId: number) {
    return apiFetch(`/comments/${commentId}`)
}

export async function crearComentario(postId: number, payload: { comment: string; file?: File }) {
    const formData = new FormData()
    formData.append("comment", payload.comment ?? "")
    if (payload.file) formData.append("file", payload.file)

    return apiFetch(`/posts/${postId}/comments`, {
        method: "POST",
        body: formData,
    })
}

export async function actualizarComentario(id: number, payload: UpdateCommentPayload) {
    const hasFile = payload.file instanceof File

    if (hasFile) {
        const form = new FormData()
        if (payload.comment !== undefined) form.append("comment", payload.comment ?? "")
        form.append("file", payload.file as File)
        if (payload.removeMedia !== undefined) form.append("removeMedia", String(payload.removeMedia))
        return apiFetch(`/comments/${id}`, { method: "PATCH", body: form })
    }

    return apiFetch(`/comments/${id}`, {
        method: "PATCH",
        body: JSON.stringify({
            comment: payload.comment ?? undefined,
            removeMedia: payload.removeMedia ?? undefined,
        }),
    })
}

export async function eliminarComentario(id: number) {
    return await apiFetch(`/comments/${id}`, {
        method: "DELETE",
    })
}

// Funciones para interactuar con las reacciones

function normalizarResumenDeReacciones(raw: any): ReactionSummary {
    const conteos = (raw?.conteo ?? raw?.counts ?? {}) as Record<string, number>
    const normalizedCounts = Object.keys(conteos).reduce((acc, k) => {
        acc[k as ReactionEnum] = conteos[k]
        return acc
    }, {} as Record<ReactionEnum, number>)

    const my = (raw?.miReaccion ?? raw?.myReaccion ?? null) as ReactionEnum | null

    return {
        postId: Number(raw?.postId),
        total: Number(raw?.total ?? 0),
        counts: normalizedCounts,
        myReaction: my,
    }
}

export async function cargarReacciones(postId: number) {
    const res = await apiFetch(`/posts/${postId}/reactions`, { method: "GET" })
    return normalizarResumenDeReacciones(res)
}

export async function reaccionarAPost(
    postId: number,
    type: ReactionKey | null
) {
    const body = type ? { type: type.toUpperCase() } : {}
    const res = await apiFetch(`/posts/${postId}/reactions`, {
        method: "POST",
        body: JSON.stringify(body),
    })

    return normalizarResumenDeReacciones(res)
}