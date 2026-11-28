import type { Page } from '@playwright/test';
import { dateInDays, expect, test } from './fixtures/supabase-mock.ts';

// Segundo dia aberto: garante horários futuros em qualquer hora do dia em que o teste rodar
async function pickSlot(page: Page, time: string) {
  const days = page
    .getByRole('radiogroup', { name: 'Data' })
    .getByRole('radio', { disabled: false });
  await days.nth(1).click();
  await page
    .getByRole('radiogroup', { name: 'Horário' })
    .getByRole('radio', { name: time })
    .click();
  return new URL(page.url()).searchParams.get('data')!;
}

test('agenda do início ao fim com login por link mágico', async ({ page, supabase }) => {
  await page.goto('/');
  await page.getByRole('link', { name: 'Ver negócio de exemplo' }).click();
  await expect(page.getByRole('heading', { name: 'Barbearia Demo' })).toBeVisible();

  await page.getByRole('link', { name: /Corte de cabelo/ }).click();
  const date = await pickSlot(page, '09:30');
  const [year, month, day] = date.split('-');
  await page.getByRole('link', { name: 'Continuar' }).click();

  await expect(page).toHaveURL(/\/entrar\?redirect=/);
  await page.getByLabel('E-mail').fill('cliente@agendei.dev');
  await page.getByRole('button', { name: 'Enviar link de acesso' }).click();
  await expect(page.getByRole('heading', { name: 'Verifique seu e-mail' })).toBeVisible();

  // Simula o clique no link recebido por e-mail
  await supabase.login();
  await page.goto(supabase.magicLinks[0]);

  await expect(page.getByRole('heading', { name: 'Confirmar agendamento' })).toBeVisible();
  await expect(page.getByText(`${day}/${month} às 09:30`)).toBeVisible();
  await page.getByLabel('Nome completo').fill('Carla Cliente');
  await page.getByLabel('Telefone (WhatsApp)').fill('(11) 98888-0000');
  await page.getByRole('button', { name: 'Confirmar agendamento' }).click();

  await expect(page).toHaveURL('/meus-agendamentos');
  await expect(page.getByRole('status')).toContainText('Agendamento confirmado');
  const card = page.getByRole('listitem').filter({ hasText: `${day}/${month}/${year} às 09:30` });
  await expect(card).toContainText('Pendente');
  expect(supabase.profile).toEqual({ full_name: 'Carla Cliente', phone: '11988880000' });
});

test('avisa quando outra pessoa reserva o horário antes', async ({ page, supabase }) => {
  await supabase.login();
  await page.goto('/b/barbearia-demo/agendar?servico=svc-corte');
  const date = await pickSlot(page, '10:00');
  await page.getByRole('link', { name: 'Continuar' }).click();
  await page.getByLabel('Nome completo').fill('Carla Cliente');
  await page.getByLabel('Telefone (WhatsApp)').fill('11988880000');

  supabase.addAppointment(`${date}T10:00:00-03:00`, 'confirmed', 'outra-pessoa');
  await page.getByRole('button', { name: 'Confirmar agendamento' }).click();

  await expect(page.getByRole('alert')).toContainText('acabou de ser reservado');
  await page.getByRole('link', { name: 'Ver horários livres' }).click();
  const slots = page.getByRole('radiogroup', { name: 'Horário' });
  await expect(slots.getByRole('radio', { name: '09:30' })).toBeVisible();
  await expect(slots.getByRole('radio', { name: '10:00' })).toHaveCount(0);
});

test('cancela um agendamento futuro', async ({ page, supabase }) => {
  await supabase.login();
  const [year, month, day] = dateInDays(3).split('-');
  supabase.addAppointment(`${year}-${month}-${day}T09:00:00-03:00`, 'confirmed');
  await page.goto('/meus-agendamentos');

  const card = page.getByRole('listitem').filter({ hasText: `${day}/${month}/${year} às 09:00` });
  await expect(card).toContainText('Confirmado');
  await card.getByRole('button', { name: 'Cancelar', exact: true }).click();
  await card.getByRole('button', { name: 'Sim, cancelar' }).click();

  await expect(page.getByText('Nenhum agendamento futuro.')).toBeVisible();
  await expect(card).toContainText('Cancelado');
  expect(supabase.appointments[0].status).toBe('cancelled');
});

test('exige login para ver meus agendamentos', async ({ page }) => {
  await page.goto('/meus-agendamentos');

  await expect(page).toHaveURL('/entrar?redirect=%2Fmeus-agendamentos');
  await expect(page.getByRole('heading', { name: 'Entrar' })).toBeVisible();
});

test('mostra aviso para negócio inexistente', async ({ page }) => {
  await page.goto('/b/nao-existe');

  await expect(page.getByRole('heading', { name: 'Negócio não encontrado' })).toBeVisible();
});
