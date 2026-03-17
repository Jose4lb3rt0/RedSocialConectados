import { useAuth } from "../../auth/AuthContext";
import { useDeletePost, useFeed, useUserPosts } from "../../hooks/usePosts";
import { useEffect, useRef, useState } from "react";
import CreatePostDialog from "../dialogs/CreatePostDialog";
import PostViewDialog from "../dialogs/PostViewDialog";
import Post from "./Post";
import type { PostDto } from "@/services/PostService";
import { useQueryClient } from "@tanstack/react-query";

interface PostListProps {
  userId?: number;
  initialPostId?: number | null
}

export default function PostList({ userId, initialPostId }: PostListProps) {
  const feedQuery = useFeed();
  const userPostsQuery = useUserPosts(userId || 0);
  const deletee = useDeletePost();
  const qc = useQueryClient()
  const [isEditingPostId, setIsEditingPostId] = useState<number | null>(null);
  const [isViewingPostId, setIsViewingPostId] = useState<number | null>(null);
  const { user } = useAuth();
  const sentinelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!initialPostId) return
    qc.invalidateQueries({ queryKey: ["post", initialPostId] })
    setIsViewingPostId(initialPostId)
  }, [initialPostId, qc])

  const query = userId ? userPostsQuery : feedQuery;
  const {
    data,
    isLoading,
    isFetchingNextPage,
    hasNextPage,
    fetchNextPage,
    isError,
  } = query;

  // Configurar Intersection Observer para cargar más posts al llegar al final de la lista
  useEffect(() => {
    if (!sentinelRef.current) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && hasNextPage && !isFetchingNextPage) {
          fetchNextPage();
        }
      },
      { threshold: 0.1 },
    );
    observer.observe(sentinelRef.current);
    return () => observer.disconnect();
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  if (isLoading) return <p>Cargando...</p>;
  if (isError) return <p>Error al cargar las publicaciones</p>

  // Aplanar todas las páginas acumuladas en un solo array
  const posts = data?.pages.flatMap((page) => page.content) ?? [];

  if (posts.length === 0) {
    return <p className="text-gray-500">Sin publicaciones para mostrar</p>;
  }

  const handleEditPost = (postId: number) => setIsEditingPostId(postId);
  const handleDeletePost = (postId: number) => deletee.mutate(postId);
  const handleOpenComments = (postId: number) => setIsViewingPostId(postId);

  return (
    <div className="mt-4 w-full max-w-lg mx-auto space-y-3">
      {posts.map((p: PostDto) => (
        <Post
          key={p.id}
          post={p}
          canManage={user?.id === p.authorId}
          onEdit={handleEditPost}
          onDelete={handleDeletePost}
          onComment={handleOpenComments}
        />
      ))}

      {/* Centinela: cuando es visible se carga la siguiente página */}
      <div ref={sentinelRef} className="h-2" />

      {isFetchingNextPage && (
        <p className="text-center text-sm text-gray-400 py-2">
          Cargando más...
        </p>
      )}

      {!hasNextPage && posts.length > 0 && (
        <p className="text-center text-sm text-gray-400 py-2">
          No hay más publicaciones
        </p>
      )}

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
  );
}
