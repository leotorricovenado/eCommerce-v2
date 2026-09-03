import { Route, Routes } from "react-router"

import { FocusLayout } from "@/components/chrome/FocusLayout"
import { Layout } from "@/components/chrome/Layout"
import { ScrollToTop } from "@/components/chrome/ScrollToTop"
import { Cart } from "@/screens/Cart"
import { Catalog } from "@/screens/Catalog"
import { DeliverySchedule } from "@/screens/DeliverySchedule"
import { Home } from "@/screens/Home"
import { OrderHistory } from "@/screens/OrderHistory"
import { OrderStatus } from "@/screens/OrderStatus"
import { PaymentQR } from "@/screens/PaymentQR"
import { ProductDetail } from "@/screens/ProductDetail"
import { Profile } from "@/screens/Profile"
import { EarnStrategies } from "@/screens/money/EarnStrategies"
import { PointsHome } from "@/screens/money/PointsHome"
import { PointsHistory } from "@/screens/money/PointsHistory"
import { RedeemCatalog } from "@/screens/money/RedeemCatalog"
import { Tiers } from "@/screens/money/Tiers"

function App() {
  return (
    <>
      <ScrollToTop />
      <Routes>
      <Route element={<Layout />}>
        <Route path="/" element={<Home />} />
        <Route path="/catalogo" element={<Catalog />} />
        <Route path="/carrito" element={<Cart />} />
        <Route path="/pedidos" element={<OrderHistory />} />
        <Route path="/perfil" element={<Profile />} />
        <Route path="/puntos" element={<PointsHome />} />
        <Route path="/puntos/canjear" element={<RedeemCatalog />} />
        <Route path="/puntos/como-sumar" element={<EarnStrategies />} />
        <Route path="/puntos/extracto" element={<PointsHistory />} />
        <Route path="/puntos/niveles" element={<Tiers />} />
      </Route>
      <Route element={<FocusLayout />}>
        <Route path="/producto/:productId" element={<ProductDetail />} />
        <Route path="/checkout/entrega" element={<DeliverySchedule />} />
        <Route path="/checkout/pago" element={<PaymentQR />} />
        <Route path="/pedido/:orderId" element={<OrderStatus />} />
      </Route>
      </Routes>
    </>
  )
}

export default App
