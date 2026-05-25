import type { AuditEntry } from './types';

// getBlobToken como función lazy — NUNCA como constante de módulo
// (las variables de entorno no existen en build time)
function getBlobToken(): string {
  const token = process.env.BLOB_READ_WRITE_TOKEN;
  if (!token) throw new Error('BLOB_READ_WRITE_TOKEN no configurado');
  return token;
}

// Serializa escrituras al mismo blob dentro de la misma instancia serverless
const locks = new Map<string, Promise<void>>();

async function withFileLock<T>(key: string, fn: () => Promise<T>): Promise<T> {
  const prev = locks.get(key) ?? Promise.resolve();
  let resolveLock!: () => void;
  const lock = new Promise<void>((r) => {
    resolveLock = r;
  });
  locks.set(key, lock);

  try {
    await prev;
    return await fn();
  } finally {
    resolveLock();
    if (locks.get(key) === lock) locks.delete(key);
  }
}

export async function appendAuditEntry(entry: AuditEntry): Promise<void> {
  const month = entry.timestamp.slice(0, 7); // YYYY-MM
  const filename = `audit-${month}.jsonl`;

  try {
    getBlobToken(); // Valida que el token existe antes del import dinámico
    const { put, list } = await import('@vercel/blob');
    const token = getBlobToken();

    await withFileLock(filename, async () => {
      // Leer contenido existente usando SDK (no fetch directo)
      let existingContent = '';
      const { blobs } = await list({ prefix: filename, token });
      if (blobs.length > 0) {
        const res = await fetch(blobs[0].url);
        if (res.ok) existingContent = await res.text();
      }

      const newContent = existingContent + JSON.stringify(entry) + '\n';
      await put(filename, newContent, {
        access: 'public',
        token,
        addRandomSuffix: false,
      });
    });
  } catch {
    // La auditoría falla silenciosamente — no interrumpe el flujo principal
  }
}
