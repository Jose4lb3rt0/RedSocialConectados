import { useEffect, useRef, useState } from "react"
import { Link } from "react-router-dom"
import { BsThreeDotsVertical } from "react-icons/bs"
import { FaComment, FaEdit, FaShare, FaThumbsUp, FaTrash } from "react-icons/fa"
import { usePostReactions, useReactToPost } from "@/hooks/usePosts"

type ReactionKey = "like" | "love" | "care" | "haha" | "wow" | "sad" | "angry"

const REACTIONS: { key: ReactionKey, label: string, emoji: string }[] = [
    { key: "like", label: "Me gusta", emoji: "👍" },
    { key: "love", label: "Me encanta", emoji: "❤️" },
    { key: "care", label: "Me importa", emoji: "🥰" },
    { key: "haha", label: "Me divierte", emoji: "😂" },
    { key: "wow", label: "Me asombra", emoji: "😮" },
    { key: "sad", label: "Me entristece", emoji: "😢" },
    { key: "angry", label: "Me enfada", emoji: "😡" },
]

//ESTILOS
const REACTION_META: Record<ReactionKey, { label: string; emoji: string; cls: string }> = {
    like: { label: "Me gusta", emoji: "👍", cls: "text-blue-600" },
    love: { label: "Me encanta", emoji: "❤️", cls: "text-rose-600" },
    care: { label: "Me importa", emoji: "🥰", cls: "text-amber-600" },
    haha: { label: "Me divierte", emoji: "😂", cls: "text-yellow-600" },
    wow: { label: "Me asombra", emoji: "😮", cls: "text-purple-600" },
    sad: { label: "Me entristece", emoji: "😢", cls: "text-sky-600" },
    angry: { label: "Me enfada", emoji: "😡", cls: "text-red-600" },
}

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
    // likesCount?: number
    // likedByMe?: boolean
    commentsCount?: number
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
    const [pickerOpen, setPickerOpen] = useState(false)
    const closeTimer = useRef<number | null>(null)

    const { data: reactions } = usePostReactions(post.id)
    const reactMut = useReactToPost()

    const reactionsCount = reactions?.total ?? 0

    const myReaction = reactions?.myReaction ? (reactions.myReaction.toLowerCase() as ReactionKey) : null

    const activeMeta = myReaction ? REACTION_META[myReaction] : null

    const handleLike = () => {
        if (reactMut.isPending) return
        reactMut.mutate({ postId: post.id, type: myReaction ? null : "like" })
    }

    const openPicker = () => {
        if (closeTimer.current) {
            window.clearTimeout(closeTimer.current)
            closeTimer.current = null
        }
        setPickerOpen(true)
    }

    const scheduleClosePicker = () => {
        if (closeTimer.current) window.clearTimeout(closeTimer.current)
        closeTimer.current = window.setTimeout(() => setPickerOpen(false), 120)
    }

    const handleSelectReaction = (key: ReactionKey) => {
        if (reactMut.isPending) return
        reactMut.mutate({ postId: post.id, type: key })
        setPickerOpen(false)
    }

    const counts = reactions?.counts || {}
    const top3 = Object.entries(counts)
        .sort((a, b) => (b[1] as number) - (a[1] as number))
        .slice(0, 3)
        .map(([k]) => {
            const key = k.toLowerCase() as ReactionKey
            return REACTION_META[key]?.emoji || ""
        })

    useEffect(() => {
        console.log("reactions (normalizado):", reactions)
        console.log("myReaction:", myReaction, "activeMeta:", activeMeta)
    }, [reactions, myReaction, activeMeta])

    return (
        <div id={`post-${post.id}`} className="border rounded">
            <div className="flex items-center text-sm text-gray-600 p-3">
                {post.authorPhotoUrl ? (
                    <img src={post.authorPhotoUrl} alt="Avatar" className="inline-block h-7 w-7 rounded-full mr-2" />
                ) : (
                    <div className="inline-block h-7 w-7 rounded-full mr-2 bg-gray-300" />
                )}

                <div className="flex flex-col">
                    <span className="font-bold">
                        <Link to={`/u/${post.authorSlug}`} className="hover:text-blue-600">
                            {post.authorName}
                        </Link>
                        <span className="font-normal">
                            {post.postType === "profile_photo" && " actualizó su foto de perfil"}
                            {post.postType === "banner_photo" && " actualizó su foto de portada"}
                            {post.postType === "text" && " publicó un nuevo post"}
                        </span>
                    </span>
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

            {reactionsCount > 0 && (
                <div className="px-3 mt-2 text-sm text-gray-600 flex items-center justify-between">
                    <span className="flex items-center gap-1">
                        <span className="flex -space-x-1">
                            {top3.map((e, indice) => (
                                <span key={indice} className="first:ml-0 ml-[-2px]">{e}</span>
                            ))}
                        </span>
                        <span>{reactionsCount}</span>
                    </span>
                    {(post.commentsCount ?? 0) > 0 && (
                        <span
                            onClick={() => onComment(post.id)}
                            className="cursor-pointer hover:underline"
                        >
                            {post.commentsCount} comentario{(post.commentsCount ?? 0) === 1 ? "" : "s"}
                        </span>
                    )}
                </div>
            )}

            <div className="w-full grid grid-cols-3 text-sm text-gray-600 border-t mt-2">
                {/* BOTON + PICKER */}
                <div
                    className="relative flex items-stretch justify-center"
                    onMouseEnter={openPicker}
                    onMouseLeave={scheduleClosePicker}
                >
                    <button
                        onClick={handleLike}
                        className={`cursor-pointer hover:bg-gray-100 px-4 py-2 w-full flex items-center gap-2 justify-center ${activeMeta ? activeMeta.cls : ""}`}
                        disabled={reactMut.isPending}
                        aria-haspopup="menu"
                        aria-expanded={pickerOpen}
                        aria-label={activeMeta ? `Tu reacción: ${activeMeta.label}` : "Me gusta"}
                    >
                        {activeMeta ? (
                            <>
                                <span className="text-lg">{activeMeta.emoji}</span>
                                <span>{activeMeta.label}</span>
                            </>
                        ) : (
                            <>
                                <FaThumbsUp />
                                <span>Me gusta</span>
                            </>
                        )}
                    </button>

                    {pickerOpen && (
                        <div
                            role="menu"
                            aria-label="Reacciones"
                            className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 bg-white border rounded-full shadow-lg px-2 py-1 flex gap-1 z-20"
                            onMouseEnter={openPicker}
                            onMouseLeave={scheduleClosePicker}
                        >
                            {REACTIONS.map(r => (
                                <button
                                    key={r.key}
                                    title={r.label}
                                    aria-label={r.label}
                                    onClick={() => handleSelectReaction(r.key)}
                                    className={`cursor-pointer h-10 w-10 flex items-center justify-center hover:scale-110 transition-transform rounded-full ${myReaction === r.key ? "ring-2 ring-offset-2 ring-blue-500" : ""}`}
                                    type="button"
                                >
                                    <span className="text-2xl">{r.emoji}</span>
                                </button>
                            ))}
                        </div>
                    )}
                </div>

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