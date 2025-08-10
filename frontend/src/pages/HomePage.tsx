import { Link } from "react-router-dom"
import { useAuth } from "../auth/AuthContext"

const HomePage: React.FC = () => {
    const { isAuthenticated, user, logout } = useAuth()

    if (isAuthenticated) {
    return (
      <div>
        <h1>Mi muro</h1>
        <p>Hola, {user?.name}</p>
        <button onClick={logout}>Cerrar sesión</button>
      </div>
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
