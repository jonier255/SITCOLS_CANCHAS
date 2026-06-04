// Extiende los tipos de Express para agregar propiedades custom al Request.
// TypeScript las reconocerá en todos los controllers y middlewares.

declare namespace Express {
  interface Request {
    user?: {
      id: string
      userId: string
      email: string
      role: string
      tenantId: string | null
      jti?: string
      exp?: number
    };
    tenant?: {
      id:       string;
      slug:     string;
      name:     string;
      plan:     string;
      status:   string;
      settings: Record<string, unknown>;
    } | null;
    tenantId?: string | null;
    staffRole?: string | null;
  }
}