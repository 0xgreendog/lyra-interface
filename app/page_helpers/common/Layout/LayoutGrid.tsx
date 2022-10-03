import Grid from '@lyra/ui/components/Grid'
import React from 'react'

type Props = {
  children?: React.ReactNode
}

export default function LayoutGrid({ children }: Props): JSX.Element {
  return (
    <Grid
      flexGrow={1}
      sx={{
        gridTemplateColumns: '1fr',
        gap: [3, 6],
        alignContent: 'start',
        justifyContent: 'start',
      }}
      pb={[0, 12]}
    >
      {children}
    </Grid>
  )
}
