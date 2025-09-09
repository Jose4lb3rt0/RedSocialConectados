import { useState } from "react";
import { useCreatePost } from "../hooks/usePosts";
import { useAuth } from "@/auth/AuthContext";
import CreatePostDialog from "./dialogs/CreatePostDialog";

export default function PostComposer() {
    const [isCreatePostDialogOpen, setIsCreatePostDialogOpen] = useState(false)
    const { user } = useAuth()
    const [content, setContent] = useState("")
    const create = useCreatePost()

    return (
        <div className="border w-full max-w-lg mx-auto rounded p-3">
            <textarea 
                onClick={() => setIsCreatePostDialogOpen(true)}
                className="w-full border rounded p-2"
                placeholder={`¿Qué estás pensando, ${user?.name}?`}
                // value={content}
                // onChange={(e) => setContent(e.target.value)}
            />
            {/* <button
                className="mt-2 px-3 py-1 rounded bg-blue-600 text-white disabled:bg-blue-300"
                disabled={!content.trim() || create.isPending}
                onClick={() => {
                    create.mutate({ content: content.trim() })
                    setContent("")
                }}
            >
                Publicar
            </button> */}

            <CreatePostDialog open={isCreatePostDialogOpen} onOpenChange={setIsCreatePostDialogOpen} />
        </div>
    )
}