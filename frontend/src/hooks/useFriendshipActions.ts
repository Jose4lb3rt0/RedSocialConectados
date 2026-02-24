import { useMemo, useRef } from "react"
import { useFriends } from "./useFriends"
import { useQueryClient } from "@tanstack/react-query"

export interface FriendshipStatus {
    status: "friend" | "incoming" | "outgoing" | "none"
    outgoingRequestId?: number
    incomingRequestId?: number
}

export function useFriendshipActions(context: "inicio" | "solicitudes" | "todos" | "cumpleaños" = "inicio") {
    const inFlight = useRef<Set<number>>(new Set())
    const queryClient = useQueryClient()

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
        cancelarSolicitud.mutate(requestId, {
            onSuccess: () => queryClient.invalidateQueries({ queryKey: ["posts", "feed"] })
        })
    }

    // Aceptar solicitud
    function handleAccept(requestId: number) {
        aceptarSolicitud.mutate(requestId, {
            onSuccess: () => queryClient.invalidateQueries({ queryKey: ["posts", "feed"] })
        })
    }

    // Rechazar solicitud
    function handleReject(requestId: number) {
        rechazarSolicitud.mutate(requestId, {
            onSuccess: () => queryClient.invalidateQueries({ queryKey: ["posts", "feed"] })
        })
    }

    // Eliminar amigo
    function handleRemove(userId: number) {
        eliminarAmigo.mutate(userId, {
            onSuccess: () => {
                queryClient.setQueriesData<any>(
                    { queryKey: ["posts", "feed"] },
                    (oldData: any) => {
                        if (!oldData) return oldData

                        return {
                            ...oldData,
                            content: oldData.content.filter(
                                (post: any) => post.authorId !== userId
                            )
                        }
                    }
                )

                //delay para que alcance a eliminar las publicaciones del feed antes de volver a consultar
                setTimeout(() => {
                    queryClient.invalidateQueries({ queryKey: ["posts", "feed"] })
                }, 5000)
            }
        })
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