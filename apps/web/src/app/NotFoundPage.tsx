import { Link } from 'react-router';

export function NotFoundPage() {
  return (
    <section className="py-16 text-center">
      <p className="text-sm font-semibold text-brand-600">404</p>
      <h1 className="mt-2 text-2xl font-bold">Página não encontrada</h1>
      <Link to="/" className="mt-6 inline-block text-brand-600 hover:underline">
        Voltar para o início
      </Link>
    </section>
  );
}
