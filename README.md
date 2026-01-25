# AutoAgenda

AutoAgenda es un MVP para automatizar reservas por WhatsApp, gestionar agenda, recordatorios y leads de múltiples negocios (multi-tenant). Este repositorio contiene backend + frontend, más la infraestructura local con Docker Compose.

## Stack elegido
- **Backend:** Node.js + TypeScript + Express con arquitectura por controllers/services/repositories. Prisma para PostgreSQL y BullMQ sobre Redis para recordatorios.
- **Frontend:** Next.js + TypeScript + Tailwind CSS para un panel sencillo.

> Se eligió Express por la rapidez de implementación en un MVP y por su flexibilidad para integrar webhooks y servicios externos.

## Requisitos previos
- Node.js 18+
- Docker y Docker Compose
- Cuenta en Meta Developers con WhatsApp Cloud API
- Proyecto de Google Cloud con OAuth 2.0 habilitado

## Configuración rápida
1. Copia el archivo `.env.example` como `.env` en la raíz y completa las variables.
2. Levanta PostgreSQL y Redis:
   ```bash
   docker compose up -d
   ```
3. Instala dependencias:
   ```bash
   cd backend && npm install
   cd ../frontend && npm install
   ```
4. Aplica migraciones y seed:
   ```bash
   cd backend
   npm run prisma:generate
   npm run migrate
   npm run seed
   ```
5. Inicia el backend y el frontend en terminales separadas:
   ```bash
   cd backend && npm run dev
   cd frontend && npm run dev
   ```

## WhatsApp Cloud API (webhook)
- Verificación GET: apunta el webhook a `https://TU_DOMINIO/api/webhooks/whatsapp` y usa `WHATSAPP_VERIFY_TOKEN`.
- Mensajes POST: el backend valida la firma `x-hub-signature-256` si `WHATSAPP_APP_SECRET` está configurado.

Ejemplo de payload para pruebas locales:
```bash
curl -X POST http://localhost:4000/api/webhooks/whatsapp \
  -H "Content-Type: application/json" \
  -d '{
    "entry": [{
      "changes": [{
        "value": {
          "metadata": { "phone_number_id": "WHATSAPP_NUMBER_ID" },
          "messages": [{
            "from": "5215555555555",
            "id": "wamid.123",
            "timestamp": "1710000000",
            "type": "text",
            "text": { "body": "Hola" }
          }]
        }
      }]
    }]
  }'
```

## Google Calendar OAuth
1. Crea credenciales OAuth en Google Cloud y define `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET` y `GOOGLE_REDIRECT_URI`.
2. Obtén la URL de autorización:
   ```bash
   curl -H "Authorization: Bearer <JWT>" http://localhost:4000/api/tenants/google/auth-url
   ```
3. Intercambia el `code`:
   ```bash
   curl -X POST http://localhost:4000/api/tenants/google/exchange \
     -H "Authorization: Bearer <JWT>" \
     -H "Content-Type: application/json" \
     -d '{"code":"<OAUTH_CODE>"}'
   ```

## Flujo de conversación (WhatsApp)
- Menú inicial con opciones (reservar, servicios, ubicación, agente).
- Reserva: servicio → fecha → preferencia → nombre → propuesta de horarios → confirmación.
- Reprogramación: comandos `CAMBIAR` / `REPROGRAMAR`.
- Cancelación: `CANCELAR`.
- Opt-out: `BAJA` o `STOP`.

## Panel web (Next.js)
Disponible en `http://localhost:3000`. Incluye:
- Resumen de citas y leads.
- Guía de configuración rápida.

## Endpoints principales
- `POST /api/auth/register`
- `POST /api/auth/login`
- `GET /api/tenants/me`
- `PUT /api/tenants/me`
- `GET /api/tenants/services`
- `POST /api/tenants/services`
- `GET /api/appointments`
- `GET /api/appointments/export/csv`

## Tests
```bash
cd backend
npm test
```

## Notas de cumplimiento WhatsApp
- Respeta ventana de 24h. El backend contempla templates guardadas por empresa para mensajes fuera de ventana.
- No se envían mensajes masivos. Solo transaccionales o iniciados por usuario.
- Opt-out soportado con comandos `BAJA` y `STOP`.

## Scripts útiles
- `npm run dev` (backend)
- `npm run lint` (backend)
- `npm run migrate` (backend)
- `npm run seed` (backend)
- `npm run dev` (frontend)

---

## Estructura del repositorio
```
backend/
frontend/
```
