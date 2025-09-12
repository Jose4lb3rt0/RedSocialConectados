import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { actualizarPost, crearPost, eliminarPost, obtenerFeed, obtenerPost, type UpdatePostPayload } from "../services/PostService";

export function useFeed(page = 0, size = 10) {
    return useQuery({ queryKey: ["feed", page, size], queryFn: () => obtenerFeed(page, size) })
}

export function usePost(postId?: number | null) {
    return useQuery({
        queryKey: ["post", postId],
        enabled: typeof postId === "number" && postId > 0, // no se consulta si no hay id válido
        queryFn: () => obtenerPost(postId as number),
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