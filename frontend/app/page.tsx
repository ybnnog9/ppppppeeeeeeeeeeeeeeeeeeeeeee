import Link from 'next/link';

const features = [
  {
    title: 'Configuración rápida',
    description: 'Define servicios, horarios, mensajes y conecta WhatsApp en minutos.'
  },
  {
    title: 'Agenda automatizada',
    description: 'Reservas por WhatsApp, confirmaciones y recordatorios programados.'
  },
  {
    title: 'Leads y CRM',
    description: 'Centraliza contactos, conversaciones y métricas de conversión.'
  }
];

export default function HomePage() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-white via-slate-50 to-slate-100">
      <section className="mx-auto max-w-6xl px-6 py-16">
        <header className="flex flex-col gap-6">
          <span className="w-fit rounded-full bg-emerald-100 px-4 py-1 text-sm font-semibold text-emerald-700">
            AutoAgenda MVP
          </span>
          <h1 className="text-4xl font-bold text-slate-900 md:text-5xl">
            Automatiza reservas por WhatsApp y gestiona tu agenda desde un solo panel.
          </h1>
          <p className="max-w-2xl text-lg text-slate-600">
            AutoAgenda centraliza leads, citas y recordatorios para negocios con múltiples sedes o
            servicios. Conecta tu número de WhatsApp, configura horarios y empieza a confirmar citas
            automáticamente.
          </p>
          <div className="flex flex-wrap gap-4">
            <Link
              href="/dashboard"
              className="rounded-lg bg-emerald-600 px-6 py-3 text-sm font-semibold text-white shadow hover:bg-emerald-700"
            >
              Entrar al panel
            </Link>
            <Link
              href="/setup"
              className="rounded-lg border border-slate-200 px-6 py-3 text-sm font-semibold text-slate-700 hover:bg-white"
            >
              Ver guía de configuración
            </Link>
          </div>
        </header>
        <div className="mt-12 grid gap-6 md:grid-cols-3">
          {features.map((feature) => (
            <article key={feature.title} className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <h3 className="text-lg font-semibold text-slate-900">{feature.title}</h3>
              <p className="mt-2 text-sm text-slate-600">{feature.description}</p>
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}
