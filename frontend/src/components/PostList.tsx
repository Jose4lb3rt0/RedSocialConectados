import { useAuth } from "../auth/AuthContext";
import { useDeletePost, useFeed, useUpdatePost } from "../hooks/usePosts";

export default function PostList() {
    const { data, isLoading } = useFeed()
    const deletee = useDeletePost()
    const update = useUpdatePost()
    const { user } = useAuth()

    if (isLoading) {
        <p>Cargando...</p>
    }

    const page = data

    return (
        <div className="mt-4 space-y-3">

            {page?.content?.map((p: any) => (
                <div key={p.id} className="border rounded p-3">
                    <div className="text-sm text-gray-600">
                        {p.authorName} · {new Date(p.createdAt).toLocaleString()}
                        {p.edited && " · editado"}
                    </div>
                    <p className="mt-2">{p.content}</p>

                    {user?.id === p.authorId && (
                        <div className="mt-2 flex gap-2">
                            <button className="px-2 py-1 border rounded"
                                onClick={() => update.mutate({ id: p.id, content: prompt("Nuevo contenido", p.content) || p.content })}>
                                Editar
                            </button>
                            <button className="px-2 py-1 border rounded text-red-600"
                                onClick={() => deletee.mutate(p.id)}>
                                Eliminar
                            </button>
                        </div>
                    )}
                </div>
            ))}

        </div>
    )
}
