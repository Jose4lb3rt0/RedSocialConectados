import React from 'react'
import type { FriendshipManageButtonProps } from '@/types/friendship' // ✅ Importar

const FriendshipManageButton: React.FC<FriendshipManageButtonProps> = ({
    userId,
    status,
    isSending,
    isCancelling,
    isAccepting,
    isRejecting,
    isRemoving,
    onAdd,
    onCancel,
    onAccept,
    onReject,
    onRemove,
    incomingRequestId,
    outgoingRequestId
}) => {
    // Estado: no es amigo
    if (status === "none" && onAdd) {
        return (
            <button
                onClick={() => onAdd(userId, status)}
                disabled={isSending}
                className="cursor-pointer bg-blue-100 hover:bg-blue-200 disabled:opacity-50 text-blue-700 text-xs rounded px-3 py-2 font-semibold w-full"
            >
                {isSending ? "Enviando..." : "Agregar"}
            </button>
        )
    }

    // Estado: solicitud saliente
    if (status === "outgoing" && onCancel && outgoingRequestId != null) {
        return (
            <button
                onClick={() => onCancel(outgoingRequestId)}
                disabled={isCancelling}
                className="cursor-pointer bg-red-100 hover:bg-red-200 disabled:opacity-50 text-red-600 text-xs rounded px-3 py-2 font-semibold w-full"
            >
                {isCancelling ? "Cancelando..." : "Cancelar"}
            </button>
        )
    }

    // Estado: solicitud entrante
    if (status === "incoming") {
        return (
            <div className="flex gap-2">
                {onAccept && incomingRequestId != null && (
                    <button
                        onClick={() => onAccept(incomingRequestId)}
                        disabled={isAccepting}
                        className="cursor-pointer flex-1 bg-green-600 hover:bg-green-700 disabled:opacity-50 text-white text-xs rounded px-2 py-2 font-semibold"
                    >
                        {isAccepting ? "Aceptando..." : "Aceptar"}
                    </button>
                )}
                {onReject && incomingRequestId != null && (
                    <button
                        onClick={() => onReject(incomingRequestId)}
                        disabled={isRejecting}
                        className="cursor-pointer flex-1 bg-gray-200 hover:bg-gray-300 disabled:opacity-50 text-gray-700 text-xs rounded px-2 py-2 font-semibold"
                    >
                        {isRejecting ? "Rechazando..." : "Rechazar"}
                    </button>
                )}
            </div>
        )
    }

    // Estado: ya es amigo
    if (status === "friend" && onRemove) {
        return (
            <button
                onClick={() => onRemove(userId)}
                disabled={isRemoving}
                className="cursor-pointer bg-red-100 hover:bg-red-200 disabled:opacity-50 text-red-600 text-xs rounded px-3 py-2 font-semibold w-full"
            >
                {isRemoving ? "Eliminando..." : "Eliminar"}
            </button>
        )
    }

    return null
}

export default FriendshipManageButton