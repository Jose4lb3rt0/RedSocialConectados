import { useState } from "react";
import { useCreatePost } from "../hooks/usePosts";

export default function PostComposer() {
    const [content, setContent] = useState("")
    const create = useCreatePost()

    return (
        <div className="border rounded p-3">
            <textarea 
                className="w-full border rounded p-2"
                placeholder="¿Qué estás pensando?"
                value={content}
                onChange={(e) => setContent(e.target.value)}
            />
            <button
                className="mt-2 px-3 py-1 rounded bg-blue-600 text-white disabled:bg-blue-300"
                disabled={!content.trim() || create.isPending}
                onClick={() => {
                    create.mutate({ content: content.trim() })
                    setContent("")
                }}
            >
                Publicar
            </button>
        </div>
    )
}