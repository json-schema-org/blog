export default function NavBar() {


  const logoStyle = {
    background: 'url(https://json-schema.org/assets/logo.svg) center left no-repeat',
    backgroundSize: 'contain',
    // 'line-height': '46px',
    paddingLeft: '50px',
    fontSize: '26px'
  }

  return (
  <div className="inset-0 leading-8 mb-6">
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
          </div>
  );
}