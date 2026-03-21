import { useChat } from "@/context/ChatContext";
import { useConversaciones } from "@/hooks/useChats";
import type { ConversacionDto } from "@/services/ChatService";
import { FaComment, FaTimes, FaUser } from "react-icons/fa";

type Props = {
    onClick?: () => void // no se usa aún porque se abre desde el navbar
}

export default function ChatMenu({ onClick }: Props) {
    const { data, isLoading } = useConversaciones()
    const { panelVisible, setPanelVisible, abrirChat } = useChat()

    const conversaciones = data?.pages.flatMap((p) => p.content) ?? []
    const totalNoLeidos = conversaciones.reduce((acc, c) => acc + (c.noLeidos ?? 0), 0)

    const handleAbrirConversacion = (conv: ConversacionDto) => {
        abrirChat({
            conversacionId: conv.id,
            otroUsuarioName: conv.otroUsuarioName,
            otroUsuarioPhotoUrl: conv.otroUsuarioPhotoUrl
        })
        setPanelVisible(false) // Panel colocado en Layout.tsx, el contexto lo manda a abrir
    }

    const formatTiempo = (iso?: string | null) => {
        if (!iso) return ""
        const d = new Date(iso)
        const ahora = new Date()
        const diffMin = Math.floor((ahora.getTime() - d.getTime()) / 60000)
        if (diffMin < 1) return "ahora"
        if (diffMin < 60) return `${diffMin}m`
        if (diffMin < 1440) return `${Math.floor(diffMin / 60)}h`
        return d.toLocaleDateString()
    }

    return (
        <>
            {/* Botón */}
            <button
                type="button"
                onClick={onClick}
                className="p-2 relative flex items-center justify-center w-8 h-8 rounded-full hover:bg-gray-100 cursor-pointer border border-gray-300"
            >
                <FaComment className="text-gray-500" />
                {totalNoLeidos > 0 && (
                    <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full px-1.5 py-0.5">
                        {totalNoLeidos > 9 ? "9+" : totalNoLeidos}
                    </span>
                )}
            </button>

            {/* Dropdown */}
            {panelVisible && (
                <div className="absolute right-0 top-10 w-80 bg-white border border-gray-200 rounded-lg shadow-lg z-30">
                    {/* Header */}
                    <div className="flex items-center justify-between px-3 py-2 border-b border-gray-200">
                        <span className="text-sm font-semibold text-gray-800">Mensajes</span>
                        <button
                            onClick={() => setPanelVisible(false)}
                            className="text-gray-400 hover:text-gray-600"
                        >
                            <FaTimes style={{ fontSize: 14 }} />
                        </button>
                    </div>

                    {/* Lista de conversaciones */}
                    <div className="max-h-96 overflow-y-auto">
                        {isLoading && <p className="px-4 py-3 text-sm text-gray-400">Cargando...</p>}

                        {!isLoading && conversaciones.length === 0 && <p className="px-4 py-3 text-sm text-gray-400">No tienes conversaciones aún.</p>}

                        {conversaciones.map((conv) => (
                            <button
                                key={conv.id}
                                onClick={() => handleAbrirConversacion(conv)}
                                className="w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-50 text-left cursor-pointer"
                            >
                                <div className="relative shrink-0">
                                    {conv.otroUsuarioPhotoUrl ? (
                                        <img
                                            src={conv.otroUsuarioPhotoUrl}
                                            className="w-9 h-9 rounded-full object-cover"
                                            alt=""
                                        />
                                    ) : (
                                        <div className="w-9 h-9 rounded-full bg-gray-200 flex items-center justify-center">
                                            <FaUser className="text-gray-400" style={{ fontSize: 16 }} />
                                        </div>
                                    )}
                                </div>
                                <div className="flex-1 flex justify-between items-center min-w-0">
                                    <div className="flex flex-col justify-between w-full">
                                        <span className={`text-sm truncate ${conv.noLeidos > 0 ? "font-semibold" : "font-medium"}`}>
                                            {conv.otroUsuarioName}
                                        </span>
                                        <div className="flex items-center">
                                            <p className={`text-xs truncate ${conv.noLeidos > 0 ? "text-gray-800 font-medium" : "text-gray-400"}`}>
                                                {conv.ultimoMensaje ?? "Iniciar conversación"}
                                            </p>
                                            <span className="text-xs text-gray-400 shrink-0 ml-1">
                                                · {formatTiempo(conv.ultimoMensajeEn)}
                                            </span>
                                        </div>
                                    </div>
                                    {conv.noLeidos > 0 && (
                                        <span className="ml-1 shrink-0 bg-blue-600 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                                            {conv.noLeidos > 9 ? "9+" : conv.noLeidos}
                                        </span>
                                    )}
                                </div>
                            </button>
                        ))}
                    </div>
                </div>
            )}
        </>
    )
}