const cards = [
  { label: 'Citas confirmadas', value: '24' },
  { label: 'Leads nuevos', value: '17' },
  { label: 'Conversiones', value: '68%' }
];

export default function DashboardPage() {
  return (
    <main className="min-h-screen bg-slate-50">
      <div className="mx-auto max-w-6xl px-6 py-12">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">Panel AutoAgenda</h1>
            <p className="text-slate-600">Resumen semanal de citas y leads.</p>
          </div>
          <button className="rounded-lg bg-emerald-600 px-5 py-2 text-sm font-semibold text-white">
            Exportar CSV
          </button>
        </div>

        <div className="mt-8 grid gap-4 md:grid-cols-3">
          {cards.map((card) => (
            <div key={card.label} className="rounded-2xl border border-slate-200 bg-white p-6">
              <p className="text-sm text-slate-500">{card.label}</p>
              <p className="mt-2 text-3xl font-semibold text-slate-900">{card.value}</p>
            </div>
          ))}
        </div>

        <section className="mt-10 grid gap-6 lg:grid-cols-2">
          <article className="rounded-2xl border border-slate-200 bg-white p-6">
            <h2 className="text-lg font-semibold text-slate-900">Configuración rápida</h2>
            <ul className="mt-4 space-y-3 text-sm text-slate-600">
              <li>✅ Conecta WhatsApp Cloud API y verifica el webhook.</li>
              <li>✅ Crea servicios y duración.</li>
              <li>⏳ Autoriza Google Calendar o Calendly.</li>
            </ul>
          </article>
          <article className="rounded-2xl border border-slate-200 bg-white p-6">
            <h2 className="text-lg font-semibold text-slate-900">Próximas citas</h2>
            <div className="mt-4 space-y-4 text-sm text-slate-600">
              <div className="flex items-center justify-between rounded-lg bg-slate-50 p-4">
                <div>
                  <p className="font-semibold text-slate-900">Consulta inicial</p>
                  <p>20 Ago · 10:00</p>
                </div>
                <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-700">
                  Confirmada
                </span>
              </div>
              <div className="flex items-center justify-between rounded-lg bg-slate-50 p-4">
                <div>
                  <p className="font-semibold text-slate-900">Seguimiento</p>
                  <p>20 Ago · 12:00</p>
                </div>
                <span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold text-amber-700">
                  Pendiente
                </span>
              </div>
            </div>
          </article>
        </section>
      </div>
    </main>
  );
}
