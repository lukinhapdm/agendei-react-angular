import { test as base, type Page, type Route } from '@playwright/test';

const SUPABASE_URL = 'https://e2e.supabase.co';

// Data de calendário em Brasília daqui a N dias (yyyy-MM-dd)
export function dateInDays(days: number): string {
  const date = new Date(Date.now() + days * 86_400_000);
  return date.toLocaleDateString('en-CA', { timeZone: 'America/Sao_Paulo' });
}
const USER_ID = 'user-cliente';
const CORS = { 'access-control-allow-origin': '*', 'access-control-allow-headers': '*' };

type Status = 'pending' | 'confirmed' | 'cancelled' | 'completed';

interface Appointment {
  id: string;
  service_id: string;
  customer_id: string;
  starts_at: string;
  status: Status;
  notes: string | null;
}

// Banco em memória que responde como o PostgREST/GoTrue para as rotas usadas pelo web
export class SupabaseMock {
  readonly business = {
    id: 'biz-1',
    name: 'Barbearia Demo',
    slug: 'barbearia-demo',
    timezone: 'America/Sao_Paulo',
  };
  readonly services = [
    { id: 'svc-barba', name: 'Barba', duration_min: 20, price_cents: 3000 },
    { id: 'svc-corte', name: 'Corte de cabelo', duration_min: 30, price_cents: 4500 },
  ];
  readonly workingHours = [1, 2, 3, 4, 5, 6].map((weekday) => ({
    weekday,
    start_time: '09:00:00',
    end_time: '12:00:00',
  }));
  profile: { full_name: string | null; phone: string | null } = { full_name: null, phone: null };
  appointments: Appointment[] = [];
  magicLinks: string[] = [];

  private readonly page: Page;

  constructor(page: Page) {
    this.page = page;
  }

  // page.clock não é usado: o Date falso dele quebra subclasses como o TZDate do date-fns
  async install() {
    await this.page.route(`${SUPABASE_URL}/**`, (route) => this.handle(route));
  }

  // Equivale a abrir o link mágico: grava a sessão que o supabase-js procura no storage
  async login() {
    const expiresAt = Math.floor(Date.now() / 1000) + 3600;
    const session = {
      access_token: 'e2e.access.token',
      refresh_token: 'e2e-refresh',
      token_type: 'bearer',
      expires_in: 3600,
      expires_at: expiresAt,
      user: {
        id: USER_ID,
        email: 'cliente@agendei.dev',
        aud: 'authenticated',
        role: 'authenticated',
        app_metadata: {},
        user_metadata: {},
        created_at: new Date().toISOString(),
      },
    };
    await this.page.addInitScript((value) => {
      localStorage.setItem('sb-e2e-auth-token', value);
    }, JSON.stringify(session));
  }

  addAppointment(startsAt: string, status: Status = 'pending', customerId = USER_ID) {
    const appointment = {
      id: `apt-${this.appointments.length + 1}`,
      service_id: 'svc-corte',
      customer_id: customerId,
      starts_at: new Date(startsAt).toISOString(),
      status,
      notes: null,
    };
    this.appointments.push(appointment);
    return appointment;
  }

  private isTaken(startsAt: string) {
    return this.appointments.some(
      (a) => a.starts_at === startsAt && (a.status === 'pending' || a.status === 'confirmed'),
    );
  }

  private slotsFor(date: string) {
    const weekday = new Date(`${date}T12:00:00Z`).getUTCDay();
    if (!this.workingHours.some((h) => h.weekday === weekday)) return [];
    return (
      ['09:00', '09:30', '10:00', '10:30', '11:00', '11:30']
        .map((time) => new Date(`${date}T${time}:00-03:00`).toISOString())
        // Como a RPC real: nada no passado nem já ocupado
        .filter((start) => new Date(start).getTime() > Date.now() && !this.isTaken(start))
        .map((start) => ({
          slot_start: start,
          slot_end: new Date(new Date(start).getTime() + 30 * 60_000).toISOString(),
        }))
    );
  }

  private async handle(route: Route) {
    const request = route.request();
    const url = new URL(request.url());
    const method = request.method();
    const json = (body: unknown, status = 200) =>
      route.fulfill({
        status,
        headers: CORS,
        contentType: 'application/json',
        body: JSON.stringify(body),
      });

    if (method === 'OPTIONS') return route.fulfill({ status: 204, headers: CORS });

    switch (url.pathname) {
      case '/auth/v1/otp':
        this.magicLinks.push(url.searchParams.get('redirect_to') ?? '');
        return json({});
      case '/auth/v1/logout':
        return route.fulfill({ status: 204, headers: CORS });

      case '/rest/v1/businesses': {
        const found = url.searchParams.get('slug') === `eq.${this.business.slug}`;
        const row = { ...this.business, services: this.services, working_hours: this.workingHours };
        return json(found ? [row] : []);
      }

      case '/rest/v1/rpc/get_available_slots':
        return json(this.slotsFor(request.postDataJSON().p_date));

      case '/rest/v1/rpc/book_appointment': {
        const body = request.postDataJSON();
        const startsAt = new Date(body.p_starts_at).toISOString();
        if (this.isTaken(startsAt)) {
          return json(
            { code: 'P0001', message: 'slot_unavailable', details: null, hint: null },
            400,
          );
        }
        const appointment = this.addAppointment(startsAt);
        appointment.notes = body.p_notes ?? null;
        return json(appointment);
      }

      case '/rest/v1/profiles':
        if (method === 'PATCH') {
          this.profile = { ...this.profile, ...request.postDataJSON() };
          return route.fulfill({ status: 204, headers: CORS });
        }
        return json(this.profile);

      case '/rest/v1/appointments': {
        if (method === 'PATCH') {
          const id = url.searchParams.get('id')?.replace('eq.', '');
          const target = this.appointments.find((a) => a.id === id && a.customer_id === USER_ID);
          if (!target) return json([]);
          target.status = request.postDataJSON().status;
          return json([{ id: target.id }]);
        }
        const business = {
          name: this.business.name,
          slug: this.business.slug,
          timezone: this.business.timezone,
        };
        const rows = this.appointments
          .filter((a) => a.customer_id === USER_ID)
          .sort((a, b) => a.starts_at.localeCompare(b.starts_at))
          .map((a) => {
            const service = this.services.find((s) => s.id === a.service_id);
            return { ...a, service, business };
          });
        return json(rows);
      }
    }

    return json({ message: `Rota não simulada: ${method} ${url.pathname}` }, 501);
  }
}

export const test = base.extend<{ supabase: SupabaseMock }>({
  // "provide" em vez de "use" para o lint de hooks do React não confundir com o hook use()
  // auto: todo teste fica isolado da rede, mesmo sem pedir a fixture
  supabase: [
    async ({ page }, provide) => {
      const mock = new SupabaseMock(page);
      await mock.install();
      await provide(mock);
    },
    { auto: true },
  ],
});

export { expect } from '@playwright/test';
