"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"

export default function HomePage() {
  const router = useRouter()

  useEffect(() => {
    // Check if user is logged in
    const user = localStorage.getItem("courtTranscriptUser") || sessionStorage.getItem("courtTranscriptUser")

    if (user) {
      // If logged in, redirect to cases page
      router.push("/cases")
    } else {
      // If not logged in, redirect to login
      router.push("/login")
    }
  }, [router])

  // Return null as this is just a redirect page
  return null
}

