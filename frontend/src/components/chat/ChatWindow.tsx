import { useAuth } from "@/auth/AuthContext"
import { useChat } from "@/context/ChatContext"
import { useEnviarMensaje, useEnviarMensajeConImagen, useMarcarComoLeidos, useMensajes } from "@/hooks/useChats"
import type { MensajeDto } from "@/services/ChatService"
import { useEffect, useRef, useState, type ChangeEvent, type KeyboardEvent } from "react"
import { FaImage, FaPaperPlane, FaTimes, FaUser } from "react-icons/fa"

type Props = {
    conversacionId: number
    otroUsuarioName: string
    otroUsuarioPhotoUrl?: string | null
}

export default function ChatWindow({ conversacionId, otroUsuarioName, otroUsuarioPhotoUrl }: Props) {
    const { user } = useAuth()
    const { cerrarChat, enviarMensaje: enviarWs, enviarTyping, enviarLeido, typingState } = useChat()
    const [texto, setTexto] = useState("")
    const [minimizado, setMinimizado] = useState(false)
    const endRef = useRef<HTMLDivElement>(null)
    const typingTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
    const fileInputRef = useRef<HTMLInputElement>(null)

    const { data, isLoading, fetchNextPage, hasNextPage } = useMensajes(conversacionId)
    const enviarMensaje = useEnviarMensaje(conversacionId)
    const enviarConImagen = useEnviarMensajeConImagen(conversacionId)
    const marcarLeidos = useMarcarComoLeidos()

    // Aplanar páginas - los mensajes llegan más recientes primero, invertir para mostrar cronológicamente
    const mensajes = data?.pages.flatMap((p) => p.content).reverse() ?? []

    const estaEscribiendo = typingState[conversacionId] ?? false

    // Scroll al último mensaje cuando llegan nuevos
    useEffect(() => {
        if (!minimizado) endRef.current?.scrollIntoView({ behavior: "smooth" })
    }, [mensajes.length, minimizado])

    // Marcar como leídos al abrir o recibir mensajes
    useEffect(() => {
        if (!minimizado && conversacionId) {
            marcarLeidos.mutate(conversacionId)
            enviarLeido(conversacionId)
        }
    }, [conversacionId, minimizado, mensajes.length])

    const handleEnviar = () => {
        const contenido = texto.trim()
        if (!contenido) return

        // Envío por WS y de paso por HTTP por persistencia
        enviarWs(conversacionId, contenido)
        enviarMensaje.mutate(contenido)
        setTexto("")

        // Apagar typing
        enviarTyping(conversacionId, false)
        if (typingTimerRef.current) clearTimeout(typingTimerRef.current)
    }

    const handleTextoChange = (e: ChangeEvent<HTMLTextAreaElement>) => {
        setTexto(e.target.value)
        enviarTyping(conversacionId, true)

        // Apagar typing tras 2s de inactividad
        if (typingTimerRef.current) clearTimeout(typingTimerRef.current)
        typingTimerRef.current = setTimeout(() => {
            enviarTyping(conversacionId, false)
        }, 2000)
    }

    const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault()
            handleEnviar()
        }
    }

    const handleImagen = (e: ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (!file) return
        enviarConImagen.mutate({ file })
        e.target.value = ""
    }

    const formatHora = (iso: string) => new Date(iso).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })

    return (
        <div className="w-72 bg-white border border-gray-300 rounded-t-lg shadow-xl flex flex-col">
            {/* Header */}
            <div
                className="flex items-center gap-2 px-3 py-2 bg-blue-600 text-white rounded-t-lg cursor-pointer select-none"
                onClick={() => setMinimizado((v) => !v)}
            >
                {otroUsuarioPhotoUrl ? (
                    <img src={otroUsuarioPhotoUrl} className="w-7 h-7 rounded-full object-cover" alt="" />
                ) : (
                    <div className="w-7 h-7 rounded-full bg-blue-400 flex items-center justify-center">
                        <FaUser style={{ fontSize: 12 }} />
                    </div>
                )}
                <span className="text-sm font-medium flex-1 truncate">{otroUsuarioName}</span>
                <button
                    onClick={(e) => { e.stopPropagation(); cerrarChat(conversacionId) }}
                    className="hover:bg-blue-700 rounded p-1"
                >
                    <FaTimes style={{ fontSize: 11 }} />
                </button>
            </div>

            {!minimizado && (
                <>
                    {/* Mensajes */}
                    <div className="flex-1 h-64 overflow-y-auto px-3 py-2 space-y-1 flex flex-col">
                        {hasNextPage && (
                            <button
                                onClick={() => fetchNextPage()}
                                className="text-xs text-blue-500 hover:underline self-center mb-1"
                            >
                                Cargar mensajes anteriores
                            </button>
                        )}
                        {isLoading && <p className="text-xs text-gray-400 text-center">Cargando...</p>}
                        {mensajes.map((m: MensajeDto) => {
                            const esMio = m.autorId === user?.id
                            return (
                                <div key={m.id} className={`flex ${esMio ? "justify-end" : "justify-start"}`}>
                                    <div className={`max-w-[80%] px-3 py-1.5 rounded-2xl text-sm ${esMio
                                        ? "bg-blue-600 text-white rounded-br-sm"
                                        : "bg-gray-100 text-gray-800 rounded-bl-sm"
                                        }`}>
                                        {m.tipo === "IMAGE" && m.mediaUrl && (
                                            <img src={m.mediaUrl} alt="imagen" className="rounded max-w-full mb-1" />
                                        )}
                                        {m.contenido && <p>{m.contenido}</p>}
                                        <span className={`text-xs mt-0.5 block text-right ${esMio ? "text-blue-200" : "text-gray-400"}`}>
                                            {formatHora(m.creadoEn)}
                                            {esMio && (
                                                <span className="ml-1">{m.leido ? "✓✓" : "✓"}</span>
                                            )}
                                        </span>
                                    </div>
                                </div>
                            )
                        })}
                        {estaEscribiendo && (
                            <div className="flex justify-start">
                                <div className="bg-gray-100 px-3 py-2 rounded-2xl rounded-bl-sm">
                                    <span className="text-xs text-gray-400 italic">{otroUsuarioName} está escribiendo...</span>
                                </div>
                            </div>
                        )}
                        <div ref={endRef} />
                    </div>

                    {/* Input */}
                    <div className="border-t px-2 py-2 flex items-end gap-2">
                        <input
                            ref={fileInputRef}
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={handleImagen}
                        />
                        <button
                            onClick={() => fileInputRef.current?.click()}
                            className="text-gray-400 hover:text-blue-500 p-1 shrink-0"
                        >
                            <FaImage style={{ fontSize: 16 }} />
                        </button>
                        <textarea
                            value={texto}
                            onChange={handleTextoChange}
                            onKeyDown={handleKeyDown}
                            rows={1}
                            placeholder="Aa"
                            className="flex-1 resize-none text-sm border rounded-full px-3 py-1.5 focus:outline-none focus:border-blue-400"
                            style={{ maxHeight: 80 }}
                        />
                        <button
                            onClick={handleEnviar}
                            disabled={!texto.trim()}
                            className="text-blue-600 hover:text-blue-700 disabled:text-gray-300 p-1 shrink-0"
                        >
                            <FaPaperPlane style={{ fontSize: 16 }} />
                        </button>
                    </div>
                </>
            )}
        </div>
    )
}