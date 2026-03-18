import { enviarMensajeConImagen, enviarMensajeHttp, listarConversaciones, listarMensajes, marcarComoLeidos, obtenerOCrearConversacion, type ConversacionDto, type MensajeDto } from "@/services/ChatService";
import type { Page } from "@/services/UserService";
import { useInfiniteQuery, useMutation, useQueryClient } from "@tanstack/react-query";

export function useConversaciones(size = 20) {
    return useInfiniteQuery<Page<ConversacionDto>>({
        queryKey: ["chat", "conversaciones"],
        queryFn: ({ pageParam = 0 }) => listarConversaciones(pageParam as number, size),
        initialPageParam: 0,
        getNextPageParam: (lastPage) =>
            lastPage.number + 1 < lastPage.totalPages ? lastPage.number + 1 : undefined,
        staleTime: 30_000
    })
}

export function useMensajes(conversacionId: number | null, size = 30) {
    return useInfiniteQuery<Page<MensajeDto>>({
        queryKey: ["chat", "mensajes", conversacionId],
        queryFn: ({ pageParam = 0 }) => listarMensajes(conversacionId!, pageParam as number, size),
        initialPageParam: 0,
        getNextPageParam: (lastPage) =>
            lastPage.number + 1 < lastPage.totalPages ? lastPage.number + 1 : undefined,
        enabled: !!conversacionId,
        staleTime: 0
    })
}

export function useObtenerOCrearConversacion() {
    const qc = useQueryClient()
    return useMutation({
        mutationFn: (otroUsuarioId: number) => obtenerOCrearConversacion(otroUsuarioId),
        onSuccess: (conv) => {
            qc.setQueryData<any>(["chat", "conversaciones"], (old: any) => {
                if (!old?.pages) return old

                const yaExiste = old.pages[0]?.content?.some((c: ConversacionDto) => c.id === conv.id)
                if (yaExiste) return old

                return {
                    ...old,
                    pages: [
                        { ...old.pages[0], content: [conv, ...(old.pages[0]?.content ?? [])] },
                        ...old.pages.slice(1)
                    ]
                }
            })
        }
    })
}

export function useEnviarMensaje(conversacionId: number) {
    const qc = useQueryClient()
    return useMutation({
        mutationFn: (contenido: string) => enviarMensajeHttp(conversacionId, contenido),
        onSuccess: (mensaje) => {
            agregarMensajeAlCache(qc, mensaje)
            actualizarPreviewConversacion(qc, mensaje)
        }
    })
}

export function useEnviarMensajeConImagen(conversacionId: number) {
    const qc = useQueryClient()
    return useMutation({
        mutationFn: ({ file, contenido }: { file: File; contenido?: string }) => enviarMensajeConImagen(conversacionId, file, contenido),
        onSuccess: (mensaje) => {
            agregarMensajeAlCache(qc, mensaje)
            actualizarPreviewConversacion(qc, mensaje)
        },
    })
}

export function useMarcarComoLeidos() {
    const qc = useQueryClient()
    return useMutation({
        mutationFn: (conversacionId: number) => marcarComoLeidos(conversacionId),
        onSuccess: (_v, conversacionId) => {
            // Poner noLeidos en 0 en el preview de la conversación
            qc.setQueryData<any>(["chat", "conversaciones"], (old: any) => {
                if (!old?.pages) return old

                return {
                    ...old,
                    pages: old.pages.map((page: any) => ({
                        ...page,
                        content: page.content.map((c: ConversacionDto) =>
                            c.id === conversacionId ? { ...c, noLeidos: 0 } : c
                        )
                    }))
                }
            })
        }
    })
}

// ---------- HELPERS PARA EL CACHÉ ---------- //

export function agregarMensajeAlCache(qc: ReturnType<typeof useQueryClient>, mensaje: MensajeDto) {
    qc.setQueryData<any>(["chat", "mensajes", mensaje.conversacionId], (old: any) => {
        if (!old?.pages) return old

        const yaExiste = old.pages[0]?.content?.some((m: MensajeDto) => m.id === mensaje.id)
        if (yaExiste) return old

        return {
            ...old,
            pages: [
                { ...old.pages[0], content: [mensaje, ...(old.pages[0]?.content ?? [])] },
                ...old.pages.slice(1)
            ]
        }
    })
}

export function actualizarPreviewConversacion(qc: ReturnType<typeof useQueryClient>, mensaje: MensajeDto) {
    qc.setQueryData<any>(["chat", "conversaciones"], (old: any) => {
        if (!old?.pages) return old

        return {
            ...old,
            pages: old.pages.map((page: any) => ({
                ...page,
                content: page.content.map((c: ConversacionDto) =>
                    c.id === mensaje.conversacionId
                        ? {
                            ...c,
                            ultimoMensaje: mensaje.tipo === "IMAGE" ? "📸 Imagen" : mensaje.contenido,
                            ultimoMensajeTipo: mensaje.tipo,
                            ultimoMensajeEn: mensaje.creadoEn
                          }
                        : c
                )   
            }))
        }
    })
}