import { useParams } from 'react-router';

export function BusinessPage() {
  const { slug } = useParams<{ slug: string }>();

  return (
    <section>
      <h1 className="text-2xl font-bold">Negócio: {slug}</h1>
      <p className="mt-2 text-slate-600 dark:text-slate-300">Serviços e horários chegam na 4.3.</p>
    </section>
  );
}
