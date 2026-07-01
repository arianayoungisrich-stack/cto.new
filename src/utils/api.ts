import { createServerFn } from "@tanstack/react-start";

export const submitContact = createServerFn({ method: "POST" })
  .validator((data: any) => data)
  .handler(async ({ data }) => {
    const { name, business, email, phone, message } = data;
    const { execSync } = await import("node:child_process");
    
    // Escape single quotes for SQL
    const escape = (str: string) => str?.replace(/'/g, "''") ?? "";
    
    const sqlSub = `INSERT INTO contact_submissions (name, business, email, phone, message) VALUES ('${escape(name)}', '${escape(business)}', '${escape(email)}', '${escape(phone)}', '${escape(message)}')`;
    const sqlLead = `INSERT INTO leads (business_name, owner_name, email, phone, personalization_notes, source, status) VALUES ('${escape(business)}', '${escape(name)}', '${escape(email)}', '${escape(phone)}', '${escape(message)}', 'website', 'inbound')`;
    
    try {
      execSync(`team-db "${sqlSub}"`);
      execSync(`team-db "${sqlLead}"`);
      
      // Add to sales pipeline
      const newLeadJson = execSync(`team-db "SELECT id FROM leads WHERE email = '${escape(email)}' ORDER BY id DESC LIMIT 1"`).toString();
      const newLead = JSON.parse(newLeadJson)[0];
      if (newLead) {
        const pipelineSql = `INSERT INTO sales_pipeline (lead_id, stage) VALUES (${newLead.id}, 'new')`;
        execSync(`team-db "${pipelineSql}"`);
      }
      
      return { success: true };
    } catch (error) {
      console.error("Database error:", error);
      return { success: false, error: "Failed to save lead" };
    }
  });

export const incrementPageView = createServerFn({ method: "POST" })
  .validator((path: string) => path)
  .handler(async ({ data: path }) => {
    const { execSync } = await import("node:child_process");
    const sql = `INSERT INTO page_views (page_path, view_count) VALUES ('${path}', 1) ON CONFLICT(page_path) DO UPDATE SET view_count = view_count + 1, last_viewed = CURRENT_TIMESTAMP`;
    try {
      execSync(`team-db "${sql}"`);
      return { success: true };
    } catch (error) {
      console.error("Analytics error:", error);
      return { success: false };
    }
  });
