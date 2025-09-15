import { useAuth } from "../auth/AuthContext"
import { useDeletePost, useFeed } from "../hooks/usePosts"
import { useState } from "react"
import CreatePostDialog from "./dialogs/CreatePostDialog"
import PostViewDialog from "./dialogs/PostViewDialog"
import Post, { type PostDto } from "./posts/Post"

export default function PostList() {
    const { data, isLoading } = useFeed()
    const deletee = useDeletePost()
    const [isEditingPostId, setIsEditingPostId] = useState<number | null>(null)
    const [isViewingPostId, setIsViewingPostId] = useState<number | null>(null)
    const { user } = useAuth()

    if (isLoading) {
        return <p>Cargando...</p>
    }

    const page = data

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
