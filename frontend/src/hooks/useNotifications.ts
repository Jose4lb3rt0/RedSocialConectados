import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  contarNotificacionesNoLeidas,
  marcarNotificacionComoLeida,
  marcarTodasNotificacionesComoLeidas,
  obtenerNotificaciones,
  type NotificationDto,
} from "@/services/NotificationService";
import type { Page } from "@/services/UserService";

export function useNotifications(page = 0, size = 10, isDropdownOpen = false) {
  return useQuery<Page<NotificationDto>>({
    queryKey: ["notifications", page],
    queryFn: () => obtenerNotificaciones(page, size),
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
      // Actualizar lista en caché
      qc.setQueriesData<Page<NotificationDto>>(
        { queryKey: ["notifications"] },
        (old) => {
          if (!old?.content) return old;
          return {
            ...old,
            content: old.content.map((n) =>
              n.id === id ? { ...n, leida: true } : n,
            ),
          };
        },
      );
      // Refrescar contador
      qc.invalidateQueries({ queryKey: ["notifications", "unread-count"] });
    },
  });
}

export function useMarkAllNotificationsAsRead() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: () => marcarTodasNotificacionesComoLeidas(),
    onSuccess: () => {
      qc.setQueriesData<Page<NotificationDto>>(
        { queryKey: ["notifications"] },
        (old) => {
          if (!old?.content) return old;
          return {
            ...old,
            content: old.content.map((n) => ({ ...n, leida: true })),
          };
        },
      );
      qc.invalidateQueries({ queryKey: ["notifications", "unread-count"] });
    },
  });
}
