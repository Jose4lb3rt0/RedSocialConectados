import { FaCamera, FaComment, FaPencilAlt, FaPlus, FaUser } from "react-icons/fa"
import { useEffect, useState } from "react"
import { useForm } from "react-hook-form"
import { editProfileSchema, type EditProfileFormData } from "@/schemas/userSchemas"
import { useQueryClient } from "@tanstack/react-query"
import { zodResolver } from "@hookform/resolvers/zod"
import EditProfileDialog from "@/components/dialogs/EditProfileDialog"
import ChangeMyPictureDialog from "@/components/dialogs/ChangeMyPictureDialog"
import { apiFetch } from "@/api/apibase"
import { FaCakeCandles, FaMountainSun } from "react-icons/fa6"
import { useAuth } from "@/auth/AuthContext"
import { useFriendsCount, useProfileFriends, useUsers } from "@/hooks/useUsers"
import { Link, useParams } from "react-router-dom"
import { useFriendshipActions } from "@/hooks/useFriendshipActions"
import PostList from "@/components/posts/PostList"
import PostComposer from "@/components/posts/PostComposer"
import { useChat } from "@/context/ChatContext"
import { useObtenerOCrearConversacion } from "@/hooks/useChats"
import { sl } from "zod/v4/locales"
import { User } from "lucide-react"

const ProfilePage: React.FC = () => {
    const yo = useAuth()
    const slug = useParams<{ slug: string }>()
    const { perfil } = useUsers()
    const { refreshMe, isAuthenticated } = useAuth()
    const [isEditProfileDialogOpen, setIsEditProfileDialogOpen] = useState(false)
    const [changeMyPhotoMode, setChangeMyPhotoMode] = useState<"profile" | "banner">("profile")
    const [isChangeMyPictureDialogOpen, setIsChangeMyPictureDialogOpen] = useState(false)
    const queryClient = useQueryClient()
    const { abrirChat } = useChat()
    const obtenerOCrear = useObtenerOCrearConversacion()

    // Query principal para la página (no para el modal)
    const { data: userProfile, isLoading, error } = perfil(slug?.slug || "")
    const { data: friendsCount = 0 } = useFriendsCount(slug?.slug)
    const { data: friendsPage } = useProfileFriends(slug?.slug)
    const friends = friendsPage?.content || [] // sacando el array
    const isOwnProfile = yo.user?.id === userProfile?.id

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

    const handleEnviarMensaje = async () => {
        if (!userProfile) return

        const conv = await obtenerOCrear.mutateAsync(userProfile.id)
        abrirChat({
            conversacionId: conv.id,
            otroUsuarioName: conv.otroUsuarioName,
            otroUsuarioPhotoUrl: conv.otroUsuarioPhotoUrl,
        })
    }

    const { reset } = useForm<EditProfileFormData>({
        resolver: zodResolver(editProfileSchema),
        defaultValues: {
            name: "",
            surname: "",
            gender: "prefer not to say",
            // birthday: "",
            biography: ""
        }
    })

    useEffect(() => {
        if (userProfile) {
            reset({
                name: userProfile.name,
                surname: userProfile.surname,
                gender: userProfile.gender,
                // birthday: userProfile.birthday,
                biography: userProfile.biography ?? ""
            })
        }
    }, [userProfile, reset])

    const openEdit = async () => {
        setIsEditProfileDialogOpen(true)
        await queryClient.invalidateQueries({ queryKey: ["profile"] })
    }

    const handleSavePicture = async (file: File) => {
        try {
            const formData = new FormData()
            formData.append("file", file)

            let endpoint = changeMyPhotoMode === "profile"
                ? "/users/me/profile-picture"
                : "/users/me/banner-picture"

            await apiFetch(endpoint, {
                method: "PATCH",
                body: formData,
            })

            await Promise.all([
                queryClient.invalidateQueries({ queryKey: ["users", slug?.slug] }),
                refreshMe()
            ])
        } catch (error: any) {
            console.error("Error al subir la imagen:", error)
        }
    }

    if (isLoading) return <p>Cargando perfil...</p>
    if (error instanceof Error) return <p>Error al cargar perfil: {error.message}</p>

    //definido aqui y no en la iteración como en ResultsPage o FriendsPage, pues aqui ya estamos unicamente a un usuario
    const friendshipStatus = userProfile ? getStatus(userProfile.id) : null

    return (
        <div className="w-full max-w-5xl mx-auto">
            {/* Banner */}
            <div className={`${userProfile?.bannerPicture?.imagenUrl ? '' : 'bg-blue-300'} w-full h-50 relative rounded-b-md`}>
                {/* Imagen de banner */}
                {userProfile?.bannerPicture?.imagenUrl ? (
                    <img
                        src={userProfile.bannerPicture.imagenUrl}
                        alt="Banner"
                        className="w-full h-full object-cover rounded-b-md"
                    />
                ) : (
                    <FaMountainSun className="absolute bottom-0 right-5 w-36 h-auto text-blue-200/80 pointer-events-none z-0" />
                )}
                {/* Sombreado de negro */}
                <div className="bg-gradient-to-b from-transparent to-black/30 w-full h-[20%] absolute bottom-0 z-10 rounded-b-md"></div>

                {isAuthenticated && isOwnProfile && (
                    <button
                        className="absolute bottom-3 right-5 z-11 flex items-center gap-2 bg-gray-500 text-white px-4 py-2 rounded-md hover:bg-gray-600 transition-all duration-300"
                        onClick={() => {
                            setChangeMyPhotoMode("banner")
                            setIsChangeMyPictureDialogOpen(true)
                        }}
                    >
                        <FaCamera />
                        Agregar foto de portada
                    </button>
                )}

                {/* Foto de perfil */}
                <div className="absolute flex items-center justify-center -bottom-20 left-10 z-11">
                    <div className={`relative flex items-center justify-center w-30 h-30 rounded-full overflow-hidden ${userProfile?.profilePicture?.imagenUrl ? 'bg-white' : 'bg-gray-200'}`}>
                        {userProfile?.profilePicture?.imagenUrl ? (
                            <img
                                src={userProfile.profilePicture.imagenUrl}
                                alt="Foto de perfil"
                                className="w-[95%] h-[95%] object-cover bg-blue-300 rounded-full"
                            />
                        ) : (
                            <FaUser className="w-[55%] h-[55%] text-gray-400" />
                        )}
                    </div>
                    {/* Botón de cambiar foto de perfil */}
                    {isAuthenticated && isOwnProfile && (
                        <button
                            className="absolute bottom-2 right-2 bg-gray-500 p-2 rounded-full cursor-pointer hover:bg-gray-600 transition-all duration-300"
                            onClick={() => {
                                setChangeMyPhotoMode("profile")
                                setIsChangeMyPictureDialogOpen(true)
                            }}
                        >
                            <FaCamera className="text-white" />
                        </button>
                    )}
                </div>
            </div>

            {/* Foto de perfil y gestión de usuario/amistad */}
            <div className="p-4 flex items-center justify-between ms-[13.5%]">
                <div className="flex flex-col gap-1">
                    <h1 className="text-2xl font-bold">
                        {userProfile?.name} {userProfile?.surname}
                    </h1>
                    <p className="text-gray-600 font-semibold">
                        {friendsCount} {friendsCount === 1 ? "amigo" : "amigos"}
                    </p>
                </div>
                {isAuthenticated && (
                    <div className="flex items-center gap-4">
                        {isOwnProfile && (
                            <>
                                <button className="flex items-center gap-2 bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 transition-all duration-300">
                                    <FaPlus className="text-white" />
                                    Agregar historia
                                </button>

                                <button
                                    onClick={openEdit}
                                    // onClick={() => setIsEditProfileDialogOpen(true)}
                                    className="flex items-center gap-2 bg-gray-500 text-white px-4 py-2 rounded-md hover:bg-gray-600 transition-all duration-300"
                                >
                                    <FaPencilAlt className="text-white" />
                                    Editar perfil
                                </button>
                            </>
                        )}

                        {!isOwnProfile && friendshipStatus && (
                            <div className="flex gap-2">
                                {/* Enviar mensaje */}
                                <button
                                    onClick={handleEnviarMensaje}
                                    disabled={obtenerOCrear.isPending}
                                    className="flex items-center gap-2 bg-blue-500 hover:bg-blue-600 disabled:bg-gray-400 text-white px-4 py-2 rounded-md transition-colors"
                                >
                                    <FaComment />
                                    {obtenerOCrear.isPending ? "..." : "Enviar mensaje"}
                                </button>

                                {/* Gestiones de amistad */}
                                {friendshipStatus.status === "none" && (
                                    <button
                                        onClick={() => handleAdd(userProfile!.id)}
                                        disabled={isSending}
                                        className="flex items-center gap-2 bg-blue-500 hover:bg-blue-600 disabled:bg-gray-400 text-white px-4 py-2 rounded-md transition-colors"
                                    >
                                        <FaPlus />
                                        {isSending ? "..." : "Agregar amigo"}
                                    </button>
                                )}

                                {friendshipStatus.status === "outgoing" && (
                                    <button
                                        onClick={() => handleCancel(friendshipStatus.outgoingRequestId!)}
                                        disabled={isCancelling}
                                        className="flex items-center gap-2 bg-gray-500 hover:bg-gray-600 disabled:bg-gray-400 text-white px-4 py-2 rounded-md transition-colors"
                                    >
                                        {isCancelling ? "..." : "Cancelar solicitud"}
                                    </button>
                                )}

                                {friendshipStatus.status === "incoming" && (
                                    <div className="flex gap-2">
                                        <button
                                            onClick={() => handleAccept(friendshipStatus.incomingRequestId!)}
                                            disabled={isAccepting}
                                            className="flex items-center gap-2 bg-green-500 hover:bg-green-600 disabled:bg-gray-400 text-white px-4 py-2 rounded-md transition-colors"
                                        >
                                            {isAccepting ? "..." : "Aceptar"}
                                        </button>
                                        <button
                                            onClick={() => handleReject(friendshipStatus.incomingRequestId!)}
                                            disabled={isRejecting}
                                            className="flex items-center gap-2 bg-red-500 hover:bg-red-600 disabled:bg-gray-400 text-white px-4 py-2 rounded-md transition-colors"
                                        >
                                            {isRejecting ? "..." : "Rechazar"}
                                        </button>
                                    </div>
                                )}

                                {friendshipStatus.status === "friend" && (
                                    <button
                                        onClick={() => handleRemove(userProfile!.id)}
                                        disabled={isRemoving}
                                        className="flex items-center gap-2 bg-red-500 hover:bg-red-600 disabled:bg-gray-400 text-white px-4 py-2 rounded-md transition-colors"
                                    >
                                        {isRemoving ? "..." : "Eliminar amigo"}
                                    </button>
                                )}
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* BIO, AMIGOS | POSTS (2 columnas) */}
            <div className="mt-12 border-t flex gap-4 p-4">

                {/* Columna izquierda */}
                <div className="w-90 shrink-0 flex flex-col gap-4">

                    {/* Biografía */}
                    {(userProfile?.biography || isOwnProfile) && (
                        <div className="bg-white rounded-lg border border-gray-200 p-4">
                            <h2 className="font-bold text-lg mb-3">Información</h2>
                            <div className="flex flex-col gap-2">
                                {userProfile?.biography ? (
                                    <span className="flex items-center gap-2">
                                        <FaUser className="text-gray-500" style={{ fontSize: 16 }} />
                                        <p className="text-gray-700 text-sm ">{userProfile.biography}</p>
                                    </span>
                                ) : (
                                    isOwnProfile && (
                                        <button
                                            onClick={openEdit}
                                            className="w-full text-sm text-blue-600 hover:bg-blue-50 py-2 rounded-md transition-colors mb-1 cursor-pointer"
                                        >
                                            + Agregar biografía
                                        </button>
                                    )
                                )}
                                {userProfile?.dayOfBirth && userProfile?.monthOfBirth && (
                                    <span className="flex items-center gap-2">
                                        <FaCakeCandles className="text-gray-500" style={{ fontSize: 16 }} />
                                        <p className="text-gray-700 text-sm">
                                            {userProfile.dayOfBirth} de {userProfile.monthOfBirth} de {userProfile.yearOfBirth}
                                        </p>
                                    </span>
                                )}
                            </div>
                        </div>
                    )}

                    {/* Lista de amigos */}
                    <div className="bg-white rounded-lg border border-gray-200 p-4">
                        <div className="flex items-center justify-between mb-3">
                            <h2 className="font-bold text-lg">Amigos</h2>
                            <span className="text-gray-500 text-sm">{friendsCount} {friendsCount === 1 ? "amigo" : "amigos"}</span>
                        </div>
                        {friends.length === 0 ? (
                            <p className="text-sm text-gray-400">No hay amigos para mostrar.</p>
                        ) : (
                            <div className="grid grid-cols-3 gap-2">
                                {friends.slice(0, 9).map(f => (
                                    <Link
                                        key={f.id}
                                        to={`/u/${f.authorSlug}`}
                                        className="flex flex-col items-center gap-1 group"
                                    >
                                        {f.authorPhoto ? (
                                            <img
                                                src={f.authorPhoto}
                                                alt={f.authorName}
                                                className="w-full aspect-square object-cover rounded-lg group-hover:opacity-90 transition-opacity"
                                            />
                                        ) : (
                                            <div className="w-full aspect-square rounded-lg bg-gray-200 flex items-center justify-center">
                                                <FaUser className="text-gray-400 text-xl" />
                                            </div>
                                        )}
                                        <span className="text-xs text-gray-700 text-start font-semibold truncate w-full leading-tight">
                                            {f.authorName} {f.authorSurname}
                                        </span>
                                    </Link>
                                ))}
                            </div>
                        )}
                    </div>

                </div>

                {/* Columna derecha */}
                <div className="flex-1 min-w-0 flex flex-col gap-4">
                    {isAuthenticated && isOwnProfile && (
                        <PostComposer />
                    )}

                    <div className="w-full bg-white rounded-lg border border-gray-200 p-4">
                        <h2 className="text-xl font-bold">Publicaciones</h2>
                        {userProfile?.id && <PostList userId={userProfile?.id} />}
                    </div>
                </div>
            </div>

            <EditProfileDialog
                isOpen={isEditProfileDialogOpen}
                setIsOpen={setIsEditProfileDialogOpen}
            />

            <ChangeMyPictureDialog
                mode={changeMyPhotoMode}
                isOpen={isChangeMyPictureDialogOpen}
                setIsOpen={setIsChangeMyPictureDialogOpen}
                onSave={(file) => {
                    handleSavePicture(file)
                }}
            />
        </div >
    )
}

export default ProfilePage