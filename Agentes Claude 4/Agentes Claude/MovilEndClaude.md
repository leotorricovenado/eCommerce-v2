# Contexto y Estándares: Móvil React Native + Expo (Feature-Based + Offline)

## Arquitectura del Proyecto
Sigue una estructura Feature-Based adaptada a capacidades nativas y sincronización fuera de línea:
- `src/app/`: Navegación y rutas (React Navigation / Expo Router).
- `src/features/<feature>/`: (auth, customers, visits, orders...)
  - `screens/`: Pantallas de la característica envueltas en `SafeAreaView`.
  - `components/` & `hooks/`: Lógica y UI local.
  - `api/`: TanStack Query para llamadas remotas.
  - `store/`: Zustand + persist.
  - `schemas/`: Zod schemas (fuente única, compartidos con web).
- `src/shared/`:
  - `ui/`: React Native Paper / NativeWind (componentes táctiles min 44pt).
  - `lib/http/`: Axios + interceptor para rotación 401->refresh.
  - `lib/secure-store/`: `expo-secure-store` (tokens cifrados + autenticación biométrica; **Prohibido AsyncStorage para credenciales**).
  - `notifications/`: Firebase Cloud Messaging (FCM Push: el servidor avisa cuando la app está cerrada, actuando como equivalente a webhooks).
  - `realtime/`: `react-native-sse` / Socket.IO para eventos activos.
  - `offline/`: Motor **Offline-First** basado en `expo-sqlite` + cola de sincronización (permite crear pedidos sin internet y los sincroniza automáticamente al reconectar).
  - `device/`: Integración de hardware nativo Expo (Cámara, Geolocalización).
  - `config/`: Configuración del entorno.

## Convenciones Transversales
1. **TypeScript Estricto**: Cero `any`.
2. **Seguridad Móvil**: Almacenamiento sensible obligatorio en `expo-secure-store`.
3. **Offline-First**: Operaciones locales en SQLite antes de la persistencia remota.
4. **Git**: Conventional Commits + Trunk-Based Development.

---

## Suite de Agentes (.claude/commands/)

### /generate-schema
Crea esquemas Zod en `features/<feature>/schemas/` compatibles con SQLite local y APIs de servidor.

### /scaffold-screen
Genera pantallas en `features/<feature>/screens/` con `SafeAreaView`, títulos de cabecera y parámetros de ruta estrictamente tipados.

### /scaffold-mobile-ui
Crea componentes táctiles (`Pressable`, área de toque mínima 44x44pt) en `shared/ui/` con NativeWind o React Native Paper.

### /generate-expo-service
Crea hooks nativos en `shared/device/` o `shared/lib/secure-store/` administrando permisos de hardware (Cámara, GPS) y cifrado de datos.

### /refactor-rn-perf
Audita listas pesadas para migrar a `@shopify/flash-list`, optimiza la caché de imágenes con `expo-image` y verifica animaciones en el hilo UI con Reanimated.

### /doctor
Ejecuta el diagnóstico integral de la app móvil:
1. Compilación TypeScript estricta sin `any` (`tsc --noEmit`).
2. Verificación de `expo-secure-store` (bloquea el uso de `AsyncStorage` para tokens o passwords).
3. Verificación del motor offline (`expo-sqlite`) y la cola de sincronización.
4. Diagnóstico de permisos nativos (Cámara, Geolocalización) y configuración de Push Notifications (FCM).
5. Evaluación de rendimiento de listas (`FlashList`) e imágenes (`expo-image`).
Devuelve reporte visual con ✅/❌.