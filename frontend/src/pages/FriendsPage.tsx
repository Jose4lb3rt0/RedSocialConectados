import { useAuth } from "@/auth/AuthContext"
import { useState, useMemo } from "react"
import { FaBirthdayCake, FaUser, FaUserClock, FaUserFriends, FaUsers } from "react-icons/fa"
import { FaGear } from "react-icons/fa6"
import { UserCard } from "@/components/friends/UserCard"
import { useFriendshipActions } from "@/hooks/useFriendshipActions"

const FriendsPage: React.FC = () => {
    const [tab, setTab] = useState<"inicio" | "solicitudes" | "todos" | "cumpleaños">("inicio")
    const { user } = useAuth()

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
        isRemoving,
        amigos,
        inbox,
        outbox,
        sugerencias
    } = useFriendshipActions(tab)

    // Calcular lista a renderizar según tab
    const listaRender = useMemo(() => {
        if (tab === "todos") return amigos.data?.content ?? []
        if (tab === "inicio") return (sugerencias.data?.content ?? []).filter(u => u.id !== user?.id).slice(0, 8)
        return []
    }, [tab, amigos.data, user?.id])

    return (
        <div className="grid grid-cols-[260px_1fr] h-[calc(100vh-64px)]">
            <aside className="sticky top-16 h-[calc(100vh-64px)] border-r p-4 overflow-y-auto">
                <div className="flex items-center justify-between">
                    <h2 className="font-bold text-lg">Amigos</h2>
                    <button className="p-2 hover:bg-blue-400 rounded-full bg-blue-500 text-white cursor-pointer">
                        <FaGear />
                    </button>
                </div>
                <ul className="mt-4 space-y-2 text-gray-700">
                    <li
                        className={`px-3 py-2 hover:bg-gray-200 rounded-md flex items-center gap-2 cursor-pointer ${tab === "inicio" ? "bg-gray-200" : ""}`}
                        onClick={() => setTab("inicio")}
                    >
                        <FaUserFriends />Inicio
                    </li>
                    <li
                        className={`px-3 py-2 hover:bg-gray-200 rounded-md flex items-center gap-2 cursor-pointer ${tab === "solicitudes" ? "bg-gray-200" : ""}`}
                        onClick={() => setTab("solicitudes")}
                    >
                        <FaUserClock />Solicitudes de amistad
                    </li>
                    <li
                        className={`px-3 py-2 hover:bg-gray-200 rounded-md flex items-center gap-2 cursor-pointer ${tab === "todos" ? "bg-gray-200" : ""}`}
                        onClick={() => setTab("todos")}
                    >
                        <FaUsers />Todos los amigos
                    </li>
                    <li
                        className={`px-3 py-2 hover:bg-gray-200 rounded-md flex items-center gap-2 cursor-pointer ${tab === "cumpleaños" ? "bg-gray-200" : ""}`}
                        onClick={() => setTab("cumpleaños")}
                    >
                        <FaBirthdayCake />Cumpleaños
                    </li>
                </ul>
            </aside>

            <main className="h-full overflow-y-auto">
                <div className="flex flex-col p-4 space-y-5">
                    <div className="flex items-center justify-between w-full">
                        <h1 className="font-bold">
                            {tab === "todos" && "Todos tus amigos"}
                            {tab === "inicio" && "Personas que quizá conozcas"}
                            {tab === "solicitudes" && "Solicitudes de amistad"}
                            {tab === "cumpleaños" && "Cumpleaños"}
                        </h1>
                    </div>

                    {/* Solicitudes de amistad */}
                    {tab === "solicitudes" && (
                        <div className="grid gap-8 w-full">
                            {/* Recibidas */}
                            <section>
                                <h2 className="font-semibold mb-3">Recibidas</h2>
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                                    {(inbox.data?.content ?? []).map(r => {
                                        const u = r.fromUser
                                        return (
                                            <UserCard
                                                key={r.id}
                                                user={u}
                                                status="incoming"
                                                incomingRequestId={r.id}
                                                isAccepting={isAccepting}
                                                isRejecting={isRejecting}
                                                onAccept={(rid) => handleAccept(rid)}
                                                onReject={(rid) => handleReject(rid)}
                                            />
                                        )
                                    })}
                                    {(!inbox.isLoading && (inbox.data?.content?.length ?? 0) === 0) && (
                                        <p className="text-sm text-gray-500 col-span-full">No tienes solicitudes recibidas.</p>
                                    )}
                                </div>
                            </section>

                            {/* Enviadas */}
                            <section>
                                <h2 className="font-semibold mb-3">Enviadas</h2>
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                                    {(outbox.data?.content ?? []).map(r => {
                                        const u = r.toUser
                                        return (
                                            <UserCard
                                                key={r.id}
                                                user={u}
                                                status="outgoing"
                                                outgoingRequestId={r.id}
                                                isCancelling={isCancelling}
                                                onCancel={(rid) => handleCancel(rid)}
                                            />
                                        )
                                    })}
                                    {(!outbox.isLoading && (outbox.data?.content?.length ?? 0) === 0) && (
                                        <p className="text-sm text-gray-500 col-span-full">No has enviado solicitudes.</p>
                                    )}
                                </div>
                            </section>
                        </div>
                    )}

                    {/* Inicio y Todos */}
                    {(tab === "inicio" || tab === "todos") && (
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 w-full">
                            {listaRender.map(u => {
                                const { status, outgoingRequestId, incomingRequestId } = getStatus(u.id)

                                return (
                                    <UserCard
                                        key={u.id}
                                        user={u}
                                        status={status}
                                        outgoingRequestId={outgoingRequestId}
                                        incomingRequestId={incomingRequestId}
                                        isSending={isSending}
                                        isCancelling={isCancelling}
                                        isAccepting={isAccepting}
                                        isRejecting={isRejecting}
                                        isRemoving={isRemoving}
                                        onAdd={(id, st) => handleAdd(id)}
                                        onCancel={(rid) => handleCancel(rid)}
                                        onAccept={(rid) => handleAccept(rid)}
                                        onReject={(rid) => handleReject(rid)}
                                        onRemove={(id) => handleRemove(id)}
                                    />
                                )
                            })}
                        </div>
                    )}
                </div>
            </main>
        </div>
    )
}

export default FriendsPage