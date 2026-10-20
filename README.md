# PideProgreso

Plataforma de pedidos para negocios locales de Nuevo Progreso, Tamaulipas.
_Hecho para la gente de Nuevo Progreso, Tamps._

## Tecnología

- Next.js 16 (App Router) + TypeScript
- Tailwind CSS 4 (identidad vino y dorado, móvil primero)
- Supabase (base de datos, autenticación y RLS)

## Empezar

```bash
npm install
cp .env.example .env.local   # llena los datos de Supabase
npm run dev
```

La app funciona sin Supabase configurado; las partes que usan datos lo requieren.

## Estructura

- `src/app/` páginas
- `src/components/` componentes de interfaz
- `src/lib/supabase/` clientes de Supabase (navegador y servidor)
- `src/proxy.ts` renueva la sesión en cada petición
- `supabase/migrations/` esquema de la base de datos
- `supabase/seed.sql` categorías iniciales

## Base de datos

Tablas: `perfiles`, `categorias`, `negocios`, `productos`, `pedidos`,
`pedido_detalle` y `pedido_historial`. Todas tienen RLS.

Roles (`perfiles.rol`): `cliente`, `negocio`, `admin`.

- Cualquiera ve categorías, negocios aprobados y sus productos disponibles.
- Un usuario registra su negocio; nace `pendiente` y un admin lo aprueba.
  Al aprobarse, el propietario pasa a rol `negocio`.
- El dueño administra su negocio y su catálogo; no puede aprobarse a sí mismo.
- Los pedidos se crean con `crear_pedido(...)`, que calcula precios y totales en
  la base de datos, y cambian de estado con `cambiar_estado_pedido(...)`.
  Cada cambio queda en `pedido_historial`.
- Solo un admin cambia roles o el estado de un negocio.

Para aplicar el esquema con la CLI de Supabase:

```bash
npx supabase link --project-ref <ref-de-pideprogreso-app>
npx supabase db push
```

Para el primer admin, en el editor SQL de Supabase:

```sql
update public.perfiles set rol = 'admin' where id = '<uuid-del-usuario>';
```
