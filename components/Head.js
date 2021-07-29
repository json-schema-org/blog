import { useContext } from 'react'
import Head from 'next/head'
import AppContext from '../context/AppContext'
import ReactGA from 'react-ga'
import TagManager from 'react-gtm-module'

export default function HeadComponent({
  title,
  description = 'The home of JSON Schema',
  image = '/img/social/card.png',
  rssTitle = 'RSS Feed for the JSON Schema Blog',
  rssLink = '/rss.xml'
}) {
  const url = process.env.DEPLOY_PRIME_URL || process.env.DEPLOY_URL
  const { path = '' } = useContext(AppContext)
  const permalink = `${url}${path}`
  let type = 'website'
  if (path.startsWith('/docs') || path.startsWith('/blog')) type = 'article'
  if (!image.startsWith('http') && !image.startsWith('https')) image = `${url}${image}`
  const permTitle = 'The home of JSON Schema'
  title = title ? `${title} | ${permTitle}` : permTitle

  //enable google analytics
  if (typeof window !== 'undefined') {
    ReactGA.initialize('UA-99695987-1')
    ReactGA.pageview(window.location.pathname + window.location.search)
  }

  return (
    <Head>
      <meta name="viewport" content="width=device-width, initial-scale=1, shrink-to-fit=no" />
      <meta httpEquiv="x-ua-compatible" content="ie=edge" />
      <meta httpEquiv="Content-Type" content="text/html; charset=utf-8" />
      <meta name="description" content={description} />
      <link rel="alternate" type="application/rss+xml" title={rssTitle} href={rssLink} />

      {/* Icons */}
      <link rel="icon" href="/favicon.ico" />

      {/* Google / Search Engine Tags */}
      <meta itemProp="name" content={title} />
      <meta itemProp="description" content={description} />
      <meta itemProp="image" content={image} />

      {/* Twitter Card data */}
      <meta name="twitter:card" value="summary_large_image" />
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={image} />

      {/* Open Graph data */}
      <meta property="og:title" content={title} />
      <meta property="og:type" content={type} />
      <meta property="og:url" content={permalink} />
      <meta property="og:image" content={image} />
      <meta property="og:description" content={description} />

      <title>{title}</title>
    </Head>
  )
}
