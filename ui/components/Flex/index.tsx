import React from 'react'
import { BaseProps, Flex as RebassFlex, SxProps } from 'rebass'
import { ColorProps, FlexboxProps, LayoutProps, MarginProps, PaddingProps } from 'styled-system'

export type FlexProps = {
  children?: React.ReactNode
  onClick?: React.ReactEventHandler
  onMouseOut?: React.MouseEventHandler
  onMouseOver?: React.MouseEventHandler
  href?: string
  target?: string
  variant?: string
  id?: string
  className?: string
} & Pick<BaseProps, 'as'> &
  Omit<FlexboxProps & ColorProps & MarginProps & PaddingProps & LayoutProps & SxProps, 'children'>

export type FlexElement = React.ReactElement<FlexProps>

/* eslint-disable react/prop-types */
// eslint-disable-next-line react/display-name
const Flex = React.forwardRef<HTMLDivElement, FlexProps>(({ children, ...props }, ref): FlexElement => {
  return (
    <RebassFlex {...props} ref={ref}>
      {children}
    </RebassFlex>
  )
})

export default Flex
