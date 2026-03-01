export type FriendStatus = "friend" | "incoming" | "outgoing" | "none"

export interface UserSummary {
    id: number
    authorName: string
    authorSurname: string
    authorSlug: string
    authorPhoto?: string | null
}

export interface FriendshipManageButtonProps {
    userId: number
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

export interface UserCardProps extends FriendshipManageButtonProps {
    user: UserSummary
}