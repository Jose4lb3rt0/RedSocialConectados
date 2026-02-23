import { useMemo, useRef } from "react"
import { useFriends } from "./useFriends"

export interface FriendshipStatus {
    status: "friend" | "incoming" | "outgoing" | "none"
    outgoingRequestId?: number
    incomingRequestId?: number
}

export function useFriendshipActions(context: "inicio" | "solicitudes" | "todos" | "cumpleaños" = "inicio") {
    const inFlight = useRef<Set<number>>(new Set())

    const {
        amigos,
        inbox,
        outbox,
        sugerencias,
        enviarSolicitud,
        aceptarSolicitud,
        rechazarSolicitud,
        cancelarSolicitud,
        eliminarAmigo
    } = useFriends(context)

    // Mapas de amistad
    const amigosSet = useMemo(() => new Set(amigos.data?.content.map(u => u.id) ?? []), [amigos.data])
    const incomingMap = useMemo(() => new Map((inbox.data?.content ?? []).map(r => [r.fromUser.id, r.id])), [inbox.data])
    const outgoingMap = useMemo(() => new Map((outbox.data?.content ?? []).map(r => [r.toUser.id, r.id])), [outbox.data])

    // Estado de amistad
    function getStatus(userId: number): FriendshipStatus {
        if (amigosSet.has(userId))
            return { status: "friend" }
        if (incomingMap.has(userId))
            return { status: "incoming", incomingRequestId: incomingMap.get(userId) }
        if (outgoingMap.has(userId))
            return { status: "outgoing", outgoingRequestId: outgoingMap.get(userId) }

        return { status: "none" }
    }

    // Enviar solicitud
    function handleAdd(userId: number) {
        if (inFlight.current.has(userId)) return
        inFlight.current.add(userId)
        enviarSolicitud.mutate(userId, {
            onSettled: (e) => inFlight.current.delete(userId)
        })
    }

    // Cancelar solicitud
    function handleCancel(requestId: number) {
        cancelarSolicitud.mutate(requestId)
    }

    // Aceptar solicitud
    function handleAccept(requestId: number) {
        aceptarSolicitud.mutate(requestId)
    }

    // Rechazar solicitud
    function handleReject(requestId: number) {
        rechazarSolicitud.mutate(requestId)
    }

    // Eliminar amigo
    function handleRemove(userId: number) {
        eliminarAmigo.mutate(userId)
    }

    return {
        getStatus,
        handleAdd,
        handleCancel,
        handleAccept,
        handleReject,
        handleRemove,

        isSending: enviarSolicitud.isPending,
        isCancelling: cancelarSolicitud.isPending,
        isAccepting: aceptarSolicitud.isPending,
        isRejecting: rechazarSolicitud.isPending,
        isRemoving: eliminarAmigo.isPending,

        amigos,
        inbox,
        outbox,
        sugerencias
    }
}