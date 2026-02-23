import { useAuth } from "../../auth/AuthContext"
import { FaChevronDown, FaChevronUp, FaCog, FaSearch, FaUser } from "react-icons/fa"
import { useState, useEffect } from "react"
import { IoLogOutSharp } from "react-icons/io5"
import { FaHouse, FaUsers } from "react-icons/fa6"
import { useSearchUsuarios } from "@/hooks/useSearch"
import { Link, useSearchParams } from "react-router-dom"

const Navbar: React.FC = () => {
    const { user, logout, isAuthenticated } = useAuth()
    const [isUserMenuOpen, setIsUserMenuOpen] = useState(false)
    const [isSearchBarFocused, setIsSearchBarFocused] = useState(false)
    const [searchQuery, setSearchQuery] = useState("")
    const [searchParams] = useSearchParams()
    const { data: searchResults, isLoading } = useSearchUsuarios(searchQuery)

    useEffect(() => {
        const queryFromUrl = searchParams.get("query")
        if (queryFromUrl) setSearchQuery(queryFromUrl)
    }, [searchParams])

    return (
        <nav className="w-full border-b-blue-200 bg-blue-50 border-b-1 h-14"> {/* altura fija */}
            <ul className="relative grid grid-cols-[auto_1fr_auto] items-center h-full">
                {/* Bloquesito 1 */}
                <li className="justify-self-start h-full py-0 px-4 flex items-center">
                    <div className="flex items-center gap-4 h-full">
                        <Link to="/">
                            <img
                                src="/logo-icono-nombre.png"
                                alt="Conectados"
                                className="h-10 w-auto object-contain"
                            />
                        </Link>
                        <div className="flex flex-col max-w-xs w-full">
                            <div className="relative w-full">
                                <input
                                    className="bg-blue-100 rounded-full px-4 py-2 text-sm w-full transition-all focus:outline-0"
                                    placeholder="Buscar en Conectados"
                                    maxLength={60}
                                    onFocus={() => setIsSearchBarFocused(true)}
                                    // onBlur={() => setIsSearchBarFocused(false)}
                                    // para evitar que al hacer click en los resultados se cierre la barra antes de navegar, se retrasa un poco el blur
                                    onBlur={() => setTimeout(() => setIsSearchBarFocused(false), 200)}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                />
                                <Link
                                    to={`/results?query=${encodeURIComponent(searchQuery)}`}
                                >
                                    <button className="absolute right-0 top-0 bottom-0 px-3 text-gray-500 hover:text-blue-400 cursor-pointer transition-all duration-200 rounded-e-full focus:outline-0 focus:text-blue-400 bg-blue-100">
                                        <FaSearch />
                                    </button>
                                </Link>
                                {isSearchBarFocused && searchQuery.trim().length > 0 && (
                                    <div className="absolute top-full mt-1 w-full bg-white border border-gray-300 rounded-sm shadow-lg z-10 max-h-64 overflow-y-auto">
                                        {isLoading && <p className="p-2 text-gray-500">Buscando...</p>}
                                        {!isLoading && (searchResults?.content ?? []).map(user => (
                                            <Link
                                                key={user.id}
                                                to={`/u/${user.authorSlug}`}
                                                className="flex items-center gap-2 p-2 hover:bg-blue-50"
                                                onClick={() => setSearchQuery("")}
                                            >
                                                {user.authorPhoto ? (
                                                    <img
                                                        src={user.authorPhoto}
                                                        alt={user.authorName}
                                                        className="w-8 h-8 rounded-full"
                                                    />
                                                ) : (
                                                    <div className="w-8 h-8 rounded-full border-gray-300 border-2 flex items-center justify-center bg-gray-200">
                                                        <FaUser className="text-gray-500" />
                                                    </div>
                                                )}
                                                <span className="text-sm">{user.authorName} {user.authorSurname}</span>
                                            </Link>
                                        ))}
                                        {!isLoading && (searchResults?.content?.length ?? 0) === 0 && (
                                            <p className="p-2 text-sm text-gray-500">No se encontraron resultados</p>
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </li>

                {/* Bloquesito 2 centrado y a altura completa */}
                {user && isAuthenticated && (
                    <li
                        className="hidden md:flex items-stretch gap-1 absolute top-0 left-1/2 -translate-x-1/2 h-full z-20"
                    >
                        <Link
                            to="/"
                            className="h-full px-5 flex items-center justify-center text-gray-700 hover:text-blue-600 hover:bg-blue-100 transition-colors rounded-md"
                        >
                            <FaHouse className="text-lg" />
                        </Link>
                        <Link
                            to="/friends"
                            className="h-full px-5 flex items-center justify-center text-gray-700 hover:text-blue-600 hover:bg-blue-100 transition-colors rounded-md"
                        >
                            <FaUsers className="text-lg" />
                        </Link>
                    </li>
                )}

                {/* Bloquesito 3 */}
                {isAuthenticated && user ? (
                    <li className="justify-self-end py-0 px-4 h-full flex items-center">
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
                                        <Link
                                            to={`/u/${user?.slug}`}
                                            className="w-full flex items-center gap-2 px-4 py-2"
                                        >
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
                                        </Link>
                                    </li>
                                    <hr className="border-gray-300 mx-2 py-1" />
                                    <li>
                                        <Link
                                            // to="/profile"
                                            to={`/u/${user?.slug}`}
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
                ) : (
                    <Link
                        to="/login"
                        className="py-2 px-4 justify-self-end bg-blue-600 hover:bg-blue-700 text-white rounded-full text-sm transition-all"
                    >
                        Iniciar sesión
                    </Link>
                )}
            </ul>
        </nav>
    )
}

export default Navbar