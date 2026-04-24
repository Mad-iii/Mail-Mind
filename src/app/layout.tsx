import type { Metadata } from "next"
import { DM_Serif_Display, DM_Mono } from "next/font/google"
import "./globals.css"
import { Providers } from "@/components/Providers"

const dmSerif = DM_Serif_Display({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-display",
})

const dmMono = DM_Mono({
  weight: ["300", "400", "500"],
  subsets: ["latin"],
  variable: "--font-body",
})

export const metadata: Metadata = {
  title: "Mailmind — AI Email Assistant",
  description: "Summarize and classify your emails with AI",
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${dmSerif.variable} ${dmMono.variable}`}>
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  )
}
