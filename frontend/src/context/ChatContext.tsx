import { useChatWebSocket, type TypingEvent } from "@/hooks/useChatWebSocket"
import { useQueryClient } from "@tanstack/react-query"
import { createContext, useCallback, useContext, useState, type ReactNode } from "react"

type VentanaChat = {
    conversacionId: number
    otroUsuarioName: string
    otroUsuarioPhotoUrl?: string | null
}

type TypingState = Record<number, boolean> // conversacionId -> escribiendo...

type ChatContextType = {
    // Ventanas abiertas en el panel flotante
    ventanasAbiertas: VentanaChat[]
    abrirChat: (ventana: VentanaChat) => void
    cerrarChat: (conversacionId: number) => void

    // Panel flotante visible
    panelVisible: boolean
    setPanelVisible: (v: boolean | ((prev: boolean) => boolean)) => void

    // WebSocket
    enviarTyping: (conversacionId: number, escribiendo: boolean) => void
    enviarLeido: (conversacionId: number) => void

    // Typing state por conversación
    typingState: TypingState
    connected: boolean
}

const ChatContext = createContext<ChatContextType | undefined>(undefined)

export const ChatProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const qc = useQueryClient()
    const [ventanasAbiertas, setVentanasAbiertas] = useState<VentanaChat[]>([])
    const [panelVisible, setPanelVisible] = useState(false)
    const [typingState, setTypingState] = useState<TypingState>({})

    const handleTyping = useCallback((event: TypingEvent) => {
        setTypingState((prev) => ({ ...prev, [event.conversacionId]: event.escribiendo }))

        // Limpiar el indicador automáticamente tras 3 segundos por si el servidor no envía el apagado
        if (event.escribiendo) {
            setTimeout(() => {
                setTypingState((prev) => ({ ...prev, [event.conversacionId]: false }))
            }, 3000)
        }
    }, [])

    const { enviarTyping, enviarLeido, connected } = useChatWebSocket({ onTyping: handleTyping })

    const abrirChat = useCallback((ventana: VentanaChat) => {
        setVentanasAbiertas((prev) => {
            const yaAbierta = prev.find((v) => v.conversacionId === ventana.conversacionId)
            if (yaAbierta) return prev

            // Máximo 3 ventanas abiertas simultaneamnte
            const nuevas = prev.length >= 3 ? prev.slice(1) : prev
            return [...nuevas, ventana]
        })
        // setPanelVisible(true)
    }, [])

    const cerrarChat = useCallback((conversacionId: number) => {
        setVentanasAbiertas((prev) => prev.filter((v) => v.conversacionId !== conversacionId))
    }, [])

    return (
        <ChatContext.Provider value={{
            ventanasAbiertas,
            abrirChat,
            cerrarChat,
            panelVisible,
            setPanelVisible,
            enviarTyping,
            enviarLeido,
            typingState,
            connected,
        }}>
            {children}
        </ChatContext.Provider>
    )
}

export function useChat() {
    const context = useContext(ChatContext)
    if (!context) throw new Error("useChat debe usarse dentro de ChatProvider")
    return context
}