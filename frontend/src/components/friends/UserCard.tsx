import { FaUser } from "react-icons/fa"
import React from "react"
import { Link } from "react-router-dom"

export interface UserSummary {
    id: number
    authorName: string
    authorSurname: string
    authorSlug: string
    authorPhoto?: string | null
}

type FriendStatus = "friend" | "incoming" | "outgoing" | "none"

interface Props {
    user: UserSummary
    status: FriendStatus
    isSending?: boolean
    isCancelling?: boolean
    isAccepting?: boolean
    isRejecting?: boolean
    isRemoving?: boolean
    onAdd?: (id: number, status: FriendStatus) => void
    onCancel?: (requestId: number) => void
    onAccept?: (requestId: number) => void
    onReject?: (requestId: number) => void
    onRemove?: (userId: number) => void
    incomingRequestId?: number
    outgoingRequestId?: number
}

export const UserCard: React.FC<Props> = ({
    user,
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
    const fullName = `${user.authorName ?? ""} ${user.authorSurname ?? ""}`.trim()

    return (
        <div className="border rounded-lg flex flex-col w-full bg-white shadow-sm">
            <div className="w-full aspect-square relative overflow-hidden rounded-t-lg bg-gray-100">
                <Link to={`/u/${user.authorSlug}`} className="absolute inset-0 w-full h-full">
                    {user.authorPhoto ? (
                        <img
                            src={user.authorPhoto}
                            alt={fullName}
                            loading="lazy"
                            className="absolute inset-0 w-full h-full object-cover"
                            onError={(e) => {
                                (e.currentTarget as HTMLImageElement).style.display = "none"
                            }}
                        />
                    ) : (
                        <div className="absolute inset-0 flex flex-col items-center justify-center text-gray-400 gap-2">
                            <FaUser className="text-4xl" />
                            {/* <span className="text-xs font-medium tracking-wide select-none">
                            {fullName ? fullName.split(" ").slice(0, 2).join(" ") : "Usuario"}
                            </span> */}
                        </div>
                    )}
                </Link>
            </div>

            <div className="flex flex-col p-3 gap-2 flex-1">
                <Link to={`/u/${user.authorSlug}`} className="hover:underline">
                    <h2 className="font-semibold text-sm line-clamp-2 leading-snug">{fullName}</h2>
                </Link>

                {/* Botonera según estado */}
                {status === "none" && onAdd && (
                    <button
                        onClick={() => onAdd(user.id, status)}
                        disabled={isSending}
                        className="cursor-pointer bg-blue-100 hover:bg-blue-200 disabled:opacity-50 text-blue-700 text-xs rounded px-3 py-2 font-semibold"
                    >
                        {isSending ? "Enviando..." : "Agregar"}
                    </button>
                )}

                {status === "outgoing" && onCancel && outgoingRequestId != null && (
                    <button
                        onClick={() => onCancel(outgoingRequestId)}
                        disabled={isCancelling}
                        className="cursor-pointer bg-red-100 hover:bg-red-200 disabled:opacity-50 text-red-600 text-xs rounded px-3 py-2 font-semibold"
                    >
                        {isCancelling ? "Cancelando..." : "Cancelar"}
                    </button>
                )}

                {status === "incoming" && (
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
                )}

                {status === "friend" && onRemove && (
                    <button
                        onClick={() => onRemove(user.id)}
                        disabled={isRemoving}
                        className="cursor-pointer bg-red-100 hover:bg-red-200 disabled:opacity-50 text-red-600 text-xs rounded px-3 py-2 font-semibold"
                    >
                        {isRemoving ? "Eliminando..." : "Eliminar"}
                    </button>
                )}
            </div>
        </div>
    )
}