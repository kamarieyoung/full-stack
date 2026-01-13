"use client"

import { ChakraProvider, defaultSystem } from "@chakra-ui/react"
import { Provider as ReduxProvider } from "react-redux"
import type { ReactNode } from "react"
import { useEffect } from "react"
import { store } from "@/store/store"
import { initAgGrid } from "@/lib/ag-grid-config"

export function Provider({ children }: Readonly<{ children: ReactNode }>) {
  // 在应用启动时初始化 AG Grid Enterprise
  useEffect(() => {
    initAgGrid()
  }, [])

  return (
    <ReduxProvider store={store}>
      <ChakraProvider value={defaultSystem}>
        {children}
      </ChakraProvider>
    </ReduxProvider>
  )
}
