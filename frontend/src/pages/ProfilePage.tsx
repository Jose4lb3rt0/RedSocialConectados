import { FaCamera, FaPencilAlt, FaPlus, FaUser } from "react-icons/fa"
import { useEffect, useState } from "react"
import { useForm } from "react-hook-form"
import { editProfileSchema, type EditProfileFormData } from "@/schemas/userSchemas"
import { useQueryClient } from "@tanstack/react-query"
import { zodResolver } from "@hookform/resolvers/zod"
import EditProfileDialog from "@/components/dialogs/EditProfileDialog"
import ChangeMyPictureDialog from "@/components/dialogs/ChangeMyPictureDialog"
import { apiFetch } from "@/api/apibase"
import { FaMountainSun } from "react-icons/fa6"
import { useAuth } from "@/auth/AuthContext"
import { useUsers } from "@/hooks/useUsers"
import { useParams } from "react-router-dom"
import { useFriendshipActions } from "@/hooks/useFriendshipActions"

const ProfilePage: React.FC = () => {
    const yo = useAuth()
    const slug = useParams<{ slug: string }>()
    const { perfil } = useUsers()
    const { refreshMe, isAuthenticated } = useAuth()
    const [isEditProfileDialogOpen, setIsEditProfileDialogOpen] = useState(false)
    const [changeMyPhotoMode, setChangeMyPhotoMode] = useState<"profile" | "banner">("profile")
    const [isChangeMyPictureDialogOpen, setIsChangeMyPictureDialogOpen] = useState(false)
    const queryClient = useQueryClient()

    // Query principal para la página (no para el modal)
    const { data: userProfile, isLoading, error } = perfil(slug?.slug || "")
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
        <div className="w-full max-w-6xl mx-auto">
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

            <div className="p-4 flex items-center justify-between ms-[13.5%]">
                <div className="flex flex-col gap-1">
                    <h1 className="text-2xl font-bold">
                        {userProfile?.name} {userProfile?.surname}
                    </h1>
                    <p className="text-gray-600 font-semibold">XX amigos</p>
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
        </div>
    )
}

export default ProfilePage