import { Link } from "react-router-dom"

const HomePage: React.FC = () => {
    return (
        <div>
            <h1>Welcome to the Home Page</h1>
            <Link to="/login">
                <button>Login</button>
            </Link>
            <Link to="/register">
                <button>Register</button>
            </Link>
        </div>
    )
}

export default HomePage
