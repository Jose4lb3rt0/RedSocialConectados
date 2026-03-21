import { useAuth } from "@/auth/AuthContext";
import { useChat } from "@/context/ChatContext";
import { useConversaciones, useObtenerOCrearConversacion } from "@/hooks/useChats";
import type { ConversacionDto } from "@/services/ChatService";
import ChatWindow from "./ChatWindow";
import { FaComment, FaTimes, FaUser } from "react-icons/fa";

export default function ChatPanel() {
    const { user } = useAuth()
    const { ventanasAbiertas, abrirChat, panelVisible, setPanelVisible } = useChat()
    const { data, isLoading } = useConversaciones()
    const obteneOCrear = useObtenerOCrearConversacion()

    const conversaciones = data?.pages.flatMap((p) => p.content) ?? []
    const totalNoLeidos = conversaciones.reduce((acc, c) => acc + (c.noLeidos ?? 0), 0)

    const handleAbrirConversacion = (conv: ConversacionDto) => {
        abrirChat({
            conversacionId: conv.id,
            otroUsuarioName: conv.otroUsuarioName,
            otroUsuarioPhotoUrl: conv.otroUsuarioPhotoUrl
        })
        setPanelVisible(false)
    }

    const formatTiempo = (iso?: string | null) => {
        if (!iso) return ""
        const d = new Date(iso)
        const ahora = new Date()
        const diffMs = ahora.getTime() - d.getTime()
        const diffMin = Math.floor(diffMs / 60000)
        if (diffMin < 1) return "ahora"
        if (diffMin < 60) return `${diffMin}m`
        if (diffMin < 1440) return `${Math.floor(diffMin / 60)}h`
        return d.toLocaleDateString()
    }

    if (!user) return null

    return (
        < div className="fixed bottom-0 right-16 flex items-end gap-3 z-40" >
            {
                ventanasAbiertas.map((v) => (
                    <ChatWindow
                        key={v.conversacionId}
                        conversacionId={v.conversacionId}
                        otroUsuarioName={v.otroUsuarioName}
                        otroUsuarioPhotoUrl={v.otroUsuarioPhotoUrl}
                    />
                ))
            }
        </div >
    )
}