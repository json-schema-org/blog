import { useContext } from 'react'
import Link from 'next/link'

import Container from '../components/layout/Container'
import Head from '../components/Head'
import Footer from '../components/Footer'
import BlogPostItem from '../components/BlogPostItem'
import NavBar from '../components/NavBar'

import BlogContext from '../context/BlogContext'

export default function HomePage() {
  const { navItems } = useContext(BlogContext)

  const posts = navItems.sort((i1, i2) => {
    const i1Date = new Date(i1.date)
    const i2Date = new Date(i2.date)

    if (i1.featured && !i2.featured) return -1
    if (!i1.featured && i2.featured) return 1
    return i2Date - i1Date
  })

  return (
    <div>
       <div className="relative pt-8 pb-20 px-4 sm:px-6 lg:pt-6 lg:pb-28 lg:px-8">
        <Container wide>
            <Head title="JSON Schema Blog index" />
            <NavBar className="z-50" />
          </Container>
        <div className="relative max-w-7xl mx-auto">
          <div className="text-center">
            <h2 className="text-3xl leading-9 tracking-tight font-extrabold text-gray-900 sm:text-4xl sm:leading-10">
              Welcome to our blog!
            </h2>
            <p className="mt-3 max-w-2xl mx-auto text-xl leading-7 text-gray-500 sm:mt-4">
              Find the latest and greatest stories from our community.
            </p>
            {/* <p className="max-w-2xl mx-auto text-md leading-7 text-gray-400">
              Want to publish a blog post? We love community stories.
              <Link className="ml-1 text-primary-500 hover:text-primary-400" href="https://github.com/asyncapi/website/issues/new?template=blog.md" target="_blank" rel="noreferrer">Submit yours!</Link>
            </p> */}
            <p className="max-w-2xl mx-auto text-md leading-7 text-gray-400">
              We have an <img className="ml-1 text-primary-500 hover:text-primary-400" style={{ display: 'inline' }} src={`${process.env.NEXT_PUBLIC_BASE_PATH ? process.env.NEXT_PUBLIC_BASE_PATH : ''}/img/logos/rss.svg`} height="18px" width="18px" /> <Link className="ml-1 text-primary-500 hover:text-primary-400" href="/rss.xml">RSS Feed</Link> too!
            </p>
          </div>
          <div className="mt-12 grid gap-5 max-w-lg mx-auto lg:grid-cols-3 lg:max-w-none">
            {
              posts.map((post, index) => (
                <BlogPostItem key={index} post={post} />
              ))
            }
          </div>
        </div>
      </div>
      <Footer />
    </div>
  )
}
