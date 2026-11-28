// Aceita só caminhos internos; "//site.com" ou "https://..." viraria open redirect
export function safeRedirectPath(path: string | null): string {
  return path && path.startsWith('/') && !path.startsWith('//') ? path : '/';
}
