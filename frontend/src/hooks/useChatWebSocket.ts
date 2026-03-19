import { Client } from "@stomp/stompjs"
import { useAuth } from "@/auth/AuthContext"
import type { MensajeDto } from "@/services/ChatService"
import { useQueryClient } from "@tanstack/react-query"
import { useCallback, useEffect, useReducer, useRef } from "react"
import SockJS from "sockjs-client"
import { actualizarPreviewConversacion, agregarMensajeAlCache } from "./useChats"

export type TypingEvent = {
    conversacionId: number
    usuarioId: number
    escribiendo: boolean
}

type UseChatWebSocketOptions = {
    onMensaje?: (mensaje: MensajeDto) => void
    onTyping?: (event: TypingEvent) => void
    onLeido?: (conversacionId: number) => void
}

export function useChatWebSocket(options: UseChatWebSocketOptions = {}) {
    const { token, isAuthenticated } = useAuth()
    const qc = useQueryClient()
    const clientRef = useRef<Client | null>(null)
    const optionsRef = useRef(options)

    // Mantener las opciones actualizadas sin reconectar
    useEffect(() => {
        optionsRef.current = options
    })

    useEffect(() => {
        if (!isAuthenticated || !token) return

        const client = new Client({
            webSocketFactory: () => new SockJS("http://localhost:8080/ws"),
            connectHeaders: { Authorization: `Bearer ${token}` },
            reconnectDelay: 5000,
            onConnect: () => {
                // Mensajes entrantes
                client.subscribe("/user/queue/mensajes", (frame) => {
                    const mensaje: MensajeDto = JSON.parse(frame.body)
                    agregarMensajeAlCache(qc, mensaje)
                    actualizarPreviewConversacion(qc, mensaje)
                    optionsRef.current.onMensaje?.(mensaje)
                })

                // Indicador de escritura
                client.subscribe("/user/queue/typing", (frame) => {
                    const event: TypingEvent = JSON.parse(frame.body)
                    optionsRef.current.onTyping?.(event)
                })

                // Confirmaciones de lectura
                client.subscribe("/user/queue/leido", (frame) => {
                    const conversacionId: number = JSON.parse(frame.body)

                    // Marcar mensajes leidos en la caché con QueryClient
                    qc.setQueryData<any>(["chat", "mensajes", conversacionId], (old: any) => {
                        if (!old.pages) return old

                        return {
                            ...old,
                            pages: old.pages.map((page: any) => ({
                                ...page,
                                content: page.content.map((m: MensajeDto) =>
                                    ({ ...m, leido: true })
                                ),
                            })),
                        }
                    })

                    optionsRef.current.onLeido?.(conversacionId)
                })
            },
            onDisconnect: () => { console.log("[WS] Desconectado") },
            onStompError: (frame) => { console.error("[WS] Error STOMP:", frame.headers["message"]) }
        })

        client.activate()
        clientRef.current = client

        return () => {
            client.deactivate(),
                clientRef.current = null
        }
    }, [isAuthenticated, token, qc])

    // Enviar mensaje por WebSocket
    const enviarMensaje = useCallback((conversacionId: number, contenido: string) => {
        if (!clientRef.current?.connected) return

        clientRef.current?.publish({
            destination: "/app/chat.mensaje",
            body: JSON.stringify({ conversacionId, contenido }),
        })
    }, [])

    // Enviar estado de escritura con debounce incorporado
    const enviarTyping = useCallback((conversacionId: number, escribiendo: boolean) => {
        if (!clientRef.current?.connected) return

        clientRef.current?.publish({
            destination: "/app/chat.typing",
            body: JSON.stringify({ conversacionId, escribiendo }),
        })
    }, [])

    // Notificar que se leyeron los mensajes
    const enviarLeido = useCallback((conversacionId: number) => {
        if (!clientRef.current?.connected) return
        
        clientRef.current?.publish({
            destination: "/app/chat.leido",
            body: JSON.stringify({ conversacionId }),
        })
    }, [])

    const isConnected = () => clientRef.current?.connected ?? false

    return { enviarMensaje, enviarTyping, enviarLeido, isConnected }
}