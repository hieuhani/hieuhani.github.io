import cx from 'classnames'
import { ActiveLink as Link } from '@/components/molecules/ActiveLink'
import styles from './styles.module.css'
import { useState } from 'react'

export const NavigationBar: React.FunctionComponent = () => {
  const [isMenuActive, setIsMenuActive] = useState(false)
  const toggleMenuActive = () => setIsMenuActive(!isMenuActive)
  return (
    <div>
      <nav
        className="px-4 py-4 sm:px-6 lg:px-8 flex items-center justify-between lg:justify-start"
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

        <button
          className={cx('hamburger hamburger--elastic z-20 ml-auto', {
            'is-active': isMenuActive,
          })}
          onClick={toggleMenuActive}
          type="button"
          aria-label="Menu"
          aria-controls="navigation"
        >
          <span className="hamburger-box">
            <span className="hamburger-inner"></span>
          </span>
        </button>
        <nav
          id="navigation"
          className={cx(
            'fixed inset-0 bg-white z-10 flex items-center justify-center	',
            {
              hidden: !isMenuActive,
            },
          )}
        >
          <div
            className={cx('flex flex-col nav-items', styles['nav-items'])}
            onClick={toggleMenuActive}
          >
            <Link href="/">
              <a className="font-medium text-gray-500 hover:text-gray-900 px-4">
                Home
              </a>
            </Link>
            <Link href="/blog">
              <a className="font-medium text-gray-500 hover:text-gray-900 px-4">
                Blog
              </a>
            </Link>
            <Link href="/portfolio">
              <a className="font-medium text-gray-500 hover:text-gray-900 px-4">
                Portfolio
              </a>
            </Link>
            <Link href="/resume">
              <a className="font-medium text-gray-500 hover:text-gray-900 px-4">
                Resume
              </a>
            </Link>
          </div>
        </nav>
      </nav>
    </div>
  )
}
