import { apiFetch } from "../api/apibase"
import type { Page } from "./UserService"

export type NotificationDto = {
    id: number
    tipo: string
    mensaje: string
    referenciaId?: number | null
    referenciaTipo?: string | null
    creadaEn: string
    leida: boolean
    actorId?: number | null
    actorName?: string | null
    actorPhotoUrl?: string | null
    reaccionTipo?: string | null
}

export async function obtenerNotificaciones(page = 0, size = 10): Promise<Page<NotificationDto>> {
    return apiFetch(`/notifications?page=${page}&size=${size}`)
}

export async function contarNotificacionesNoLeidas(): Promise<number> {
    return apiFetch("/notifications/unread-count")
}

export async function marcarNotificacionComoLeida(id: number): Promise<void> {
    await apiFetch(`/notifications/${id}/read`, { method: "POST" })
}

export async function marcarTodasNotificacionesComoLeidas(): Promise<void> {
    await apiFetch("/notifications/read-all", { method: "POST" })
}

