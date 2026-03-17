import { Link } from "react-router-dom";
import {
  useMarkAllNotificationsAsRead,
  useMarkNotificationAsRead,
  useNotifications,
} from "@/hooks/useNotifications";
import type { NotificationDto } from "@/services/NotificationService";
import { useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import {
  FaBell,
  FaComment,
  FaHeart,
  FaNewspaper,
  FaUser,
  FaUserCheck,
  FaUserPlus,
} from "react-icons/fa";

type Props = {
  open: boolean;
  onClose?: () => void;
};

const REACTION_EMOJI: Record<string, string> = {
  LIKE: "👍",
  LOVE: "❤️",
  CARE: "🥰",
  HAHA: "😂",
  WOW: "😮",
  SAD: "😢",
  ANGRY: "😡",
};

const NotificationDropdown: React.FC<Props> = ({ open, onClose }) => {
  const qc = useQueryClient();
  const {
    data,
    isLoading,
    isError,
    isFetchingNextPage,
    hasNextPage,
    fetchNextPage,
  } = useNotifications(10, open);
  const markOne = useMarkNotificationAsRead();
  const markAll = useMarkAllNotificationsAsRead();

  // Refrescar notificaciones al abrir el dropdown,
  // ignora el stale_time para mostrar siempre las más recientes,
  // de igual forma el stale_time sigue aplicando para evitar
  // recargas constantes mientras el dropdown está abierto.
  useEffect(() => {
    if (open) qc.invalidateQueries({ queryKey: ["notifications"] });
  }, [open, qc]);

  if (!open) return null;

  const notifications = data?.pages.flatMap((page) => page.content) ?? [];

  const handleMarkAll = () => {
    if (notifications.length) markAll.mutate();
  };

  const tipoIcon = (n: NotificationDto) => {
    if (
      n.tipo === "POST_REACTION" &&
      n.reaccionTipo &&
      REACTION_EMOJI[n.reaccionTipo]
    ) {
      return (
        <span style={{ fontSize: 13, lineHeight: 1 }}>
          {REACTION_EMOJI[n.reaccionTipo]}
        </span>
      );
    }
    switch (n.tipo) {
      case "POST_COMMENT":
        return <FaComment className="text-blue-400" style={{ fontSize: 12 }} />;
      case "FRIEND_REQUEST":
        return (
          <FaUserPlus className="text-teal-500" style={{ fontSize: 12 }} />
        );
      case "FRIEND_ACCEPTED":
        return (
          <FaUserCheck className="text-green-500" style={{ fontSize: 12 }} />
        );
      case "POST":
        return (
          <FaNewspaper className="text-purple-400" style={{ fontSize: 12 }} />
        );
      default:
        return <FaBell className="text-gray-400" style={{ fontSize: 12 }} />;
    }
  };

  const renderItem = (n: NotificationDto) => {
    const unreadBg = n.leida ? "" : "bg-blue-50";

    const content = (
      <div
        className={`flex items-start gap-3 px-3 py-2 hover:bg-blue-50 cursor-pointer ${unreadBg}`}
      >
        {/* Avatar */}
        <div className="relative shrink-0 mt-0.5">
          {n.actorPhotoUrl ? (
            <img
              src={n.actorPhotoUrl}
              alt={n.actorName ?? ""}
              className="w-9 h-9 rounded-full object-cover border border-gray-200"
            />
          ) : (
            <div className="w-9 h-9 rounded-full bg-gray-200 flex items-center justify-center border border-gray-200">
              <FaUser className="text-gray-400" style={{ fontSize: 14 }} />
            </div>
          )}

          {/* Icono de tipo de notificación */}
          <span className="absolute -bottom-1 -right-1 bg-white rounded-full p-0.5 shadow-sm border border-gray-100 flex items-center justify-center">
            {tipoIcon(n)}{" "}{/* El render lee el tipo de notificación y si se trata de una reacción, muestra el emoji correspondiente */}
          </span>
        </div>

        {/* Texto */}
        <div className="flex flex-col gap-0.5 min-w-0">
          <p className="text-sm text-gray-800 line-clamp-2 leading-snug">
            {n.mensaje}
          </p>
          <p className="text-xs text-gray-400">
            {new Date(n.creadaEn).toLocaleString()}
          </p>
        </div>

        {/* Indicador de no leído */}
        {!n.leida && (
          <span className="shrink-0 w-2 h-2 rounded-full bg-blue-500 mt-1.5" />
        )}
      </div>
    );

    const handleClick = () => {
      if (!n.leida) markOne.mutate(n.id);
      onClose?.();
    };

    // Si hay referencia a un post o usuario, enlazamos; si no, solo div clickeable
    if (n.referenciaTipo === "POST" && n.referenciaId) {
      return (
        <Link key={n.id} to={`/posts/${n.referenciaId}`} onClick={handleClick}>
          {content}
        </Link>
      );
    }

    if (n.referenciaTipo === "USER" && n.referenciaId) {
      // Aquí asumimos que más adelante podrías mapear id → slug;
      // por ahora solo hacemos cierre del dropdown.
      return (
        <div key={n.id} onClick={handleClick}>
          {content}
        </div>
      );
    }

    return (
      <div key={n.id} onClick={handleClick}>
        {content}
      </div>
    );
  };

  return (
    <div className="absolute right-0 top-10 w-80 bg-white border border-gray-200 rounded-lg shadow-lg z-30">
      {/* Cabecera */}
      <div className="flex items-center justify-between px-3 py-2 border-b border-gray-200">
        <span className="font-semibold text-sm text-gray-800">
          Notificaciones
        </span>
        <button
          type="button"
          onClick={handleMarkAll}
          disabled={markAll.isPending || !notifications.length}
          className="text-xs text-blue-600 hover:text-blue-700 disabled:text-gray-400 cursor-pointer"
        >
          Marcar todas como leídas
        </button>
      </div>

      {/* Lista con scroll */}
      <div className="max-h-80 overflow-y-auto">
        {isLoading && (
          <p className="px-3 py-2 text-sm text-gray-500">
            Cargando notificaciones...
          </p>
        )}
        {isError && !isLoading && (
          <p className="px-3 py-2 text-sm text-red-500">
            Error al cargar notificaciones.
          </p>
        )}
        {!isLoading && !isError && (notifications.length ?? 0) === 0 && (
          <p className="px-3 py-2 text-sm text-gray-500">
            No tienes notificaciones.
          </p>
        )}
        {!isLoading && !isError && notifications.map((n) => renderItem(n))}
      </div>

      {/* Botón para cargar más notificaciones */}
      {hasNextPage && (
        <div className="border-t border-gray-200 px-3 py-2 ">
          <button
            type="button"
            onClick={() => fetchNextPage()}
            disabled={isFetchingNextPage}
            className="w-full text-xs text-blue-600 hover:text-blue-700 disabled:text-gray-400 cursor-pointer text-center"
          >
            {isFetchingNextPage ? "Cargando..." : "Cargar más"}
          </button>
        </div>
      )}
    </div>
  );
};

export default NotificationDropdown;
