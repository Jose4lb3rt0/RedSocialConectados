import { Link } from "react-router-dom"
import { useAuth } from "@/auth/AuthContext"
import { FaUser, FaUserFriends } from "react-icons/fa"

export default function LeftAside() {
    const { user } = useAuth()

    if (!user) return null

    return (
        <aside className="w-72 shrink-0 h-full overflow-y-auto px-2 py-4 flex flex-col gap-1">
            {/* Link al perfil propio */}
            <Link
                to={`/u/${user.slug}`}
                className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-gray-100 transition-colors"
            >
                {user.profilePicture?.imagenUrl ? (
                    <img
                        src={user.profilePicture.imagenUrl}
                        alt={user.name}
                        className="w-9 h-9 rounded-full object-cover shrink-0"
                    />
                ) : (
                    <div className="w-9 h-9 rounded-full bg-gray-200 flex items-center justify-center shrink-0">
                        <FaUser className="text-gray-400" />
                    </div>
                )}
                <span className="font-semibold text-sm text-gray-800">
                    {user.name} {user.surname}
                </span>
            </Link>

            {/* Link a amigos */}
            <Link
                to="/friends"
                className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-gray-100 transition-colors"
            >
                <div className="w-9 h-9 rounded-full bg-blue-100 flex items-center justify-center shrink-0">
                    <FaUserFriends className="text-blue-600" />
                </div>
                <span className="font-semibold text-sm text-gray-800">Amigos</span>
            </Link>
        </aside>
    )
}
