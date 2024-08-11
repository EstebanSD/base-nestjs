import { join } from 'path';

export function getEnvPath(): string {
  const env: string = process.env.NODE_ENV;
  const filePath = join(process.cwd(), `./.env.${env}`);
  return filePath;
}
