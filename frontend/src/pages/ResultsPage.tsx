import { useState } from "react"
import { FaUser, FaUserFriends } from "react-icons/fa"
import { Link, useSearchParams } from "react-router-dom"
import { useSearchUsuarios } from "@/hooks/useSearch"
import { useFriendshipActions } from "@/hooks/useFriendshipActions"

const ResultsPage: React.FC = () => {
    const [tab, setTab] = useState<"todo">("todo")
    const [searchParams] = useSearchParams()
    const query = searchParams.get("query") || ""
    const { data: searchResults, isLoading } = useSearchUsuarios(query, 0, 20)

    const {
        getStatus,
        handleAdd,
        handleCancel,
        handleAccept,
        handleReject,
        handleRemove,
        isSending,
        isCancelling,
        isAccepting,
        isRejecting,
        isRemoving
    } = useFriendshipActions("inicio")

    return (
        <div className="grid grid-cols-[260px_1fr] h-[calc(100vh-64px)]">
            <aside className="sticky top-16 h-[calc(100vh-64px)] border-r p-4 overflow-y-auto">
                <div className="flex items-center justify-between">
                    <h2 className="font-bold text-lg">Resultados de la busqueda</h2>
                </div>
                <ul className="mt-4 space-y-2 text-gray-700">
                    <li
                        className={`px-3 py-2 hover:bg-gray-200 rounded-md flex items-center gap-2 cursor-pointer ${tab === "todo" ? "bg-gray-200" : ""}`}
                        onClick={() => setTab("todo")}
                    >
                        <FaUserFriends />Todo ({searchResults?.totalElements || 0})
                    </li>
                </ul>
            </aside>

            <main className="h-full overflow-y-auto">
                <div className="flex flex-col p-4 space-y-5">
                    {(tab === "todo") && (

                        <div className="flex flex-col items-center gap-2">
                            {isLoading && <p className="text-center text-gray-600">Buscando resultados...</p>}

                            {!isLoading && (searchResults?.content.length ?? 0) === 0 && (
                                <p className="text-center text-gray-600">No se encontraron resultados para "{query}"</p>
                            )}

                            {!isLoading && (searchResults?.content ?? []).length > 0 && (
                                <div className="flex flex-col gap-2 w-full max-w-3xl mx-auto p-4">
                                    {(searchResults?.content ?? []).map((usuario) => {
                                        const { status, outgoingRequestId, incomingRequestId } = getStatus(usuario.id)

                                        return (

                                            <div className="flex items-center justify-between p-3 bg-white rounded-md shadow hover:shadow-md transition-shadow border border-gray-200">
                                                {/* nombre */}
                                                <Link to={`/u/${usuario.authorSlug}`} key={usuario.id}>
                                                    <div className="flex items-center gap-3 flex-1">
                                                        {usuario.authorPhoto ? (
                                                            <img
                                                                src={usuario.authorPhoto || undefined}
                                                                alt={usuario.authorName}
                                                                className="w-10 h-10 rounded-full object-cover"
                                                            />
                                                        ) : (
                                                            <div className="w-10 h-10 rounded-full border items-center flex justify-center">
                                                                <FaUser className="w-5 h-5 text-gray-400" />
                                                            </div>
                                                        )}
                                                        <div className="flex flex-col">
                                                            <span className="font-semibold text-sm">
                                                                {usuario.authorName} {usuario.authorSurname}
                                                            </span>
                                                            <span className="text-xs text-gray-500">@{usuario.authorSlug}</span>
                                                        </div>
                                                    </div>
                                                </Link>

                                                {/* gestionar amistad */}
                                                <div className="flex gap-2">
                                                    {status === "none" && (
                                                        <button
                                                            onClick={() => handleAdd(usuario.id)}
                                                            disabled={isSending}
                                                            className="bg-blue-500 hover:bg-blue-600 disabled:bg-gray-400 text-white px-3 py-1 rounded-md text-sm transition-colors"
                                                        >
                                                            {isSending ? "..." : "Agregar"}
                                                        </button>
                                                    )}

                                                    {status === "outgoing" && (
                                                        <button
                                                            onClick={() => handleCancel(outgoingRequestId!)}
                                                            disabled={isCancelling}
                                                            className="bg-gray-400 hover:bg-gray-500 disabled:bg-gray-300 text-white px-3 py-1 rounded-md text-sm transition-colors"
                                                        >
                                                            {isCancelling ? "..." : "Cancelar"}
                                                        </button>
                                                    )}

                                                    {status === "incoming" && (
                                                        <div className="flex gap-2">
                                                            <button
                                                                onClick={() => handleAccept(incomingRequestId!)}
                                                                disabled={isAccepting}
                                                                className="bg-green-500 hover:bg-green-600 disabled:bg-gray-400 text-white px-3 py-1 rounded-md text-sm transition-colors"
                                                            >
                                                                {isAccepting ? "..." : "Aceptar"}
                                                            </button>
                                                            <button
                                                                onClick={() => handleReject(incomingRequestId!)}
                                                                disabled={isRejecting}
                                                                className="bg-red-500 hover:bg-red-600 disabled:bg-gray-400 text-white px-3 py-1 rounded-md text-sm transition-colors"
                                                            >
                                                                {isRejecting ? "..." : "Rechazar"}
                                                            </button>
                                                        </div>
                                                    )}

                                                    {status === "friend" && (
                                                        <button
                                                            onClick={() => handleRemove(usuario.id)}
                                                            disabled={isRemoving}
                                                            className="bg-red-500 hover:bg-red-600 disabled:bg-gray-400 text-white px-3 py-1 rounded-md text-sm transition-colors"
                                                        >
                                                            {isRemoving ? "..." : "Eliminar"}
                                                        </button>
                                                    )}
                                                </div>
                                            </div>
                                        )
                                    })}
                                </div>
                            )
                            }
                        </div>

                    )}
                </div>
            </main>
        </div>
    )
}

export default ResultsPage