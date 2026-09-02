// Atajo de DEMO heredado de la v1 (`evenado-catalogo/src/lib/botApi.ts`, probado con el bot real):
// cuando el pedido se "paga", la propia web le avisa al backend del bot (gv-agent-core,
// endpoint `/api/v1/demo/catalogo/pedido-confirmado/`) para que el bot le mande al cliente el
// mensaje de WhatsApp "pedido confirmado". En la arquitectura real este aviso NO sale del
// frontend: lo emite eVenado al consumir el evento de Sales/Invoice (memoria
// `deal-crm-boundary-pedidos`). Sin las variables de entorno, se omite en silencio.
//
// Variables (ver .env.example):
//   VITE_BOT_API_BASE_URL   URL pública del backend del bot, sin slash final.
//   VITE_BOT_API_KEY        Una de las keys de INTEGRATION_API_KEYS del backend.
//   VITE_BOT_WHATSAPP_NUMBER Número del bot (sin "+"), para el botón "Volver a WhatsApp".

interface NotifyOrderConfirmedInput {
  phone: string
  orderNumber: string
  total: number
}

export const botWhatsAppNumber = import.meta.env.VITE_BOT_WHATSAPP_NUMBER as string | undefined

/** Link al chat del bot (wa.me). Si no hay número configurado, vuelve al Home. */
export const whatsAppChatHref = botWhatsAppNumber ? `https://wa.me/${botWhatsAppNumber}` : "#/"

export async function notifyOrderConfirmed({
  phone,
  orderNumber,
  total,
}: NotifyOrderConfirmedInput): Promise<void> {
  const baseUrl = import.meta.env.VITE_BOT_API_BASE_URL as string | undefined
  const apiKey = import.meta.env.VITE_BOT_API_KEY as string | undefined

  if (!baseUrl || !apiKey) {
    console.warn(
      "[botApi] VITE_BOT_API_BASE_URL / VITE_BOT_API_KEY no configuradas; se omite la notificación al bot."
    )
    return
  }

  try {
    await fetch(`${baseUrl}/api/v1/demo/catalogo/pedido-confirmado/`, {
      method: "POST",
      headers: { "Content-Type": "application/json", "X-API-Key": apiKey },
      body: JSON.stringify({ phone, order_number: orderNumber, total }),
    })
  } catch (err) {
    console.warn("[botApi] No se pudo notificar el pedido al bot:", err)
  }
}
