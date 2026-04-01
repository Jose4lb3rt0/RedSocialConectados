import { Client } from "@stomp/stompjs"
import { useAuth } from "@/auth/AuthContext"
import type { MensajeDto } from "@/services/ChatService"
import { useQueryClient } from "@tanstack/react-query"
import { useCallback, useEffect, useRef, useState } from "react"
import { actualizarPreviewConversacion, agregarMensajeAlCache } from "./useChats"
import type { NotificationDto } from "@/services/NotificationService"

export type TypingEvent = {
    conversacionId: number
    usuarioId: number
    escribiendo: boolean
}

type UseChatWebSocketOptions = {
    onMensaje?: (mensaje: MensajeDto) => void
    onTyping?: (event: TypingEvent) => void
    onLeido?: (conversacionId: number) => void
    onNotificacion?: (notificacion: NotificationDto) => void
    onPresence?: (email: string, conectado: boolean) => void
}

// Singleton fuera de React — un solo cliente para toda la app
let globalClient: Client | null = null
let globalToken: string | null = null
let connecting = false // evita doble conexión por StrictMode

export function useChatWebSocket(options: UseChatWebSocketOptions = {}) {
    const { token, isAuthenticated } = useAuth()
    const qc = useQueryClient()
    const optionsRef = useRef(options)
    const [connected, setConnected] = useState(false)

    useEffect(() => {
        optionsRef.current = options
    })

    useEffect(() => {
        if (!isAuthenticated || !token) {
            if (globalClient) {
                globalClient.deactivate()
                globalClient = null
                globalToken = null
                connecting = false
            }
            setConnected(false)
            return
        }

        // Ya conectado con el mismo token — sincronizar estado
        if (globalClient?.connected && globalToken === token) {
            setConnected(true)
            return
        }

        // Evitar doble conexión por StrictMode o rerenders
        if (connecting && globalToken === token) return

        // Token nuevo — desconectar cliente anterior
        if (globalClient) {
            globalClient.deactivate()
            globalClient = null
        }

        connecting = true
        globalToken = token

        const client = new Client({
            brokerURL: "ws://localhost:8080/ws/websocket",
            connectHeaders: { Authorization: `Bearer ${token}` },
            reconnectDelay: 5000,
            onConnect: () => {
                connecting = false
                setConnected(true)

                client.subscribe("/user/queue/mensajes", (frame) => {
                    const mensaje: MensajeDto = JSON.parse(frame.body)
                    agregarMensajeAlCache(qc, mensaje)
                    actualizarPreviewConversacion(qc, mensaje)
                    optionsRef.current.onMensaje?.(mensaje)
                })

                client.subscribe("/user/queue/typing", (frame) => {
                    const event: TypingEvent = JSON.parse(frame.body)
                    optionsRef.current.onTyping?.(event)
                })

                client.subscribe("/user/queue/leido", (frame) => {
                    const conversacionId: number = JSON.parse(frame.body)
                    qc.setQueryData<any>(["chat", "mensajes", conversacionId], (old: any) => {
                        if (!old?.pages) return old
                        return {
                            ...old,
                            pages: old.pages.map((page: any) => ({
                                ...page,
                                content: page.content.map((m: MensajeDto) => ({ ...m, leido: true })),
                            })),
                        }
                    })
                    optionsRef.current.onLeido?.(conversacionId)
                })

                client.subscribe("/user/queue/notificaciones", (frame) => {
                    const notificacion: NotificationDto = JSON.parse(frame.body)

                    qc.setQueryData<any>(["notifications"], (old: any) => {
                        if (!old?.pages) return old
                        const yaExiste = old.pages[0]?.content?.some((n: NotificationDto) => n.id === notificacion.id)
                        if (yaExiste) return old

                        return {
                            ...old,
                            pages: [
                                { ...old.pages[0], content: [notificacion, ...(old.pages[0]?.content ?? [])] },
                                ...old.pages.slice(1)
                            ]
                        }
                    })

                    // Incrementar el contador de no leídas
                    qc.setQueryData<number>(["notifications", "unread-count"], (old = 0) => old + 1)
                    optionsRef.current.onNotificacion?.(notificacion)
                })

                // Presencia de amigos en tiempo real
                client.subscribe("/user/queue/presence", (frame) => {
                    const { email, conectado }: { email: string; conectado: boolean } = JSON.parse(frame.body)
                    qc.setQueryData<string[]>(["presence", "amigos"], (old = []) => {
                        if (conectado) {
                            return old.includes(email) ? old : [...old, email]
                        } else {
                            return old.filter(e => e !== email)
                        }
                    })
                    optionsRef.current.onPresence?.(email, conectado)
                })
            },
            onDisconnect: () => {
                connecting = false
                setConnected(false)
                console.log("[WS] Desconectado")
            },
            onStompError: (frame) => {
                connecting = false
                setConnected(false)
                console.error("[WS] Error STOMP:", frame.headers["message"])
            },
        })

        client.activate()
        globalClient = client

    }, [isAuthenticated, token, qc])

    const enviarTyping = useCallback((conversacionId: number, escribiendo: boolean) => {
        if (!globalClient?.connected) return
        globalClient.publish({
            destination: "/app/chat.typing",
            body: JSON.stringify({ conversacionId, escribiendo }),
        })
    }, [])

    const enviarLeido = useCallback((conversacionId: number) => {
        if (!globalClient?.connected) return
        globalClient.publish({
            destination: "/app/chat.leido",
            body: JSON.stringify({ conversacionId }),
        })
    }, [])

    return { enviarTyping, enviarLeido, connected }
}