# evenado-ecommerce

Mockups interactivos del eCommerce de Grupo Venado (capa de presentación sobre el microservicio de
Sales de DEAL). Vite + React 19 + TypeScript + Tailwind CSS v4 + componentes de
[`shadcn-ui-kit`](https://github.com/oliviosubelza/shadcn-ui-kit) (Radix primitives, copiados a mano).

**Ver [`CLAUDE.md`](./CLAUDE.md)** para el contexto completo: stack, convenciones del kit, theming,
modelo de datos (catálogo real de 375 productos), mapa de pantallas, alcance de la V1 en curso y
estado actual de construcción. Este README solo cubre cómo correrlo.

## Desarrollo

```bash
npm run dev      # localhost:5173 (o el siguiente puerto libre)
npm run build    # tsc -b && vite build
npm run lint      # oxlint
```
