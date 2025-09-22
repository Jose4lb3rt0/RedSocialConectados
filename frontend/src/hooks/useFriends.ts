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
        enabled: tab === "inicio", //eliminé "sugerencias" en la pagina
        staleTime: 15_000
    })

    const inbox = useQuery<Page<FriendRequest>>({
        queryKey: ["friendRequests", "inbox", { page: 0 }],
        queryFn: () => listarInboxService(),
        enabled: tab === "solicitudes",
    })

    const outbox = useQuery<Page<FriendRequest>>({ //Siempre habilitado porque se usa para saber estado en “inicio” y “todos”
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
            // qc.invalidateQueries({ queryKey: ["friendRequests", "outbox"] })
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
            // qc.invalidateQueries({ queryKey: ["friendRequests", "inbox"] })
            // qc.invalidateQueries({ queryKey: ["friends"] })

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
        }
    })

    const rechazarSolicitud = useMutation({
        mutationFn: (id: number) => rechazarSolicitudService(id),
        onSuccess: (_v, id) => {
            // qc.invalidateQueries({ queryKey: ["friendRequests", "inbox"] })
            qc.setQueryData(["friendRequests", "inbox", { page: 0 }], (old: any) => {
                const page = ensurePage<FriendRequest>(old)
                return { ...page, content: page.content.filter(r => r.id !== id), totalElements: Math.max(0, page.totalElements - 1) }
            })
        }
    })

    const cancelarSolicitud = useMutation({
        mutationFn: (id: number) => cancelarSolicitudService(id),
        onSuccess: (_v, id) => {
            // qc.invalidateQueries({ queryKey: ["friendRequests", "outbox"] })
            qc.setQueryData(["friendRequests", "outbox", { page: 0 }], (old: any) => {
                const page = ensurePage<FriendRequest>(old)
                const content = page.content.filter(r => r.id !== id)
                return { ...page, content, totalElements: Math.max(0, page.totalElements - 1) }
            })
        }
    })

    const eliminarAmigo = useMutation({
        mutationFn: (userId: number) => eliminarAmigoService(userId),
        onSuccess: (_v, userId) => {
            // qc.invalidateQueries({ queryKey: ["friends"] })
            qc.setQueryData(["friends", "list", { page: 0 }], (old: any) => {
                const page = ensurePage<UserSummary>(old)
                return { ...page, content: page.content.filter(u => u.id !== userId), totalElements: Math.max(0, page.totalElements - 1) }
            })
        }
    })

    return {
        amigos, sugerencias, inbox, outbox,
        enviarSolicitud, aceptarSolicitud, rechazarSolicitud, cancelarSolicitud, eliminarAmigo
    }
}
