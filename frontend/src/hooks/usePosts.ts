import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { actualizarPost, cargarComentarios, crearComentario, crearPost, eliminarComentario, eliminarPost, obtenerComentario, obtenerFeed, obtenerPost, type UpdateCommentPayload, type UpdatePostPayload } from "../services/PostService"
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