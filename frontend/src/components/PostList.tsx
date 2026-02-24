import { useAuth } from "../auth/AuthContext"
import { useDeletePost, useFeed, useUserPosts } from "../hooks/usePosts"
import { useState } from "react"
import CreatePostDialog from "./dialogs/CreatePostDialog"
import PostViewDialog from "./dialogs/PostViewDialog"
import Post from "./posts/Post"
import type { PostDto } from "@/services/PostService"

interface PostListProps {
    userId?: number
}

export default function PostList({ userId }: PostListProps) {
    const { data: feedData, isLoading: feedLoading } = useFeed()
    const { data: userPostsData, isLoading: userPostsLoading } = useUserPosts(userId || 0)
    const deletee = useDeletePost()
    const [isEditingPostId, setIsEditingPostId] = useState<number | null>(null)
    const [isViewingPostId, setIsViewingPostId] = useState<number | null>(null)
    const { user } = useAuth()

    if (feedLoading || userPostsLoading) return <p>Cargando...</p>

    const page = userId ? userPostsData : feedData

    if (!page?.content || page.content.length === 0) {
        return <p className="text-gray-500">Sin publicaciones para mostrar</p>
    }

    const handleEditPost = (postId: number) => setIsEditingPostId(postId)
    const handleDeletePost = (postId: number) => deletee.mutate(postId)
    const handleOpenComments = (postId: number) => setIsViewingPostId(postId)

    return (
        <div className="mt-4 w-full max-w-lg mx-auto space-y-3">
            {page?.content?.map((p: PostDto) => (
                <Post
                    key={p.id}
                    post={p}
                    canManage={user?.id === p.authorId}
                    onEdit={handleEditPost}
                    onDelete={handleDeletePost}
                    onComment={handleOpenComments}
                />
            ))}

            <CreatePostDialog
                postId={isEditingPostId}
                open={isEditingPostId !== null}
                onOpenChange={() => setIsEditingPostId(null)}
            />

            <PostViewDialog
                postId={isViewingPostId}
                open={isViewingPostId !== null}
                onOpenChange={() => setIsViewingPostId(null)}
            />
        </div>
    )
}
