import { Link } from "react-router-dom"
import { useAuth } from "../../auth/AuthContext"
import { FaChevronDown, FaChevronUp, FaCog, FaSearch, FaUser } from "react-icons/fa"
import { useState } from "react"
import { IoLogOutSharp } from "react-icons/io5"

const Navbar: React.FC = () => {
    const { user, logout } = useAuth()
    const [isUserMenuOpen, setIsUserMenuOpen] = useState(false)

    return (
        <nav className="w-full border-b-blue-200 bg-blue-50 border-b-1">
            <ul className="flex justify-between py-2 px-4">
                {/* Bloquesito 1: Logo y buscador */}
                <li>
                    <div className="flex items-center gap-4">
                        <Link to="/">
                            <img
                                src="logo-icono-nombre.png"
                                className="h-8 w-auto"
                            />
                        </Link>
                        <div className="relative">
                            <input
                                className="bg-blue-100 rounded-full px-4 py-2 text-sm w-52 transition-all focus:outline-0"
                                placeholder="Buscar en Conectados"
                                maxLength={60}
                            />
                            <button className="absolute right-0 top-0 bottom-0 px-3 text-gray-500 hover:text-blue-400 cursor-pointer transition-all duration-200 rounded-e-full focus:outline-0 focus:text-blue-400 bg-blue-100">
                                <FaSearch />
                            </button>
                        </div>
                    </div>
                </li>
                {/* Bloquesito 2: Menú de usuario */}
                <li>
                    <div className="relative cursor-pointer" onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}>
                        <button className={`${user?.profilePicture?.imagenUrl ? "p-0" : "p-2"} flex items-center rounded-full border border-gray-300`}>
                            {user?.profilePicture?.imagenUrl ? (
                                <img
                                    src={user.profilePicture.imagenUrl}
                                    alt="User Avatar"
                                    className="h-8 w-8 rounded-full border-blue-200 border"
                                />
                            ) : (
                                <FaUser className="text-gray-500" />
                            )}
                        </button>
                        <div className="bg-gray-500 border-blue-50 border-1 flex items-center justify-center text-white rounded-full p-1 absolute -bottom-1 -right-1">
                            {isUserMenuOpen ? (
                                <FaChevronDown className="text-white h-2 w-auto" />
                            ) : (
                                <FaChevronUp className="text-white h-2 w-auto" />
                            )}
                        </div>
                        <div className={`absolute right-1 top-10 z-20 w-52 ${isUserMenuOpen ? "block" : "hidden"} bg-blue-100 rounded-lg shadow-lg`}>
                            <ul className="py-1">
                                <li>
                                    <div className="w-full flex items-center gap-2 px-4 py-2">
                                        {user?.profilePicture?.imagenUrl ? (
                                            <img
                                                src={user.profilePicture.imagenUrl}
                                                alt="User Avatar"
                                                className="h-10 w-10 rounded-full border-blue-200 border-2"
                                            />
                                        ) : (
                                            <div className="h-10 w-10 rounded-full border-gray-300 border-2 flex items-center justify-center bg-gray-200">
                                                <FaUser className="text-gray-500" />
                                            </div>
                                        )}
                                        <span className="text-sm truncate">
                                            {user?.name} {user?.surname}
                                        </span>
                                    </div>
                                </li>
                                <hr className="border-gray-300 mx-2 py-1" />
                                <li>
                                    <Link
                                        to="/profile"
                                        className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-blue-200"
                                    >
                                        <FaUser className="text-gray-600" />
                                        <span>Perfil</span>
                                    </Link>
                                </li>
                                <li>
                                    <Link
                                        to="/settings"
                                        className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-blue-200"
                                    >
                                        <FaCog className="text-gray-600" />
                                        <span>Configuración</span>
                                    </Link>
                                </li>
                                <li>
                                    <button
                                        onClick={logout}
                                        className="flex w-full items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-blue-200 text-left"
                                    >
                                        <IoLogOutSharp className="text-gray-600" />
                                        <span>Cerrar sesión</span>
                                    </button>
                                </li>
                            </ul>
                        </div>
                    </div>

                </li>
            </ul>
        </nav>
    )
}

export default Navbar