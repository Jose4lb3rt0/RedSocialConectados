import { Link } from "react-router-dom"
import { useAuth } from "../auth/AuthContext"
import Layout from "../components/Navigation/Layout"
import PostComposer from "../components/PostComposer"
import PostList from "../components/PostList"

const HomePage: React.FC = () => {
  const { isAuthenticated, user, logout } = useAuth()

  if (isAuthenticated) {
    return (
      <Layout>
        <div>
          <h1>Mi muro</h1>
          <p>Hola, {user?.name}</p>
          <PostComposer />
          <PostList />
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
