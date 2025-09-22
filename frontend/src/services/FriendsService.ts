import { apiFetch } from "@/api/apibase"

export async function enviarSolicitud(toUserId: number) {
    return apiFetch(`/friends/requests?toUserId=${toUserId}`, { method: "POST" })
}

export async function aceptarSolicitud(id: number) {
    return apiFetch(`/friends/requests/${id}/accept`, { method: "POST" })
}

export async function rechazarSolicitud(id: number) {
    return apiFetch(`/friends/requests/${id}/reject`, { method: "POST" })
}

export async function cancelarSolicitud(id: number) {
    return apiFetch(`/friends/requests/${id}/cancel`, { method: "POST" })
}

export async function listarInbox(page = 0, size = 10) {
    return apiFetch(`/friends/requests/inbox?page=${page}&size=${size}`)
}

export async function listarOutbox(page = 0, size = 10) {
    return apiFetch(`/friends/requests/outbox?page=${page}&size=${size}`)
}

export async function eliminarAmigo(userId: number) {
    return apiFetch(`/friends/${userId}`, { method: "DELETE" })
}

// Listados
export async function listarSugerencias(page = 0, size = 12) {
    return apiFetch(`/friends/suggestions?page=${page}&size=${size}`)
}

export async function listarAmigos(page = 0, size = 12) {
    return apiFetch(`/friends?page=${page}&size=${size}`)
}