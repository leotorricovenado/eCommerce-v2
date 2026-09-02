import { Outlet } from "react-router"

import { BottomNav } from "./BottomNav"
import { TopBar } from "./TopBar"

export function Layout() {
  return (
    <div className="min-h-screen bg-background">
      <TopBar />
      <main className="mx-auto max-w-3xl pb-20">
        <Outlet />
      </main>
      <BottomNav />
    </div>
  )
}
