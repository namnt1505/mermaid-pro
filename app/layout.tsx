"use client"
import './globals.css'
import { Provider } from "react-redux"
import { store } from "@/lib/store/store"

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className="h-full">
      <body className="h-full m-0 p-0">
        <Provider store={store}>
          {children}
        </Provider>
      </body>
    </html>
  )
}
