import { useState } from "react"
import { useUnreadNotificationsCount } from "@/hooks/useNotifications"
import { FaBell } from "react-icons/fa"

type Props = {
    onClick?: () => void
}

const NotificationBell: React.FC<Props> = ({ onClick }) => {
    const { data: unread = 0 } = useUnreadNotificationsCount()
    const [isOpen, setIsOpen] = useState(false)

    const handleClick = () => {
        setIsOpen(!isOpen)
        onClick?.()
    }

    return (
        <button
            type="button"
            onClick={handleClick}
            className="p-2 relative flex items-center justify-center w-8 h-8 rounded-full hover:bg-gray-100 cursor-pointer border border-gray-300"
        >
            <FaBell className="text-gray-500" />
            {unread > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full px-1.5 py-0.5">
                    {unread > 9 ? "9+" : unread}
                </span>
            )}
        </button>
    )
}

export default NotificationBell

