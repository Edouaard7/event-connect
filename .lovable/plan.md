

# Frontend para API REST - Sistema de Gestión

## Configuración Base
- Instalar **Bootstrap 5** y **sin usar react** como dependencias del proyecto
- Crear un servicio API centralizado que use `fetch` con `credentials: 'include'` para enviar cookies de sesión automáticamente
- La URL base del API será configurable (inicialmente `http://localhost:8000`)
- Contexto global de autenticación que almacene el usuario actual y su rol, consultando `GET /api/me` al cargar la app

## Navegación (Navbar Bootstrap)
- Navbar responsive con Bootstrap: **Home | Eventos | Equipos | Reservas | Reportes | Usuarios | Perfil**
- Mostrar nombre del usuario logueado y botón de **Logout** cuando hay sesión
- Mostrar **Login / Registro** cuando no hay sesión
- Los enlaces de **Reportes** y **Usuarios** solo se muestran para Admin/Gerente (roles 1 y 2)

## 1. Autenticación
- **Página Login**: formulario Bootstrap con email y password, validación client-side
- **Página Registro**: formulario con username, email, password, display_name; validaciones (min 3 chars username, email válido, min 6 chars password)
- **Perfil** (`/perfil`): muestra datos del usuario autenticado desde `GET /api/me`
- Alertas Bootstrap para errores (credenciales inválidas, email ya registrado, etc.) y éxitos

## 2. Home - Eventos Próximos
- Al cargar la página principal, consumir `GET /api/events`
- Filtrar eventos cuya fecha de inicio esté dentro de las próximas 24 horas o que estén en curso
- Tabla Bootstrap con columnas: ID, Título, Tipo, Fecha inicio, Fecha fin, Ubicación
- Mensaje "No hay eventos próximos" si la lista está vacía

## 3. Eventos (`/eventos`)
- **Lista**: tabla Bootstrap con todos los eventos (ID, título, fecha inicio/fin, tipo)
- **Botón "Inscribirse"** en cada evento (si `allow_registration` es true), llama `POST /api/events/{id}/join`
- **Ver participantes**: modal o vista detalle con `GET /api/events/{id}/participants`
- **Crear evento**: formulario (solo visible para Admin/Gerente) con campos: título, descripción, fecha inicio/fin, ubicación, tipo (info/offer/tournament), capacidad, permitir registro, imagen
- Alertas para errores (ya inscrito, evento lleno, etc.)

## 4. Equipos (`/equipos`)
- **Tabla inventario**: ID, nombre, SKU, estado, notas desde `GET /api/equipment`
- **Ver detalle**: modal con información completa del equipo
- **Crear equipo**: formulario (solo Admin) con nombre, SKU, estado, notas
- **Editar equipo**: formulario en modal (Admin/Gerente) para actualizar campos
- **Eliminar equipo**: modal de confirmación Bootstrap (solo Admin)
- Badge de colores según estado (available=verde, in_use=azul, maintenance=amarillo, retired=gris)

## 5. Usuarios (`/usuarios`) - Solo Admin/Gerente
- **Tabla de usuarios**: listado desde `GET /api/users`
- **Ver detalle**: información del usuario seleccionado
- **Crear usuario**: formulario (solo Admin) con username, email, password, display_name, role_id, is_active
- **Editar usuario**: modal con campos editables según permisos (Admin puede cambiar rol y estado activo)
- **Eliminar usuario**: modal de confirmación (solo Admin)

## 6. Reservas (`/reservas`)
- **Crear reserva**: formulario con fecha inicio, fecha fin, y selector de equipo (desde `GET /api/equipment`)
- **Lista de reservas**: tabla con reservas propias; Admin/Gerente pueden ver todas con `?all=1`
- **Acciones por reserva**:
  - Botón **Confirmar** (Admin/Gerente): `POST /api/reservations/{id}/confirm`
  - Botón **Extender** (propietario): modal para ingresar nueva fecha fin
  - Botón **Completar** (Admin/Gerente): `POST /api/reservations/{id}/complete`
- Modales de confirmación para cada acción
- Badge de estado (pending=amarillo, confirmed=azul, active=verde, completed=gris, cancelled=rojo)

## 7. Reportes (`/reportes`) - Solo Admin/Gerente
- Tres secciones: Eventos, Equipos, Reservas
- Filtros por fecha (inicio/fin) y por estado según el tipo de reporte
- Botón para descargar/ver PDF que abre el endpoint en nueva pestaña
- Fallback: si el backend devuelve HTML, mostrarlo inline en un iframe o contenedor

## Experiencia de Usuario
- Alertas Bootstrap (success/danger/warning) para todas las respuestas del API
- Spinners de carga mientras se esperan respuestas
- Modales de confirmación antes de acciones destructivas (eliminar)
- Redirección automática a Login si una petición devuelve 401
- Diseño responsive con Bootstrap grid system

