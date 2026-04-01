import { Link } from "react-router-dom"
import { FaUser } from "react-icons/fa"
import { useFriendshipActions } from "@/hooks/useFriendshipActions"
import { usePresence } from "@/hooks/usePresence"
import { useObtenerOCrearConversacion } from "@/hooks/useChats"
import { useChat } from "@/context/ChatContext"
import type { UserSummaryResponse } from "@/services/FriendsService"

// El tipo que devuelve amigos en useFriendshipActions
type Amigo = {
    id: number
    authorName: string
    authorSurname: string
    authorSlug: string
    authorPhoto?: string | null
    email?: string | null
}

export default function RightAside() {
    const { amigos } = useFriendshipActions("todos")
    const { estaConectado } = usePresence()
    const obtenerOCrear = useObtenerOCrearConversacion()
    const { abrirChat } = useChat()

    const lista: Amigo[] = amigos.data?.content ?? []

    const handleAbrirChat = async (amigo: Amigo) => {
        const conv = await obtenerOCrear.mutateAsync(amigo.id)
        abrirChat({
            conversacionId: conv.id,
            otroUsuarioName: conv.otroUsuarioName,
            otroUsuarioPhotoUrl: conv.otroUsuarioPhotoUrl,
        })
    }

    return (
        <aside className="w-72 shrink-0 h-full overflow-y-auto px-2 py-4">
            <p className="px-3 text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
                Contactos
            </p>

            {lista.length === 0 && !amigos.isLoading && (
                <p className="px-3 text-sm text-gray-400">No tienes amigos aún.</p>
            )}

            {lista.map(amigo => {
                const conectado = estaConectado(amigo.email)
                return (
                    <button
                        key={amigo.id}
                        onClick={() => handleAbrirChat(amigo)}
                        className="w-full flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-gray-100 transition-colors text-left"
                    >
                        {/* Avatar con indicador de presencia */}
                        <div className="relative shrink-0">
                            {amigo.authorPhoto ? (
                                <img
                                    src={amigo.authorPhoto}
                                    alt={amigo.authorName}
                                    className="w-9 h-9 rounded-full object-cover"
                                />
                            ) : (
                                <div className="w-9 h-9 rounded-full bg-gray-200 flex items-center justify-center">
                                    <FaUser className="text-gray-400" style={{ fontSize: 14 }} />
                                </div>
                            )}
                            {/* Puntito verde si está conectado */}
                            {conectado && (
                                <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white" />
                            )}
                        </div>

                        <span className="text-sm font-medium text-gray-800 truncate">
                            {amigo.authorName} {amigo.authorSurname}
                        </span>
                    </button>
                )
            })}
        </aside>
    )
}
