const steps = [
  {
    title: '1. Configura variables de entorno',
    description: 'Copia el .env.example del backend y completa tokens de WhatsApp y Google.'
  },
  {
    title: '2. Levanta Postgres y Redis',
    description: 'Usa docker compose para iniciar la infraestructura local.'
  },
  {
    title: '3. Expón el webhook con ngrok',
    description: 'Registra la URL pública en Meta Developers para recibir mensajes.'
  },
  {
    title: '4. Autoriza Google Calendar',
    description: 'Obtén el código OAuth y guárdalo desde el panel o endpoint.'
  }
];

export default function SetupPage() {
  return (
    <main className="min-h-screen bg-white">
      <div className="mx-auto max-w-4xl px-6 py-12">
        <h1 className="text-3xl font-bold text-slate-900">Guía rápida de configuración</h1>
        <p className="mt-2 text-slate-600">
          Sigue estos pasos para poner en marcha AutoAgenda en tu entorno local.
        </p>

        <div className="mt-8 space-y-6">
          {steps.map((step) => (
            <div key={step.title} className="rounded-xl border border-slate-200 bg-slate-50 p-6">
              <h2 className="text-lg font-semibold text-slate-900">{step.title}</h2>
              <p className="mt-2 text-sm text-slate-600">{step.description}</p>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}
