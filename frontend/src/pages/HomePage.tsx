import { Link, useSearchParams } from "react-router-dom"
import { useAuth } from "../auth/AuthContext"
import Layout from "../components/navigation/Layout"
import PostComposer from "../components/posts/PostComposer"
import PostList from "../components/posts/PostList"
import LeftAside from "@/components/home/LeftAside"
import RightAside from "@/components/home/RightAside"
import { useState } from "react"
import LoginPage from "./LoginPage"

const HomePage: React.FC = () => {
  const { isAuthenticated } = useAuth()
  const [searchParams] = useSearchParams()
  const openPostId = searchParams.get("postId") ? Number(searchParams.get("postId")) : null

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLogin, setIsLogin] = useState(true);

  if (isAuthenticated) {
    return (
      <Layout>
        {/* h-[calc(100vh-3.5rem)] = altura total menos el navbar (h-14 = 3.5rem) */}
        <div className="flex h-[calc(100vh-3.5rem)] overflow-hidden">

          {/* Aside izquierdo — links */}
          <LeftAside />

          {/* Feed central */}
          <div className="flex-1 overflow-y-auto border-x border-gray-200">
            <div className="max-w-xl mx-auto py-4 px-4">
              <PostComposer />
              <PostList initialPostId={openPostId} />
            </div>
          </div>

          {/* Aside derecho — contactos */}
          <RightAside />

        </div>
      </Layout>
    )
  }

  return (
    <LoginPage />
  )
}

export default HomePage
