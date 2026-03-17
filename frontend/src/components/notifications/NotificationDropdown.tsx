import { Link } from "react-router-dom"
import {
    useMarkAllNotificationsAsRead,
    useMarkNotificationAsRead,
    useNotifications
} from "@/hooks/useNotifications"
import type { NotificationDto } from "@/services/NotificationService"
import { use, useEffect } from "react"
import { useQueryClient } from "@tanstack/react-query"

type Props = {
    open: boolean
    onClose?: () => void
}

const NotificationDropdown: React.FC<Props> = ({ open, onClose }) => {
    const qc = useQueryClient()
    const { data, isLoading, isError } = useNotifications(0, 10)
    const markOne = useMarkNotificationAsRead()
    const markAll = useMarkAllNotificationsAsRead()

    // Refrescar notificaciones al abrir el dropdown, 
    // ignora el stale_time para mostrar siempre las más recientes, 
    // de igual forma el stale_time sigue aplicando para evitar 
    // recargas constantes mientras el dropdown está abierto.    
    useEffect(() => {
        if (open) qc.invalidateQueries({ queryKey: ["notifications", 0] })
    }, [open, qc])

    if (!open) return null

    const handleMarkAll = () => {
        if (data?.content?.length) {
            markAll.mutate()
        }
    }

    const renderItem = (n: NotificationDto) => {
        const baseClasses =
            "flex flex-col gap-1 px-3 py-2 text-sm hover:bg-blue-50 cursor-pointer"
        const unreadClasses = n.leida ? "bg-white" : "bg-blue-50"

        const content = (
            <div className={`${baseClasses} ${unreadClasses}`}>
                <p className="font-medium text-gray-800 line-clamp-2">{n.mensaje}</p>
                <p className="text-xs text-gray-500">
                    {new Date(n.creadaEn).toLocaleString()}
                </p>
            </div>
        )

        const handleClick = () => {
            if (!n.leida) {
                markOne.mutate(n.id)
            }
            onClose?.()
        }

        // Si hay referencia a un post o usuario, enlazamos; si no, solo div clickeable
        if (n.referenciaTipo === "POST" && n.referenciaId) {
            return (
                <Link
                    key={n.id}
                    to={`/posts/${n.referenciaId}`}
                    onClick={handleClick}
                >
                    {content}
                </Link>
            )
        }

        if (n.referenciaTipo === "USER" && n.referenciaId) {
            // Aquí asumimos que más adelante podrías mapear id → slug;
            // por ahora solo hacemos cierre del dropdown.
            return (
                <div key={n.id} onClick={handleClick}>
                    {content}
                </div>
            )
        }

        return (
            <div key={n.id} onClick={handleClick}>
                {content}
            </div>
        )
    }

    return (
        <div className="absolute right-0 top-10 w-80 bg-white border border-gray-200 rounded-lg shadow-lg z-30">
            <div className="flex items-center justify-between px-3 py-2 border-b border-gray-200">
                <span className="font-semibold text-sm text-gray-800">
                    Notificaciones
                </span>
                <button
                    type="button"
                    onClick={handleMarkAll}
                    disabled={markAll.isPending || !data?.content?.length}
                    className="text-xs text-blue-600 hover:text-blue-700 disabled:text-gray-400 cursor-pointer"
                >
                    Marcar todas como leídas
                </button>
            </div>

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
                {!isLoading && !isError && (data?.content?.length ?? 0) === 0 && (
                    <p className="px-3 py-2 text-sm text-gray-500">
                        No tienes notificaciones.
                    </p>
                )}
                {!isLoading &&
                    !isError &&
                    (data?.content ?? []).map((n) => renderItem(n))}
            </div>
        </div>
    )
}

export default NotificationDropdown

