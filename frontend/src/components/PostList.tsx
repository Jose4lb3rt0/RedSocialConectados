import { BsThreeDotsVertical } from "react-icons/bs"
import { useAuth } from "../auth/AuthContext"
import { useDeletePost, useFeed, useUpdatePost } from "../hooks/usePosts"
import { useState } from "react"
import { FaComment, FaEdit, FaShare, FaThumbsUp, FaTrash } from "react-icons/fa"
import CreatePostDialog from "./dialogs/CreatePostDialog"
import { Link } from "react-router-dom"

// Tipo de post según el backend
type PostType = "text" | "profile_photo" | "banner_photo"

export default function PostList() {
    const [isPostOptionsOpen, setIsPostOptionsOpen] = useState<{ [key: string]: boolean }>({})
    const { data, isLoading } = useFeed()
    const deletee = useDeletePost()
    const update = useUpdatePost()
    const [isEditingPostId, setIsEditingPostId] = useState<number | null>(null)
    const { user } = useAuth()

    if (isLoading) {
        return <p>Cargando...</p>
    }

    const page = data

    const handleEditPost = (postId: number) => {
        setIsEditingPostId(postId)
    }

    return (
        <div className="mt-4 w-full max-w-lg mx-auto space-y-3">
            {page?.content?.map((p: any) => {
                const postType: PostType = (p.postType ?? p.type) as PostType

                return (
                    <div key={p.id} id={`post-${p.id}`} className="border rounded">
                        <div className="flex items-center text-sm text-gray-600 p-3">
                            {p.authorPhotoUrl ? (
                                <img
                                    src={p.authorPhotoUrl}
                                    alt="Avatar"
                                    className="inline-block h-7 w-7 rounded-full mr-2"
                                />
                            ) : (
                                <div className="inline-block h-7 w-7 rounded-full mr-2 bg-gray-300" />
                            )}
                            <div className="flex flex-col">
                                <Link to={`/u/${p.authorSlug}`} className="hover:text-blue-900">
                                    <span className="font-bold" >
                                        {p.authorName}
                                        <span className="font-normal">
                                            {postType === "profile_photo" && " actualizó su foto de perfil"}
                                            {postType === "banner_photo" && " actualizó su foto de portada"}
                                            {postType === "text" && " publicó un nuevo post"}
                                            {/* {p.authorName} · {new Date(p.createdAt).toLocaleString()} */}
                                        </span>
                                    </span>
                                </Link>
                                <span>{new Date(p.createdAt).toLocaleString()} {p.edited && " · editado"}</span>
                            </div>

                            <div className="ml-auto relative">
                                <button
                                    onClick={() => setIsPostOptionsOpen({ [p.id]: !isPostOptionsOpen[p.id] })}
                                    className="p-2 rounded-full hover:bg-gray-200 cursor-pointer"
                                >
                                    <BsThreeDotsVertical className="text-gray-600 text-lg" />
                                </button>
                                {isPostOptionsOpen[p.id] && (
                                    <div className="absolute right-0 mt-2 w-48 bg-white border rounded shadow-lg z-10">
                                        <ul>
                                            <li>
                                                <button
                                                    className="w-full text-left px-4 py-2 hover:bg-gray-100 flex items-center gap-2"
                                                    onClick={() => handleEditPost(p.id)}
                                                >
                                                    <FaEdit /> Editar
                                                </button>
                                            </li>
                                            <li>
                                                <button
                                                    className="w-full text-left px-4 py-2 hover:bg-gray-100 text-red-600 flex items-center gap-2"
                                                    onClick={() => {
                                                        deletee.mutate(p.id)
                                                        setIsPostOptionsOpen({ [p.id]: false })
                                                    }}
                                                >
                                                    <FaTrash /> Eliminar
                                                </button>
                                            </li>
                                        </ul>
                                    </div>
                                )}
                            </div>
                        </div>

                        <p className="px-3">{p.content}</p>
                        {p.mediaUrl && <img src={p.mediaUrl} alt="Media" className={`${p.content ? "mt-2" : ""} w-full`} />}

                        <div className="w-full grid grid-cols-3 text-sm text-gray-600 border-t mt-2">
                            <button className="hover:bg-gray-100 px-4 py-2 flex items-center gap-2 justify-center"><FaThumbsUp /> Me gusta</button>
                            <button className="hover:bg-gray-100 px-4 py-2 flex items-center gap-2 justify-center"><FaComment /> Comentar</button>
                            <button className="hover:bg-gray-100 px-4 py-2 flex items-center gap-2 justify-center"><FaShare /> Compartir</button>
                        </div>
                    </div>
                )
            })}

            <CreatePostDialog
                open={isEditingPostId !== null}
                onOpenChange={() => setIsEditingPostId(null)}
                postId={isEditingPostId}
            />
        </div>
    )
}
