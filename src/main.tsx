import { StrictMode } from "react"
import { createRoot } from "react-dom/client"
import { HashRouter } from "react-router"

import "./theme.css"
import App from "./App.tsx"
import { CartProvider } from "@/state/cart"
import { CheckoutProvider } from "@/state/checkout"
import { OrderProvider } from "@/state/order"
import { PointsProvider } from "@/state/points"
import { SessionProvider } from "@/state/session"

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <HashRouter>
      <SessionProvider>
        <CartProvider>
          <CheckoutProvider>
            <OrderProvider>
              <PointsProvider>
                <App />
              </PointsProvider>
            </OrderProvider>
          </CheckoutProvider>
        </CartProvider>
      </SessionProvider>
    </HashRouter>
  </StrictMode>
)
