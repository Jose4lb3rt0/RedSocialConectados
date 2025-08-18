import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { actualizarPost, crearPost, eliminarPost, obtenerFeed } from "../services/PostService";

export function useFeed(page = 0, size = 10) {
    return useQuery({ queryKey: ["feed", page, size], queryFn: () => obtenerFeed(page, size) })
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
        mutationFn: ({ id, content }: { id: number; content: string }) => actualizarPost(id, { content }),
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ["feed"] })
    })
}

export function useDeletePost() {
    const queryClient = useQueryClient()
    return useMutation({
        mutationFn: (id: number) => eliminarPost(id),
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ["feed"] })
    })
}