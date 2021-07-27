import { useContext } from 'react'

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

  const logoStyle = {
    background: 'url(https://json-schema.org/assets/logo.svg) center left no-repeat',
    backgroundSize: 'contain',
    // 'line-height': '46px',
    paddingLeft: '50px',
    fontSize: '26px'
  }

  return (
    <div>
       <div className="relative pt-8 pb-20 px-4 sm:px-6 lg:pt-6 lg:pb-28 lg:px-8">
        <Container wide>
            <Head title="The JSON Schema Blog index" />
            <NavBar className="z-50" />
          </Container>
        {/* <div className="inset-0 leading-8 mb-6">
          <div className="max-w-4xl block px-4 sm:px-6 lg:px-8 container mx-auto clear-both" >
            <nav className="-mx-5 -my-2 flex flex-wrap">
              <div className="px-5 py-2">
                <a className="site-title" rel="author" href="/" style={logoStyle}>JSON Schema</a>
              </div>
              <div className="flex-grow"></div>
              <div className="px-5 py-2">
                <a href="/blog" className="text-base leading-6 text-gray-500 hover:text-gray-900">
                  Blog
                </a>
              </div>
              <div className="px-5 py-2">
                <a href="/learn" className="text-base leading-6 text-gray-500 hover:text-gray-900">
                  Learn
                </a>
              </div>
              <div className="px-5 py-2">
                <a href="/implementations" className="text-base leading-6 text-gray-500 hover:text-gray-900">
                  Implementations
                </a>
              </div>
              <div className="px-5 py-2">
                <a href="/slack" className="text-base leading-6 text-gray-500 hover:text-gray-900">
                  Join our Slack
                </a>
              </div>
            </nav>
          </div>
        </div> */}
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
              <a className="ml-1 text-primary-500 hover:text-primary-400" href="https://github.com/asyncapi/website/issues/new?template=blog.md" target="_blank" rel="noreferrer">Submit yours!</a>
            </p> */}
            <p className="max-w-2xl mx-auto text-md leading-7 text-gray-400">
              We have an <img className="ml-1 text-primary-500 hover:text-primary-400" style={{ display: 'inline' }} src="/img/logos/rss.svg" height="18px" width="18px" /> <a className="ml-1 text-primary-500 hover:text-primary-400" href="/rss.xml">RSS Feed</a> too!
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
