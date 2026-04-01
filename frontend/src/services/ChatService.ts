import { apiFetch } from "@/api/apibase"
import type { Page } from "./UserService"

export type ConversacionDto = {
    id: number
    otroUsuarioId: number
    otroUsuarioName: string
    otroUsuarioSlug: string
    otroUsuarioPhotoUrl?: string | null
    otroUsuarioEmail?: string | null
    ultimoMensaje?: string | null
    ultimoMensajeTipo?: string | null
    ultimoMensajeEn?: string | null
    noLeidos: number
    creadoEn: string
}

export type MensajeDto = {
    id: number
    conversacionId: number
    autorId: number
    autorName: string
    autorPhotoUrl?: string | null
    contenido?: string | null
    mediaUrl?: string | null
    tipo: "TEXT" | "IMAGE"
    leido: boolean
    creadoEn: string
}

export async function obtenerOCrearConversacion(otroUsuarioId: number): Promise<ConversacionDto> {
    return apiFetch(`/chat/conversaciones/${otroUsuarioId}`, { method: "POST" })
}

export async function listarConversaciones(page = 0, size = 20): Promise<Page<ConversacionDto>> {
    return apiFetch(`/chat/conversaciones?page=${page}&size=${size}`)
}

export async function listarMensajes(conversacionId: number, page = 0, size = 30): Promise<Page<MensajeDto>> {
    return apiFetch(`/chat/conversaciones/${conversacionId}/mensajes?page=${page}&size=${size}`)
}

export async function enviarMensajeHttp(conversacionId: number, contenido: string): Promise<MensajeDto> {
    return apiFetch(`/chat/conversaciones/${conversacionId}/mensajes`, {
        method: "POST",
        body: JSON.stringify({ contenido }),
    })
}

export async function enviarMensajeConImagen(conversacionId: number, file: File, contenido?: string): Promise<MensajeDto> {
    const form = new FormData()
    form.append("file", file)
    if (contenido) form.append("contenido", contenido)

    return apiFetch(`/chat/conversaciones/${conversacionId}/mensajes/imagen`, {
        method: "POST",
        body: form
    })
}

export async function marcarComoLeidos(conversacionId: number): Promise<void> {
    await apiFetch(`/chat/conversaciones/${conversacionId}/leidos`, { method: "POST" })
}