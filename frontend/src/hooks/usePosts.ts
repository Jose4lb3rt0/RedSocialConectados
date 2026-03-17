import {
  useInfiniteQuery,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import { actualizarComentario } from "../services/PostService";
import {
  actualizarPost,
  cargarComentarios,
  cargarReacciones,
  crearComentario,
  crearPost,
  eliminarComentario,
  eliminarPost,
  obtenerComentario,
  obtenerFeed,
  obtenerPost,
  obtenerPostsDelUsuario,
  reaccionarAPost,
  type ReactionEnum,
  type ReactionSummary,
  type UpdateCommentPayload,
  type UpdatePostPayload,
  type PostDto,
} from "../services/PostService";
import type { Page } from "@/services/UserService";

// Hooks para interactuar con los posts
export function useFeed(size = 10) {
  return useInfiniteQuery<Page<PostDto>>({
    queryKey: ["posts", "feed"],
    queryFn: ({ pageParam = 0 }) => obtenerFeed(pageParam as number, size),
    initialPageParam: 0,
    getNextPageParam: (lastPage) =>
      lastPage.number + 1 < lastPage.totalPages
        ? lastPage.number + 1
        : undefined,
    staleTime: 1000 * 60 * 5, // 5 minutos
  });
}

export function usePost(postId?: number | null) {
  const queryClient = useQueryClient();
  const id = typeof postId === "number" && postId > 0 ? postId : undefined;

  return useQuery<PostDto>({
    queryKey: ["post", id],
    enabled: !!id,
    queryFn: () => obtenerPost(id as number),
    initialData: () => {
      // Hidrata desde feeds en caché para evitar parpadeos
      // Con infinite query, el caché tiene estructura { pages: [...] }
      const feeds = queryClient.getQueriesData<any>({
        queryKey: ["posts", "feed"],
      });
      for (const [, data] of feeds) {
        for (const page of data?.pages ?? []) {
          const found = page?.content?.find((p: any) => p.id === id);
          if (found) return found;
        }
      }
      return undefined;
    },
  });
}

export function useUserPosts(userId: number, size = 10) {
  return useInfiniteQuery<Page<PostDto>>({
    queryKey: ["post", "user", userId],
    queryFn: ({ pageParam = 0 }) =>
      obtenerPostsDelUsuario(userId, pageParam as number, size),
    initialPageParam: 0,
    getNextPageParam: (lastPage) =>
      lastPage.number + 1 < lastPage.totalPages
        ? lastPage.number + 1
        : undefined,
    staleTime: 1000 * 60 * 5,
    enabled: userId > 0,
  });
}

export function useCreatePost() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: crearPost,
    onSuccess: (created: PostDto) => {
      // Feed (HomePage)
      queryClient.invalidateQueries({ queryKey: ["posts", "feed"] })

      if (created.authorId) {
        // Inserción optimista en la primera página del infiniteQuery del perfil
        queryClient.setQueryData<any>(
            ["post", "user", created.authorId],
            (old: any) => {
                if (!old?.pages) return old
                const firstPage = old.pages[0]
                const withoutDup = firstPage.content.filter((p: PostDto) => p.id !== created.id)
                const nextContent = [created, ...withoutDup].slice(0, firstPage.size ?? withoutDup.length + 1)

                return {
                    ...old,
                    pages: [
                        {
                            ...firstPage,
                            content: nextContent,
                            totalElements: (firstPage.totalElements ?? 0) + 1
                        },
                        ...old.pages.slice(1)
                    ]
                }
            }
        )

        // Refetch del perfil
        queryClient.invalidateQueries({ queryKey: ["post", "user", created.authorId] })
      }
    },
  });
}

export function useUpdatePost() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (vars: { id: number } & UpdatePostPayload) =>
      actualizarPost(vars.id, vars),

    onSuccess: (updated, vars) => {
      // Detalle
      queryClient.setQueryData(["post", vars.id], updated);
      // Actualiza el post dentro de cada página acumulada del feed
      queryClient.setQueriesData<any>(
        { queryKey: ["posts", "feed"] },
        (old: any) => {
          if (!old?.pages) return old;
          return {
            ...old,
            pages: old.pages.map((page: any) => ({
              ...page,
              content: page.content?.map((p: any) =>
                p.id === vars.id ? { ...p, ...updated } : p,
              ),
            })),
          };
        },
      );
    },
  });
}

export function useDeletePost() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => eliminarPost(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["posts", "feed"] });
      queryClient.invalidateQueries({ queryKey: ["post", "user"] });
    },
  });
}

// Hook para manejar los comentarios de un post
export function useComments(postId?: number | null, page = 0, size = 10) {
  const id = typeof postId === "number" && postId > 0 ? postId : undefined;
  return useQuery({
    queryKey: ["comments", id, page, size],
    enabled: !!id,
    queryFn: () => cargarComentarios(id!, page, size),
  });
}

export function useComment(commentId?: number | null) {
  const id =
    typeof commentId === "number" && commentId > 0 ? commentId : undefined;
  return useQuery({
    queryKey: ["comment", id],
    enabled: !!id,
    queryFn: () => obtenerComentario(id!),
    staleTime: 0,
  });
}

export function useCreateComment(postId: number) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: { comment: string; media?: File }) =>
      crearComentario(postId, data),
    onMutate: async () => applyCommentsDelta(queryClient, postId, +1),
    onError: () => applyCommentsDelta(queryClient, postId, -1), //rollback
    onSuccess: () => {
      //refresca solo las listas del post
      queryClient.invalidateQueries({
        predicate: (query) =>
          Array.isArray(query.queryKey) &&
          query.queryKey[0] === "comments" &&
          query.queryKey[1] === postId,
      });
    },
  });
}

export function useUpdateComment(postId: number) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (vars: { id: number } & UpdateCommentPayload) =>
      actualizarComentario(vars.id, vars),
    onSuccess: (_updated, vars) => {
      queryClient.invalidateQueries({ queryKey: ["comment", vars.id] }); //refresca el comentario puntual
      if (postId) {
        // refresca solo las listas del post afectado
        queryClient.invalidateQueries({
          predicate: (q) =>
            Array.isArray(q.queryKey) &&
            q.queryKey[0] === "comments" &&
            q.queryKey[1] === postId,
        });
      } else {
        queryClient.invalidateQueries({ queryKey: ["comments"] }); //fallback
      }
    },
  });
}

export function useDeleteComment(postId: number) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => eliminarComentario(id),
    onMutate: async () => {
      applyCommentsDelta(queryClient, postId, -1);
    },
    onError: () => {
      applyCommentsDelta(queryClient, postId, +1);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        predicate: (q) =>
          Array.isArray(q.queryKey) &&
          q.queryKey[0] === "comments" &&
          q.queryKey[1] === postId,
      });
    },
  });
}

function applyCommentsDelta(
  queryClient: ReturnType<typeof useQueryClient>,
  postId: number,
  delta: number,
) {
  queryClient.setQueryData(["post", postId], (old: any) =>
    old
      ? { ...old, commentsCount: Math.max(0, (old.commentsCount ?? 0) + delta) }
      : old,
  );
  // Recorre cada página acumulada del infinite query
  queryClient.setQueriesData<any>(
    { queryKey: ["posts", "feed"] },
    (old: any) => {
      if (!old?.pages) return old;
      return {
        ...old,
        pages: old.pages.map((page: any) => ({
          ...page,
          content: page.content?.map((p: any) =>
            p.id === postId
              ? {
                  ...p,
                  commentsCount: Math.max(0, (p.commentsCount ?? 0) + delta),
                }
              : p,
          ),
        })),
      };
    },
  );
}

// Hook para manejar las reacciones de un post
export function usePostReactions(postId?: number | null) {
  const queryClient = useQueryClient();
  const id = typeof postId === "number" && postId > 0 ? postId : undefined;

  return useQuery<ReactionSummary>({
    queryKey: ["postReactions", id],
    enabled: !!id,
    queryFn: () => cargarReacciones(id!),

    initialData: () => {
      //hidrata
      if (!id) return undefined;
      const detail = queryClient.getQueryData<any>(["post", id]); //detalle del post
      if (detail?.reactions) return detail.reactions as ReactionSummary;
      const feeds = queryClient.getQueriesData<any>({
        queryKey: ["posts", "feed"],
      });
      for (const [, data] of feeds) {
        for (const page of data?.pages ?? []) {
          const found = page?.content?.find((p: any) => p.id === id);
          if (found?.reactions) return found.reactions as ReactionSummary;
        }
      }
      return undefined;
    },
    staleTime: 15_000,
    gcTime: 5 * 60_000,
  });
}

export function useReactToPost() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (vars: {
      postId: number;
      type: "like" | "love" | "care" | "haha" | "wow" | "sad" | "angry" | null;
    }) => reaccionarAPost(vars.postId, vars.type),
    //mutación optimista
    onMutate: async (vars) => {
      const key = ["postReactions", vars.postId] as const;
      await qc.cancelQueries({ queryKey: key });

      const previous = qc.getQueryData<ReactionSummary>(key);
      const prev = previous ?? {
        postId: vars.postId,
        total: 0,
        counts: {} as any,
        myReaction: null,
      };

      const toEnum = (k: string) => k.toUpperCase() as ReactionEnum;
      const newType = vars.type ? toEnum(vars.type) : null;
      const next: ReactionSummary = {
        postId: prev.postId,
        total: prev.total,
        counts: { ...prev.counts },
        myReaction: prev.myReaction,
      };

      // caso "-"
      if (prev.myReaction) {
        const old = prev.myReaction;
        next.counts[old] = Math.max(0, (next.counts[old] ?? 0) - 1);
        next.total = Math.max(0, next.total - 1);
        next.myReaction = null;
      }

      // caso "+"
      if (newType) {
        next.counts[newType] = (next.counts[newType] ?? 0) + 1;
        next.total += 1;
        next.myReaction = newType;
      }

      qc.setQueryData(key, next); //escribe optimista

      qc.setQueriesData<any>({ queryKey: ["posts", "feed"] }, (old: any) => {
        //feed
        if (!old?.pages) return old;
        return {
          ...old,
          pages: old.pages.map((page: any) => ({
            ...page,
            content: page.content?.map((p: any) =>
              p.id === vars.postId
                ? { ...p, reactions: next, likesCount: next.total }
                : p,
            ),
          })),
        };
      });

      qc.setQueryData(
        ["post", vars.postId],
        (
          old: any, //post
        ) => (old ? { ...old, reactions: next, likesCount: next.total } : old),
      );

      return { previous, key };
    },
    onError: (_err, _vars, ctx) => {
      //rollback
      if (ctx?.previous) qc.setQueryData(ctx.key!, ctx.previous);
    },
    onSuccess: (summary) => {
      //Cambia por la respuesta normalizada del backend
      const key = ["postReactions", summary.postId] as const;
      qc.setQueryData(key, summary);
      qc.setQueriesData<any>({ queryKey: ["posts", "feed"] }, (old: any) => {
        if (!old?.pages) return old;
        return {
          ...old,
          pages: old.pages.map((page: any) => ({
            ...page,
            content: page.content?.map((p: any) =>
              p.id === summary.postId
                ? { ...p, reactions: summary, likesCount: summary.total }
                : p,
            ),
          })),
        };
      });
      qc.setQueryData(["post", summary.postId], (old: any) =>
        old ? { ...old, reactions: summary, likesCount: summary.total } : old,
      );
    },
    onSettled: (_d, _e, vars) => {
      qc.invalidateQueries({ queryKey: ["postReactions", vars.postId] });
    },
  });
}
