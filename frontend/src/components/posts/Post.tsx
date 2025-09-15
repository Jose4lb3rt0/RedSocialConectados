import { useState } from "react"
import { Link } from "react-router-dom"
import { BsThreeDotsVertical } from "react-icons/bs"
import { FaComment, FaEdit, FaShare, FaThumbsUp, FaTrash } from "react-icons/fa"

export type PostDto = {
    id: number
    authorId: number
    authorName: string
    authorSlug: string
    authorPhotoUrl?: string | null
    content?: string | null
    mediaUrl?: string | null
    createdAt: string
    updatedAt?: string | null
    edited?: boolean
    postType: "text" | "profile_photo" | "banner_photo"
}

type Props = {
    post: PostDto
    canManage?: boolean
    onEdit: (id: number) => void
    onDelete: (id: number) => void
    onComment: (id: number) => void
}

const Post: React.FC<Props> = ({ post, canManage = false, onEdit, onDelete, onComment }) => {
    const [menuOpen, setMenuOpen] = useState(false)

    return (
        <div id={`post-${post.id}`} className="border rounded">
            <div className="flex items-center text-sm text-gray-600 p-3">
                {post.authorPhotoUrl ? (
                    <img src={post.authorPhotoUrl} alt="Avatar" className="inline-block h-7 w-7 rounded-full mr-2" />
                ) : (
                    <div className="inline-block h-7 w-7 rounded-full mr-2 bg-gray-300" />
                )}

                <div className="flex flex-col">
                    <Link to={`/u/${post.authorSlug}`} className="hover:text-blue-900">
                        <span className="font-bold">
                            {post.authorName}
                            <span className="font-normal">
                                {post.postType === "profile_photo" && " actualizó su foto de perfil"}
                                {post.postType === "banner_photo" && " actualizó su foto de portada"}
                                {post.postType === "text" && " publicó un nuevo post"}
                            </span>
                        </span>
                    </Link>
                    <span>
                        {new Date(post.createdAt).toLocaleString()} {post.edited && " · editado"}
                    </span>
                </div>

                <div className="ml-auto relative">
                    <button
                        onClick={() => setMenuOpen((v) => !v)}
                        className="p-2 rounded-full hover:bg-gray-200 cursor-pointer"
                    >
                        <BsThreeDotsVertical className="text-gray-600 text-lg" />
                    </button>
                    {menuOpen && (
                        <div className="absolute right-0 mt-2 w-48 bg-white border rounded shadow-lg z-10">
                            <ul>
                                {canManage && (
                                    <li>
                                        <button
                                            className="w-full text-left px-4 py-2 hover:bg-gray-100 flex items-center gap-2"
                                            onClick={() => {
                                                onEdit(post.id)
                                                setMenuOpen(false)
                                            }}
                                        >
                                            <FaEdit /> Editar
                                        </button>
                                    </li>
                                )}
                                {canManage && (
                                    <li>
                                        <button
                                            className="w-full text-left px-4 py-2 hover:bg-gray-100 text-red-600 flex items-center gap-2"
                                            onClick={() => {
                                                onDelete(post.id)
                                                setMenuOpen(false)
                                            }}
                                        >
                                            <FaTrash /> Eliminar
                                        </button>
                                    </li>
                                )}
                            </ul>
                        </div>
                    )}
                </div>
            </div>

            {post.content && <p className="px-3">{post.content}</p>}
            {post.mediaUrl && (
                <img src={post.mediaUrl} alt="Media" className={`${post.content ? "mt-2" : ""} w-full`} />
            )}

            <div className="w-full grid grid-cols-3 text-sm text-gray-600 border-t mt-2">
                <button className="hover:bg-gray-100 px-4 py-2 flex items-center gap-2 justify-center">
                    <FaThumbsUp /> Me gusta
                </button>
                <button
                    onClick={() => onComment(post.id)}
                    className="hover:bg-gray-100 px-4 py-2 flex items-center gap-2 justify-center"
                >
                    <FaComment /> Comentar
                </button>
                <button className="hover:bg-gray-100 px-4 py-2 flex items-center gap-2 justify-center">
                    <FaShare /> Compartir
                </button>
            </div>
        </div>
    )
}

export default Post