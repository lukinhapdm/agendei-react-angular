import { TestBed } from '@angular/core/testing';
import { SupabaseService } from '../supabase/supabase.service';
import { AppointmentsRealtime, type AppointmentChange } from './appointments-realtime.service';

// Cliente Supabase falso: a DI permite trocar a dependência real no teste
function createFakeSupabase() {
  let handler: (change: AppointmentChange) => void = () => undefined;
  const channel = {
    on: vi.fn((_type: string, _filter: unknown, cb: typeof handler) => {
      handler = cb;
      return channel;
    }),
    subscribe: vi.fn(() => channel),
  };
  const client = { channel: vi.fn(() => channel), removeChannel: vi.fn() };
  return { client, channel, emit: (change: AppointmentChange) => handler(change) };
}

describe('AppointmentsRealtime', () => {
  let fake: ReturnType<typeof createFakeSupabase>;
  let service: AppointmentsRealtime;

  beforeEach(() => {
    fake = createFakeSupabase();
    TestBed.configureTestingModule({
      providers: [{ provide: SupabaseService, useValue: { client: fake.client } }],
    });
    service = TestBed.inject(AppointmentsRealtime);
  });

  it('subscribes once, filtering by business', () => {
    service.start('b1');
    service.start('b1');
    expect(fake.client.channel).toHaveBeenCalledTimes(1);
    expect(fake.channel.on.mock.calls[0][1]).toMatchObject({ filter: 'business_id=eq.b1' });
  });

  it('exposes the latest change as a signal', () => {
    service.start('b1');
    const change = { eventType: 'INSERT', new: { id: 'a1' } } as unknown as AppointmentChange;
    fake.emit(change);
    expect(service.lastChange()).toBe(change);
  });

  it('removes the channel on stop', () => {
    service.start('b1');
    service.stop();
    expect(fake.client.removeChannel).toHaveBeenCalledWith(fake.channel);
  });
});
