export interface NavItem {
  path: string;
  label: string;
  icon: string;
}

export const NAV_ITEMS: NavItem[] = [
  { path: '/dashboard', label: 'Dashboard', icon: 'space_dashboard' },
  { path: '/agenda', label: 'Agenda', icon: 'calendar_month' },
  { path: '/services', label: 'Serviços', icon: 'content_cut' },
  { path: '/schedule', label: 'Horários', icon: 'schedule' },
  { path: '/customers', label: 'Clientes', icon: 'group' },
];
