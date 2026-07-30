import { execSync } from 'node:child_process';

export function query(sql: string) {
  try {
    const result = execSync(`team-db "${sql.replace(/"/g, '\\"')}"`, { encoding: 'utf8' });
    return JSON.parse(result);
  } catch (error: any) {
    console.error('Database query error:', error.message);
    throw error;
  }
}

export function execute(sql: string) {
  try {
    const result = execSync(`team-db "${sql.replace(/"/g, '\\"')}"`, { encoding: 'utf8' });
    return JSON.parse(result);
  } catch (error: any) {
    console.error('Database execute error:', error.message);
    throw error;
  }
}
