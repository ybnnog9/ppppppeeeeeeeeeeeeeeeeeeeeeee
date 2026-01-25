# Panel de Ventas B2B

Panel de seguimiento comercial pensado para pequeñas y medianas empresas. Permite registrar leads, actualizar su estado y centralizar notas del equipo.

## Funcionalidades
- Alta, edición y eliminación de leads.
- Panel con conteo por estado.
- Notas comerciales y estado del proceso.

## Requisitos
- Python 3.10+

## Instalación
```bash
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
```

## Uso
```bash
python app.py
```
El panel estará disponible en `http://localhost:5000`.

## Próximos pasos sugeridos para venderlo
- Autenticación multi-usuario.
- Exportación de datos en CSV.
- Integraciones con correo o CRM.
- Hosting en la nube con dominio propio.
