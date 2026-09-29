# CuidApp

App móvil para personas cuidadoras de personas dependientes. Ayuda a organizar
medicamentos, inventario, rutinas e información útil y, sobre todo, **incentiva que
quien cuida tenga tiempo libre**. El bienestar de la cuidadora es parte central del producto.

## Stack

- Expo SDK 57 + React Native + TypeScript (estricto)
- Expo Router (tabs + stacks + rutas protegidas)
- Supabase (Auth, PostgreSQL, Row Level Security)
- react-hook-form + zod (mensajes en español)
- @tanstack/react-query
- expo-notifications (recordatorios locales de medicamentos)
- react-native-calendars
- @expo/vector-icons

## Requisitos

- Node.js 20 o superior
- Un proyecto en [Supabase](https://supabase.com) (el plan gratis basta)
- Expo Go en tu teléfono, o un emulador Android / simulador iOS

## Instalación

```bash
npm install
```

### 1. Base de datos

1. En Supabase, abre **SQL Editor → New query**.
2. Pega el contenido completo de `supabase/schema.sql` y ejecútalo.
   Crea los enums, las tablas, los índices, los triggers y las políticas RLS.
   Puedes volver a ejecutarlo sin problemas (es idempotente).
3. En **Authentication → Providers**, deja activado _Email_. Si no quieres confirmar
   el correo mientras desarrollas, desactiva _Confirm email_.

### 2. Variables de entorno

Copia el ejemplo y completa con los datos de **Project Settings → API**:

```bash
cp .env.example .env
```

```env
EXPO_PUBLIC_SUPABASE_URL=https://TU-PROYECTO.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=tu-anon-key
```

`.env` está en `.gitignore`. Usa solo la _anon key_ (nunca la _service role key_).

### 3. Correr la app

```bash
npx expo start
```

Escanea el QR con Expo Go o presiona `a` (Android) o `i` (iOS).

Otros comandos:

```bash
npx tsc --noEmit   # chequeo de tipos
npx expo lint      # lint
```

> **Notificaciones:** los recordatorios locales funcionan en Expo Go. Para probarlos de
> forma confiable (sobre todo en Android), usa una _development build_
> (`npx expo run:android` o `eas build --profile development`).

## Estructura

```
supabase/
  schema.sql               # tablas, enums, índices, triggers y políticas RLS
src/
  app/                     # rutas (Expo Router)
    _layout.tsx            # providers + rutas protegidas (auth / onboarding / app)
    (auth)/                # login, register
    onboarding.tsx         # creación del perfil de la cuidadora
    sin-conexion.tsx       # si no se pudo cargar el perfil
    (tabs)/                # Inicio, Cuidado, Inventario, Recreación, Más
      index.tsx
      cuidado/             # lista + detalle [id] con pestañas
      inventario.tsx
      recreacion.tsx
      mas/                 # registros, informaciones, perfil, configuración
    form/                  # modales de crear/editar (persona, medicamento, …)
  components/
    ui/                    # Button, Card, Input, TextArea, Select, DatePicker,
                           # TimePicker, Badge, EmptyState, Header, FAB, Screen,
                           # Skeleton, ErrorState, Chip, SegmentedTabs
    form/                  # conectores react-hook-form ↔ UI y FormScreen
  config/app.ts            # nombre de la app y constantes
  features/<módulo>/       # components, hooks, services, schema, constants
    auth · profile · care · medications · inventory · records · info · recreation · settings
  lib/                     # supabase, react-query, fechas, validación, linking
  theme/                   # colores (claro/oscuro), tipografía, espaciados, radios, sombras
  types/database.ts        # tipos de cada tabla
```

Regla de capas: **services** hablan con Supabase, **hooks** envuelven los services con
React Query y la **UI** solo consume hooks.

## Decisiones importantes

- **Seguridad y RLS:** cada tabla tiene RLS. `usuarios.auth_user_id` se vincula con
  `auth.users`, y la función `current_usuario_id()` resuelve el dueño en las políticas.
  Los `usuario_id` se completan solos en la base de datos (valor por defecto), así que la
  app nunca los envía. Los medicamentos se protegen a través de su persona cuidada.
- **Datos sensibles:** la app no escribe datos de salud en la consola. Los errores de
  Supabase se traducen a mensajes genéricos (`toFriendlyError`).
- **Historial automático:**
  - Marcar una toma como dada crea un registro `medicamento_administrado`, con
    `medicamento_id` y `hora_programada`, para saber qué tomas del día ya se dieron.
  - Crear un ítem o cambiar su cantidad genera un registro `cambio_inventario` mediante
    un trigger en la base de datos.
  - Los botones + y − usan la función `ajustar_inventario` (atómica) y actualizan la
    pantalla al instante, antes de que responda el servidor.
  - Un medicamento puede vincularse a un ítem del inventario con sus unidades por toma. Al
    marcar la toma como dada, un trigger (`descontar_toma_inventario`) resta esas unidades y la
    app avisa si el stock llegó a su umbral. En proyectos creados antes de este cambio, ejecuta
    `supabase/migrations/002_descuento_inventario.sql`.
- **Pausar y eliminar cuenta** (Configuración → Cuenta):
  - Pausar guarda la fecha en `usuarios.pausada_en`: se cancelan los recordatorios y la app
    muestra una pantalla para reactivarla. Los datos no se tocan.
  - Eliminar llama a la función `eliminar_mi_cuenta()`, que borra el usuario de `auth.users`
    y, en cascada, todos sus datos. Solo puede borrar la cuenta de quien la llama.
  - En proyectos creados antes de este cambio, ejecuta `supabase/migrations/003_pausar_eliminar_cuenta.sql`.
- **Gastos** (tabla `gastos`): registro de compras en dos categorías, Medicamentos y Otros,
  con precio en pesos, unidades, lugar o farmacia y fecha. Muestra el total del mes y, para
  productos comprados en 2 o más lugares, dónde salió más barato por unidad. En proyectos
  creados antes de este cambio, ejecuta `supabase/migrations/004_gastos.sql`.
- **Compras → inventario → tomas:** al registrar una compra en Gastos se elige si sus unidades
  se suman a un ítem existente, crean uno nuevo (función `crear_gasto_con_item`, todo o nada) o
  no se suman. El trigger `sincronizar_compra_inventario` suma al crear, ajusta la diferencia al
  editar y resta al eliminar. Si la compra se inició desde un medicamento sin stock vinculado,
  se vincula para que cada toma dada descuente de ese ítem. En proyectos creados antes de este
  cambio, ejecuta `supabase/migrations/005_compras_suman_inventario.sql`.
- **Recordatorios:** cada hora de toma programa una notificación diaria con el id
  `med-<id>-<HHMM>`. Al abrir la app se resincronizan con la base de datos, por ejemplo
  si cambias de teléfono. Se pueden desactivar en Configuración.
- **Stock bajo:** cada ítem tiene su propio `umbral_bajo`. En Configuración se define el
  valor que se sugiere al crear ítems nuevos.
- **Balance semanal:** las horas se calculan por solapamiento con la semana actual (de
  lunes a domingo). El día libre, la actividad social y el autocuidado cuentan como
  tiempo libre; el turno de cuidado cuenta como tiempo de cuidado. Los mensajes
  acompañan y nunca culpan (`features/recreation/messages.ts`).
- **Accesibilidad:**
  - Texto base de 16 px y áreas táctiles de 48 px o más.
  - Etiquetas `accessibilityLabel` en todos los controles.
  - Respeta el tamaño de fuente del sistema (con un tope de 1,8x).
  - `textMuted` se oscureció a `#6B6384` para cumplir contraste AA.
- **Responsive:**
  - `Screen` centra el contenido con un ancho máximo en tablets.
  - Inventario e Informaciones pasan a 2 columnas desde 700 px de ancho.
  - Los formularios se ajustan al ancho de teléfonos pequeños.
- **Modo oscuro:** automático según el sistema, o fijado en Configuración.

## Preparado para la app de la persona cuidada

`personas_cuidadas.cuenta_auth_id` (hoy `null`) permitirá vincular una cuenta propia a
la persona cuidada. Cuando se construya esa app, basta con agregar políticas `select`
que comparen `cuenta_auth_id = auth.uid()` en `personas_cuidadas`, `medicamentos` y
`registros`.

## Fuera de alcance por ahora

- App para la persona cuidada
- Pagos y suscripciones
