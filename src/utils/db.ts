import { createClient } from "@libsql/client";
import siteConfig from "../../site.json" with { type: "json" };

const url = process.env.TEAM_DB_URL || process.env.DATABASE_URL;
const authToken = process.env.TEAM_DB_AUTH_TOKEN || process.env.DATABASE_AUTH_TOKEN;

if (!url) {
  console.error("CRITICAL DATABASE ERROR: TEAM_DB_URL or DATABASE_URL is not set.");
  throw new Error("Missing TEAM_DB_URL / DATABASE_URL environment variable.");
}

export const dbClient = createClient({
  url,
  authToken,
});

export function getBusinessName(): string {
  return (siteConfig as any).businessName?.trim() ?? 'Reply AI';
}

export async function dbQuery<T = any>(sql: string, args?: any[]): Promise<T[]> {
  try {
    const result = await dbClient.execute({ sql, args: args || [] });
    
    // Map ResultSet to objects matching column names
    const rows = result.rows.map((row) => {
      const obj: any = {};
      result.columns.forEach((col, idx) => {
        obj[col] = row[idx];
      });
      return obj as T;
    });
    
    return rows;
  } catch (error) {
    console.error(`Database error executing query: ${sql}`, error, args);
    throw error;
  }
}
