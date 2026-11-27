// Formato do JSON devolvido pela RPC get_dashboard_metrics (o gerador tipa jsonb como Json)
export interface DashboardMetrics {
  today_count: number;
  next_7_days_count: number;
  month_revenue_cents: number;
  month_expected_cents: number;
  cancellation_rate_30d: number | null;
  daily_next_14_days: { date: string; count: number }[];
  top_services_30d: { name: string; count: number }[];
}
