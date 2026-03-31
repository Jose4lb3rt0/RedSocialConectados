import { Link, useSearchParams } from "react-router-dom"
import { useAuth } from "../auth/AuthContext"
import Layout from "../components/navigation/Layout"
import PostComposer from "../components/posts/PostComposer"
import PostList from "../components/posts/PostList"

const HomePage: React.FC = () => {
  const { isAuthenticated, user, logout } = useAuth()
  const [searchParams] = useSearchParams()
  const openPostId = searchParams.get("postId") ? Number(searchParams.get("postId")) : null

  if (isAuthenticated) {
    return (
      <Layout>
        <div className="py-4 max-w-lg mx-auto">
          <PostComposer />
          <PostList initialPostId={openPostId} />
        </div>
      </Layout>
    )
  }

  return (
    <div>
      <h1>¡Bienvenido a Conectados!</h1>
      <Link to="/login">
        <button>Iniciar Sesión</button>
      </Link>
      <Link to="/register">
        <button>Registrar</button>
      </Link>
    </div>
  )
}

export default HomePage
