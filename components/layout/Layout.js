import { useRouter } from 'next/router'
import ErrorPage from 'next/error'
import BlogLayout from './BlogLayout'
import BlogContext from '../../context/BlogContext'
import { getPostBySlug, getAllPosts } from '../../lib/api'

export default function Layout({ children }) {
  const { pathname } = useRouter();
  const posts = getAllPosts()

  if (pathname === '/') {
    return (
      <BlogContext.Provider value={{ navItems: posts }}>
        {children}
      </BlogContext.Provider>
    )
  }

  const post = getPostBySlug(pathname);
  if (post) {
    return (
      <BlogLayout post={post} navItems={posts}>
        {children}
      </BlogLayout>
    );
  }

  return <ErrorPage statusCode={404} />
}
