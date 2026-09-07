# Contexto y Estándares: Web React + Vite (Feature-Based)

## Arquitectura del Proyecto
Sigue una estructura basada en características (Feature-Based):
- `src/main.tsx`
- `src/app/`: Providers, router (rutas protegidas por rol/permiso).
- `src/features/<feature>/`: (auth, customers, dashboard, orders...)
  - `api/`: Hooks TanStack Query (gestión de caché: dedupe + stale-while-revalidate).
  - `components/` & `hooks/`: UI y lógica local de la característica.
  - `store/`: Zustand para estado global local.
  - `schemas/`: Esquemas Zod (fuente única, compartidos con móvil).
  - `types/`: Enums e interfaces derivadas (`z.infer<>`).
- `src/shared/`:
  - `ui/`: Design System atómico (Button, Table, Inputs) con Tailwind CSS + `cn()`.
  - `lib/http/`: Axios + interceptor para rotación automática de tokens (Access Token en memoria + Refresh Token; cero almacenamiento inseguro).
  - `lib/query/`: QueryClient + estrategia de persistencia.
  - `lib/realtime/`: SSE (`EventSource`) + Socket.IO para recibir eventos en vivo (Sin webhooks en el navegador).
  - `hooks/` & `utils/`: Debounce, mediaQuery, helpers.
  - `config/`: `import.meta.env` (sin secretos). **Regla de oro:** Solo habla con el API Gateway (nunca directo a integraciones como SAP o Bancos).

## Convenciones Transversales
1. **TypeScript Estricto**: Prohibido `any`.
2. **Zod = Fuente Única**: Esquemas en `features/<feature>/schemas` validados con React Hook Form (`@hookform/resolvers/zod`).
3. **Seguridad**: Tokens access en memoria; cero secretos o claves privadas en el bundle cliente.
4. **Git**: Conventional Commits + Trunk-Based Development.

---

## Suite de Agentes (.claude/commands/)

### /generate-schema
Crea o actualiza esquemas Zod en `features/<feature>/schemas/` e infiere los tipos TypeScript.

### /scaffold-ui
Genera componentes reutilizables en `shared/ui/` o `features/<feature>/components/` usando Tailwind CSS y la utilidad `cn()`.

### /generate-form
Crea un formulario completo integrando React Hook Form + resolver de Zod con manejo de estados de carga.

### /generate-hook
Crea Custom Hooks en `features/<feature>/api/` implementando TanStack Query (`useQuery` / `useMutation`) con revalidación en segundo plano.

### /refactor-react-perf
Audita re-renders, uso de `useMemo`/`useCallback`, code-splitting con `React.lazy` y deduplicación de peticiones.

### /doctor
Ejecuta la batería completa de diagnósticos frontend:
1. Compilación TypeScript sin `any` (`tsc --noEmit`).
2. Validación de reglas ESLint y Prettier.
3. Integración correcta de Zod con React Hook Form.
4. Verificación de seguridad (Access tokens en memoria, cero API Keys sensibles en `import.meta.env`).
5. Redirección de tráfico exclusiva hacia el API Gateway.
Devuelve reporte visual con ✅/❌.