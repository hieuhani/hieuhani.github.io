import React from 'react'
import { useRouter } from 'next/router'
import Link, { LinkProps } from 'next/link'

export const ActiveLink: React.FunctionComponent<LinkProps> = ({
  children,
  ...props
}) => {
  const { asPath } = useRouter()
  const child = React.Children.only(children)

  if (!React.isValidElement(child)) {
    return null
  }

  const cssClasses: string[] = [child.props.className]

  if ((props.href || props.as) === '/') {
    cssClasses.push('index-link')
  }
  if (
    asPath.startsWith(props.href as string) ||
    asPath.startsWith(props.as as string)
  ) {
    cssClasses.push('active')
  }
  if (asPath === props.href || asPath === props.as) {
    cssClasses.push('exact-active')
  }

  const className = cssClasses.filter(Boolean).join(' ')

  return (
    <Link {...props}>
      {React.cloneElement(child, {
        className,
      })}
    </Link>
  )
}
