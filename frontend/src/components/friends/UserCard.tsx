import { FaUser } from "react-icons/fa"
import React from "react"
import { Link } from "react-router-dom"
import FriendshipManageButton from "./FriendshipManageButton"
import type { UserCardProps } from "@/types/friendship"

export const UserCard: React.FC<UserCardProps> = ({
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
                        </div>
                    )}
                </Link>
            </div>

            <div className="flex flex-col p-3 gap-2 flex-1">
                <Link to={`/u/${user.authorSlug}`} className="hover:underline">
                    <h2 className="font-semibold text-sm line-clamp-2 leading-snug">{fullName}</h2>
                </Link>

                <FriendshipManageButton
                    userId={user.id}
                    status={status}
                    isSending={isSending}
                    isCancelling={isCancelling}
                    isAccepting={isAccepting}
                    isRejecting={isRejecting}
                    isRemoving={isRemoving}
                    onAdd={onAdd}
                    onCancel={onCancel}
                    onAccept={onAccept}
                    onReject={onReject}
                    onRemove={onRemove}
                    incomingRequestId={incomingRequestId}
                    outgoingRequestId={outgoingRequestId}
                />
            </div>
        </div>
    )
}