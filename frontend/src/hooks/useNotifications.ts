import {
  useInfiniteQuery,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import {
  contarNotificacionesNoLeidas,
  marcarNotificacionComoLeida,
  marcarTodasNotificacionesComoLeidas,
  obtenerNotificaciones,
  type NotificationDto,
} from "@/services/NotificationService";
import type { Page } from "@/services/UserService";

export function useNotifications(size = 10, isDropdownOpen = false) {
  return useInfiniteQuery<Page<NotificationDto>>({
    queryKey: ["notifications"],
    queryFn: ({ pageParam = 0 }) => obtenerNotificaciones(pageParam as number, size),
    initialPageParam: 0,
    getNextPageParam: (lastPage) =>
      lastPage.number + 1 < lastPage.totalPages
        ? lastPage.number + 1
        : undefined,
    staleTime: 30_000,
    refetchInterval: isDropdownOpen ? 15_000 : false,
  });
}

export function useUnreadNotificationsCount() {
  return useQuery<number>({
    queryKey: ["notifications", "unread-count"],
    queryFn: () => contarNotificacionesNoLeidas(),
    staleTime: 10_000,
  });
}

export function useMarkNotificationAsRead() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => marcarNotificacionComoLeida(id),
    onSuccess: (_v, id) => {
      qc.setQueryData<any>(["notifications"], (old: any) => {
        if (!old?.pages) return old;
        return {
          ...old,
          pages: old.pages.map((page: any) => ({
            ...page,
            content: page.content.map((n: NotificationDto) =>
              n.id === id ? { ...n, leida: true } : n,
            ),
          })),
        };
      });
      qc.invalidateQueries({ queryKey: ["notifications", "unread-count"] });
    },
  });
}

export function useMarkAllNotificationsAsRead() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: () => marcarTodasNotificacionesComoLeidas(),
    onSuccess: () => {
      qc.setQueryData<any>(["notifications"], (old: any) => {
        if (!old?.pages) return old;
        return {
          ...old,
          pages: old.pages.map((page: any) => ({
            ...page,
            content: page.content.map((n: NotificationDto) => ({
              ...n,
              leida: true,
            })),
          })),
        };
      });
      qc.invalidateQueries({ queryKey: ["notifications", "unread-count"] });
    },
  });
}
