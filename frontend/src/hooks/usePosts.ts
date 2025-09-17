import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { actualizarPost, cargarComentarios, cargarReacciones, crearComentario, crearPost, eliminarComentario, eliminarPost, obtenerComentario, obtenerFeed, obtenerPost, reaccionarAPost, type ReactionEnum, type ReactionSummary, type UpdateCommentPayload, type UpdatePostPayload } from "../services/PostService"
import { actualizarComentario } from "../services/PostService"

// Hooks para interactuar con los posts
export function useFeed(page = 0, size = 10) {
    return useQuery({ queryKey: ["feed", page, size], queryFn: () => obtenerFeed(page, size) })
}

export function usePost(postId?: number | null) {
    const queryClient = useQueryClient()
    const id = typeof postId === "number" && postId > 0 ? postId : undefined

    return useQuery({
        queryKey: ["post", id],
        enabled: !!id,
        queryFn: () => obtenerPost(id as number),
        initialData: () => {
            // Acá se hidrata desde feeds en caché para evitar parpadeos
            const feeds = queryClient.getQueriesData<any>({ queryKey: ["feed"] })
            for (const [, page] of feeds) {
                const found = page?.content?.find((p: any) => p.id === id)
                if (found) return found
            }
            return undefined
        },
    })
}

export function useCreatePost() {
    const queryClient = useQueryClient()
    return useMutation({
        mutationFn: crearPost,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["feed"] })
        }
    })
}

export function useUpdatePost() {
    const queryClient = useQueryClient()
    return useMutation({
        mutationFn: (vars: { id: number } & UpdatePostPayload) => actualizarPost(vars.id, vars),
        onSuccess: (updated, vars) => {
            // Detalle
            queryClient.setQueryData(["post", vars.id], updated)
            // Feed en caché
            queryClient.setQueriesData<any>({ queryKey: ["feed"] }, (old: any) => {
                if (!old) return old
                const next = { ...old }
                next.content = old.content?.map((p: any) =>
                    p.id === vars.id ? { ...p, ...updated } : p
                )
                return next
            })
        }
    })
}

export function useDeletePost() {
    const queryClient = useQueryClient()
    return useMutation({
        mutationFn: (id: number) => eliminarPost(id),
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ["feed"] })
    })
}

// Hook para manejar los comentarios de un post
export function useComments(postId?: number | null, page = 0, size = 10) {
    const id = typeof postId === "number" && postId > 0 ? postId : undefined
    return useQuery({
        queryKey: ["comments", id, page, size],
        enabled: !!id,
        queryFn: () => cargarComentarios(id!, page, size),
    })
}

export function useComment(commentId?: number | null) {
    const id = typeof commentId === "number" && commentId > 0 ? commentId : undefined
    return useQuery({
        queryKey: ["comment", id],
        enabled: !!id,
        queryFn: () => obtenerComentario(id!),
        staleTime: 0,
    })
}

export function useCreateComment(postId: number) {
    const queryClient = useQueryClient()
    return useMutation({
        mutationFn: (data: { comment: string; media?: File }) => crearComentario(postId, data),
        onSuccess: () => {
            //para invalidar cualquier página/tamaño de los comentarios de este post
            queryClient.invalidateQueries({
                predicate: (query) => Array.isArray(query.queryKey) && query.queryKey[0] === "comments" && query.queryKey[1] === postId
            })
        }
    })
}

export function useUpdateComment(postId: number) {
    const queryClient = useQueryClient()
    return useMutation({
        mutationFn: (vars: { id: number } & UpdateCommentPayload) =>
            actualizarComentario(vars.id, vars),
        onSuccess: (_updated, vars) => {
            queryClient.invalidateQueries({ queryKey: ["comment", vars.id] }) //refresca el comentario puntual
            if (postId) {// refresca solo las listas del post afectado
                queryClient.invalidateQueries({
                    predicate: (q) =>
                        Array.isArray(q.queryKey) &&
                        q.queryKey[0] === "comments" &&
                        q.queryKey[1] === postId
                })
            } else {
                queryClient.invalidateQueries({ queryKey: ["comments"] }) //fallback
            }
        }
    })
}

export function useDeleteComment(postId: number) {
    const queryClient = useQueryClient()
    return useMutation({
        mutationFn: (id: number) => eliminarComentario(id),
        onSuccess: () => {
            queryClient.invalidateQueries({
                predicate: (query) => Array.isArray(query.queryKey) && query.queryKey[0] === "comments" && query.queryKey[1] === postId
            })
        }
    })
}

// Hook para manejar las reacciones de un post

export function usePostReactions(postId?: number | null) {
    const queryClient = useQueryClient()
    const id = typeof postId === "number" && postId > 0 ? postId : undefined

    return useQuery<ReactionSummary>({
        queryKey: ["postReactions", id],
        enabled: !!id,
        queryFn: () => cargarReacciones(id!),

        initialData: () => { //hidrata desde feed/detalle si ya existe
            if (!id) return undefined
            const detail = queryClient.getQueryData<any>(["post", id])
            if (detail?.reactions) return detail.reactions as ReactionSummary
            const feeds = queryClient.getQueriesData<any>({ queryKey: ["feed"] })
            for (const [, page] of feeds) {
                const found = page?.content?.find((p: any) => p.id === id)
                if (found?.reactions) return found.reactions as ReactionSummary
            }
            return undefined
        },
        staleTime: 15_000,
        gcTime: 5 * 60_000,
    })
}

export function useReactToPost() {
    const qc = useQueryClient()
    return useMutation({
        mutationFn: (vars: { postId: number; type: "like" | "love" | "care" | "haha" | "wow" | "sad" | "angry" | null }) => reaccionarAPost(vars.postId, vars.type),
        //Mutación optimista
        onMutate: async (vars) => {
            const key = ["postReactions", vars.postId] as const
            await qc.cancelQueries({ queryKey: key })

            const previous = qc.getQueryData<ReactionSummary>(key)
            const prev = previous ?? { postId: vars.postId, total: 0, counts: {} as any, myReaction: null }

            const toEnum = (k: string) => k.toUpperCase() as ReactionEnum
            const newType = vars.type ? toEnum(vars.type) : null
            const next: ReactionSummary = {
                postId: prev.postId,
                total: prev.total,
                counts: { ...prev.counts },
                myReaction: prev.myReaction,
            }

            //Decrementa anterior si existía
            if (prev.myReaction) {
                const old = prev.myReaction
                next.counts[old] = Math.max(0, (next.counts[old] ?? 0) - 1)
                next.total = Math.max(0, next.total - 1)
                next.myReaction = null
            }

            //Asigna nueva si procede
            if (newType) {
                next.counts[newType] = (next.counts[newType] ?? 0) + 1
                next.total += 1
                next.myReaction = newType
            }

            //Escribe optimista
            qc.setQueryData(key, next)
            //También refleja en feed y detalle si están cacheados
            qc.setQueriesData<any>({ queryKey: ["feed"] }, (old: any) => {
                if (!old?.content) return old
                return {
                    ...old,
                    content: old.content.map((p: any) =>
                        p.id === vars.postId ? { ...p, reactions: next, likesCount: next.total } : p
                    ),
                }
            })
            qc.setQueryData(["post", vars.postId], (old: any) =>
                old ? { ...old, reactions: next, likesCount: next.total } : old
            )

            return { previous, key }
        },
        onError: (_err, _vars, ctx) => {
            if (ctx?.previous) qc.setQueryData(ctx.key!, ctx.previous)
        },
        onSuccess: (summary) => {
            //Cambia por la respuesta normalizada del backend
            const key = ["postReactions", summary.postId] as const
            qc.setQueryData(key, summary)
            qc.setQueriesData<any>({ queryKey: ["feed"] }, (old: any) => {
                if (!old?.content) return old
                return {
                    ...old,
                    content: old.content.map((p: any) =>
                        p.id === summary.postId ? { ...p, reactions: summary, likesCount: summary.total } : p
                    ),
                }
            })
            qc.setQueryData(["post", summary.postId], (old: any) =>
                old ? { ...old, reactions: summary, likesCount: summary.total } : old
            )
        },
        onSettled: (_d, _e, vars) => {
            qc.invalidateQueries({ queryKey: ["postReactions", vars.postId] })
        },
    })
}