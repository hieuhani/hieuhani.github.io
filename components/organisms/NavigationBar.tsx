import Link from 'next/link'

export const NavigationBar: React.FunctionComponent = () => {
  return (
    <div className="container">
      <nav
        className="py-4 flex items-center justify-between lg:justify-start"
        aria-label="Global"
      >
        <div className="flex items-center flex-grow flex-shrink-0 lg:flex-grow-0">
          <div className="flex items-center justify-between w-full md:w-auto">
            <Link href="/">
              <a>
                <div className="flex items-center">
                  <img className="h-16 w-16 rounded-full" src="/hieuhani.svg" />
                  <div className="ml-2">
                    <h2 className="text-2xl">Hieu Tran</h2>
                    <blockquote>Product oriented developer</blockquote>
                  </div>
                </div>
              </a>
            </Link>
          </div>
        </div>
        <div className="ml-auto md:space-x-8">
          <Link href="/">
            <a className="font-medium text-gray-500 hover:text-gray-900">
              Home
            </a>
          </Link>
          <Link href="/blog">
            <a className="font-medium text-gray-500 hover:text-gray-900">
              Blog
            </a>
          </Link>
          <Link href="/portfolio">
            <a className="font-medium text-gray-500 hover:text-gray-900">
              Portfolio
            </a>
          </Link>
          <Link href="/resume">
            <a className="font-medium text-gray-500 hover:text-gray-900">
              Resume
            </a>
          </Link>
        </div>
      </nav>
    </div>
  )
}
