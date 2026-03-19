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
        <>
            {/* Ventajas de chat abiertas en bottom-right */}
            <div className="fixed bottom-0 right-16 flex items-end gap-3 z-40">
                {ventanasAbiertas.map((v) => (
                    <ChatWindow
                        key={v.conversacionId}
                        conversacionId={v.conversacionId}
                        otroUsuarioName={v.otroUsuarioName}
                        otroUsuarioPhotoUrl={v.otroUsuarioPhotoUrl}
                    />
                ))}
            </div>

            {/* Botón flotante del chat */}
            <div className="fixed bottom-4 right-4 z-50">
                {panelVisible && (
                    <div className="absolute bottom-14 right-0 w-72 bg-white border border-gray-200 rounded-lg shadow-xl overflow-hidden">
                        {/* Header del panel */}
                        <div className="flex items-center justify-between px-4 py-3 border-b">
                            <span className="font-semibold text-gray-800">Mensajes</span>
                            <button
                                onClick={() => setPanelVisible(false)}
                                className="text-gray-400 hover:text-gray-600"
                            >
                                <FaTimes style={{ fontSize: 14 }} />
                            </button>
                        </div>

                        {/* Lista de conversaciones */}
                        <div className="max-h-96 overflow-y-auto">
                            {isLoading && (
                                <p className="px-4 py-3 text-sm text-gray-400">Cargando...</p>
                            )}
                            {!isLoading && conversaciones.length === 0 && (
                                <p className="px-4 py-3 text-sm text-gray-400">No tienes conversaciones aún.</p>
                            )}
                            {conversaciones.map((conv) => (
                                <button
                                    key={conv.id}
                                    onClick={() => handleAbrirConversacion(conv)}
                                    className="w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-50 text-left"
                                >
                                    {/* Avatar */}
                                    <div className="relative shrink-0">
                                        {conv.otroUsuarioPhotoUrl ? (
                                            <img
                                                src={conv.otroUsuarioPhotoUrl}
                                                className="w-10 h-10 rounded-full object-cover"
                                                alt=""
                                            />
                                        ) : (
                                            <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center">
                                                <FaUser className="text-gray-400" style={{ fontSize: 16 }} />
                                            </div>
                                        )}
                                    </div>
                                    {/* Info */}
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center justify-between">
                                            <span className={`text-sm truncate ${conv.noLeidos > 0 ? "font-semibold" : "font-medium"}`}>
                                                {conv.otroUsuarioName}
                                            </span>
                                            <span className="text-xs text-gray-400 shrink-0 ml-1">
                                                {formatTiempo(conv.ultimoMensajeEn)}
                                            </span>
                                        </div>
                                        <div className="flex items-center justify-between">
                                            <p className={`text-xs truncate ${conv.noLeidos > 0 ? "text-gray-800 font-medium" : "text-gray-400"}`}>
                                                {conv.ultimoMensaje ?? "Iniciar conversación"}
                                            </p>
                                            {conv.noLeidos > 0 && (
                                                <span className="ml-1 shrink-0 bg-blue-600 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                                                    {conv.noLeidos > 9 ? "9+" : conv.noLeidos}
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                </button>
                            ))}
                        </div>
                    </div>
                )}

                {/* Botón toggle */}
                <button
                    onClick={() => setPanelVisible(!panelVisible)}
                    className="w-12 h-12 cursor-pointer bg-blue-600 hover:bg-blue-700 text-white rounded-full flex items-center justify-center shadow-lg relative"
                >
                    <FaComment style={{ fontSize: 20 }} />
                    {totalNoLeidos > 0 && (
                        <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                            {totalNoLeidos > 9 ? "9+" : totalNoLeidos}
                        </span>
                    )}
                </button>
            </div>
        </>
    )
}