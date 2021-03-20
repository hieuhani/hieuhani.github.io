import React from 'react'
import { useRouter } from 'next/router'
import Link, { LinkProps } from 'next/link'

export interface ActiveLinkProps extends LinkProps {}

export const ActiveLink: React.FunctionComponent<ActiveLinkProps> = ({
  children,
  ...props
}) => {
  const { asPath } = useRouter()
  const child = React.Children.only(children)

  if (!React.isValidElement(child)) {
    return null
  }
  const childClassName = child.props.className || ''

  const className =
    asPath === props.href || asPath === props.as
      ? `${childClassName} active`
      : childClassName

  return (
    <Link {...props}>
      {React.cloneElement(child, {
        className: className || null,
      })}
    </Link>
  )
}
