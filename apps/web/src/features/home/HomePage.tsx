import { Link } from 'react-router';

export function HomePage() {
  return (
    <section className="py-12 text-center">
      <h1 className="text-3xl font-bold sm:text-4xl">Agende em poucos cliques</h1>
      <p className="mx-auto mt-4 max-w-xl text-slate-600 dark:text-slate-300">
        Escolha o serviço, veja os horários livres e confirme na hora.
      </p>
      <Link
        to="/b/barbearia-demo"
        className="mt-8 inline-block rounded-lg bg-brand-600 px-5 py-3 font-medium text-white hover:bg-brand-700"
      >
        Ver negócio de exemplo
      </Link>
    </section>
  );
}
