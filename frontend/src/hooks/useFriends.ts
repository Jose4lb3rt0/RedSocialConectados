import {
    enviarSolicitud as enviarSolicitudService,
    aceptarSolicitud as aceptarSolicitudService,
    rechazarSolicitud as rechazarSolicitudService,
    cancelarSolicitud as cancelarSolicitudService,
    listarInbox as listarInboxService,
    listarOutbox as listarOutboxService,
    listarAmigos as listarAmigosService,
    eliminarAmigo as eliminarAmigoService,
    listarSugerencias as listarSugerenciasService
} from "@/services/FriendsService"
import type { Page, UserSummary } from "@/services/UserService"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"

export interface FriendRequest {
    id: number
    fromUser: UserSummary
    toUser: UserSummary
    estado: "PENDIENTE" | "ACEPTADA" | "RECHAZADA" | "CANCELADA"
    createdAt: string
}

export function useFriends(tab?: string) {
    const qc = useQueryClient()

    const amigos = useQuery<Page<UserSummary>>({
        queryKey: ["friends", "list", { page: 0 }],
        queryFn: () => listarAmigosService(),
        enabled: tab === "todos" || tab === "inicio",
        staleTime: 15_000
    })

    const sugerencias = useQuery<Page<UserSummary>>({
        queryKey: ["friends", "suggestions", { page: 0 }],
        queryFn: () => listarSugerenciasService(),
        enabled: tab === "inicio",
        staleTime: 15_000
    })

    const inbox = useQuery<Page<FriendRequest>>({
        queryKey: ["friendRequests", "inbox", { page: 0 }],
        queryFn: () => listarInboxService(),
        enabled: tab === "solicitudes",
    })

    const outbox = useQuery<Page<FriendRequest>>({
        queryKey: ["friendRequests", "outbox", { page: 0 }],
        queryFn: () => listarOutboxService(),
        staleTime: 10_000,
    })

    function ensurePage<T>(old: any): Page<T> {
        return old ?? { content: [], totalElements: 0, totalPages: 1, number: 0, size: 20 }
    }

    const enviarSolicitud = useMutation({
        mutationFn: (toUserId: number) => enviarSolicitudService(toUserId),
        onSuccess: (req) => {
            qc.setQueryData(["friendRequests", "outbox", { page: 0 }], (old: any) => {
                const page = ensurePage<FriendRequest>(old)
                if (page.content.some(r => r.id === req.id)) return page
                return { ...page, content: [req, ...page.content], totalElements: page.totalElements + 1 }
            })
        },
        onError: (e) => console.error("Error al enviar solicitud", e)
    })

    const aceptarSolicitud = useMutation({
        mutationFn: (id: number) => aceptarSolicitudService(id),
        onSuccess: (req) => {
            //quitar de inbox
            qc.setQueryData(["friendRequests", "inbox", { page: 0 }], (old: any) => {
                const page = ensurePage<FriendRequest>(old)
                return { ...page, content: page.content.filter(r => r.id !== req.id), totalElements: Math.max(0, page.totalElements - 1) }
            })

            //agregar amigo
            const newFriend = req.fromUser
            qc.setQueryData(["friends", "list", { page: 0 }], (old: any) => {
                const page = ensurePage<UserSummary>(old)
                if (page.content.some(f => f.id === newFriend.id)) return page
                return { ...page, content: [newFriend, ...page.content], totalElements: page.totalElements + 1 }
            })

            //remover de sugerencias
            qc.setQueryData(["friends", "suggestions", { page: 0 }], (old: any) => {
                if (!old) return old
                return {
                    ...old,
                    content: old.content.filter((u: any) => u.id !== newFriend.id),
                    totalElements: Math.max(0, old.totalElements - 1)
                }
            })

            //invalidar feed
            qc.invalidateQueries({ queryKey: ["posts", "feed"] })
        }
    })

    const rechazarSolicitud = useMutation({
        mutationFn: (id: number) => rechazarSolicitudService(id),
        onSuccess: (req, id) => {
            qc.setQueryData(["friendRequests", "inbox", { page: 0 }], (old: any) => {
                const page = ensurePage<FriendRequest>(old)
                return { ...page, content: page.content.filter(r => r.id !== id), totalElements: Math.max(0, page.totalElements - 1) }
            })

            qc.setQueryData(["friends", "suggestions", { page: 0 }], (old: any) => {
                const page = ensurePage<UserSummary>(old)
                const user = req.fromUser
                if (page.content.some(u => u.id === user.id)) return page
                return { ...page, content: [user, ...page.content], totalElements: page.totalElements + 1 }
            })

            qc.invalidateQueries({ queryKey: ["posts", "feed"] })
        }
    })

    const cancelarSolicitud = useMutation({
        mutationFn: (id: number) => cancelarSolicitudService(id),
        onSuccess: (req, id) => {
            qc.setQueryData(["friendRequests", "outbox", { page: 0 }], (old: any) => {
                const page = ensurePage<FriendRequest>(old)
                const content = page.content.filter(r => r.id !== id)
                return { ...page, content, totalElements: Math.max(0, page.totalElements - 1) }
            })

            qc.setQueryData(["friends", "suggestions", { page: 0 }], (old: any) => {
                const page = ensurePage<UserSummary>(old)
                const user = req.toUser
                if (page.content.some(u => u.id === user.id)) return page
                return { ...page, content: [user, ...page.content], totalElements: page.totalElements + 1 }
            })

            qc.invalidateQueries({ queryKey: ["posts", "feed"] })
        }
    })

    const eliminarAmigo = useMutation({
        mutationFn: (userId: number) => eliminarAmigoService(userId),
        onSuccess: (req, userId) => {
            const usuarioQuitar = amigos.data?.content?.find(u => u.id === userId)

            qc.setQueryData(["friends", "list", { page: 0 }], (old: any) => {
                const page = ensurePage<UserSummary>(old)
                return { ...page, content: page.content.filter(u => u.id !== userId), totalElements: Math.max(0, page.totalElements - 1) }
            })

            if (usuarioQuitar) {
                qc.setQueryData(["friends", "suggestions", { page: 0 }], (old: any) => {
                    const page = ensurePage<UserSummary>(old)
                    if (page.content.some(u => u.id === userId)) return page
                    return { ...page, content: [usuarioQuitar, ...page.content], totalElements: page.totalElements + 1 }
                })
            } else {
                qc.invalidateQueries({ queryKey: ["friends", "suggestions"] })
            }

            qc.invalidateQueries({ queryKey: ["posts", "feed"] })
        }
    })

    return {
        amigos, sugerencias, inbox, outbox,
        enviarSolicitud, aceptarSolicitud, rechazarSolicitud, cancelarSolicitud, eliminarAmigo
    }
}
