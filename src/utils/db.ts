import { createClient } from "@libsql/client";

const url = process.env.TEAM_DB_URL || `file:${process.env.TEAM_DB_PATH || "/home/team/.data/agent-team-0273f8ff.db"}`;
const authToken = process.env.TEAM_DB_AUTH_TOKEN;

export const dbClient = createClient({
  url,
  authToken,
});

export async function dbQuery<T = any>(sql: string): Promise<T[]> {
  try {
    const result = await dbClient.execute(sql);
    
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
    console.error(`Database error executing query: ${sql}`, error);
    throw error;
  }
}
