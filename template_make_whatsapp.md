# Template de Make: recepcionista IA por WhatsApp + gestión de citas

## Objetivo del flujo
Automatizar la atención inicial por WhatsApp con un recepcionista IA que:
- Responde preguntas frecuentes y detecta intención (agendar, reprogramar, cancelar).
- Valida disponibilidad.
- Crea/actualiza/elimina eventos en Google Calendar.
- Envía confirmaciones y recordatorios por WhatsApp.

## Alcance del negocio (servicios típicos)
- Atención al cliente 24/7.
- Agenda automática para consultorios, salones, talleres, coaching, etc.
- Sincronización con Google Calendar (o Outlook si aplica).
- Panel de trazabilidad y métricas (opcional).

## Requisitos previos
- Cuenta de WhatsApp Business API (proveedor: 360dialog, Twilio o Meta Cloud API).
- Cuenta de Make (Make.com).
- Google Calendar con permisos de edición.
- Cuenta de OpenAI o proveedor LLM para el recepcionista IA.

## Variables y parámetros
- `BUSINESS_NAME` (string)
- `BUSINESS_TIMEZONE` (string, ej. `America/Mexico_City`)
- `CALENDAR_ID` (string)
- `MIN_APPOINTMENT_DURATION_MIN` (number, ej. 30)
- `WORKING_HOURS` (objeto con rangos por día)
- `POLICY_CANCELLATION_HOURS` (number, ej. 4)

## Estructura del escenario en Make (alto nivel)

### 1) Trigger: Nuevo mensaje de WhatsApp
**Módulo**: Webhook (Custom webhook)
- Recibe: `from`, `message`, `timestamp`, `message_id`.

### 2) Enriquecimiento + Contexto
**Módulos**:
- Data Store (Make) → Recupera contexto del cliente.
- Tools/Router → Define ruta: FAQ / Agendar / Reprogramar / Cancelar / Humano.

### 3) LLM: Recepcionista IA
**Módulo**: OpenAI (Chat Completion)
**Prompt base (resumen)**:
- Rol: recepcionista cordial.
- Objetivo: identificar intención y recolectar datos mínimos (nombre, servicio, fecha/hora preferida).
- Validar políticas (horario laboral, anticipación).
- Salida en JSON con campos:
  - `intent`: `schedule | reschedule | cancel | faq | handoff`
  - `client_name`
  - `service`
  - `datetime_preference`
  - `notes`

### 4) Router por intención
**Módulo**: Router

#### A) Agendar
**Módulos**:
- Google Calendar → Search Events (rango sugerido)
- Tools → Verificar disponibilidad
- Google Calendar → Create an Event
- WhatsApp → Send message (confirmación)

#### B) Reprogramar
**Módulos**:
- Google Calendar → Search Events (por cliente / número)
- Google Calendar → Update an Event
- WhatsApp → Send message (confirmación)

#### C) Cancelar
**Módulos**:
- Google Calendar → Search Events
- Google Calendar → Delete an Event
- WhatsApp → Send message (cancelación confirmada)

#### D) FAQ / Handoff
**Módulos**:
- Base de conocimiento (Data Store / Notion / Sheets)
- WhatsApp → Send message
- (Opcional) Crear ticket para humano

### 5) Recordatorios automáticos
**Módulo**: Scheduler (Make)
- Corre cada hora/día.
- Google Calendar → Search Events próximos
- WhatsApp → Send message (recordatorio)

## JSON de salida del LLM (ejemplo)
```json
{
  "intent": "schedule",
  "client_name": "María López",
  "service": "Consulta inicial",
  "datetime_preference": "2025-02-10 16:00",
  "notes": "Prefiere tardes"
}
```

## Mensajes de WhatsApp (plantillas)

### Confirmación de cita
"¡Listo, {client_name}! Tu cita para {service} quedó agendada el {date} a las {time}. Si necesitas cambiarla o cancelarla, responde a este mensaje."

### Reprogramación
"Perfecto, {client_name}. Tu cita se reprogramó para el {date} a las {time}."

### Cancelación
"Tu cita fue cancelada. Si deseas re-agendar, dime una fecha y horario." 

### Recordatorio
"Hola {client_name}, te recordamos tu cita de {service} el {date} a las {time}. Responde si necesitas reprogramar."

## Manejo de errores (mínimos)
- Si no hay disponibilidad → ofrecer 3 horarios alternativos.
- Si faltan datos → solicitar nombre/fecha/servicio.
- Si fuera de horario → agendar para siguiente día hábil.

## KPIs sugeridos
- % de citas agendadas automáticamente.
- Tiempo medio de respuesta.
- Tasa de cancelación.
- Conversión de conversación a cita.

## Entregables del proyecto
- Escenario Make documentado (diagrama + módulos).
- Prompts y plantillas de mensajes.
- Conexión activa a WhatsApp Business API.
- Integración con Google Calendar.

## Estimación (estructura de propuesta)
- Implementación inicial: 1–2 semanas.
- Mantenimiento mensual (opcional): monitoreo, mejoras, métricas.

---

Si quieres, puedo adaptar el template a tu industria (salud, belleza, consultoría, legal, etc.) o al proveedor de WhatsApp que uses.
