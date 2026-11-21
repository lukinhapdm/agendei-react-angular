import { APPOINTMENT_STATUSES, APPOINTMENT_STATUS_LABEL } from '@agendei/shared';

function App() {
  return (
    <main>
      <h1>Agendei</h1>
      <p>Olá do app web (React + Vite)!</p>
      <ul>
        {APPOINTMENT_STATUSES.map((status) => (
          <li key={status}>{APPOINTMENT_STATUS_LABEL[status]}</li>
        ))}
      </ul>
    </main>
  );
}

export default App;
