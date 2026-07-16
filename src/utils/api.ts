import { createServerFn } from "@tanstack/react-start";
import { dbQuery } from "./db";

export const submitContact = createServerFn({ method: "POST" })
  .validator((data: any) => data)
  .handler(async ({ data }) => {
    const { name, business, email, phone, message } = data;
    
    const sqlSub = "INSERT INTO contact_submissions (name, business, email, phone, message) VALUES (?, ?, ?, ?, ?)";
    const sqlLead = "INSERT INTO leads (business_name, owner_name, email, phone, personalization_notes, source, status) VALUES (?, ?, ?, ?, ?, 'website', 'inbound')";
    
    try {
      await dbQuery(sqlSub, [name || "", business || "", email || "", phone || "", message || ""]);
      await dbQuery(sqlLead, [business || "", name || "", email || "", phone || "", message || ""]);
      
      // Add to sales pipeline
      const leads = await dbQuery<{ id: number }>(
        "SELECT id FROM leads WHERE email = ? ORDER BY id DESC LIMIT 1",
        [email || ""]
      );
      const newLead = leads[0];
      if (newLead) {
        const pipelineSql = "INSERT INTO sales_pipeline (lead_id, stage) VALUES (?, 'new')";
        await dbQuery(pipelineSql, [newLead.id]);
      }
      
      return { success: true };
    } catch (error) {
      console.error("Database error in submitContact:", error);
      return { success: false, error: "Failed to save lead" };
    }
  });

export const incrementPageView = createServerFn({ method: "POST" })
  .validator((path: string) => path)
  .handler(async ({ data: path }) => {
    const sql = "INSERT INTO page_views (page_path, view_count) VALUES (?, 1) ON CONFLICT(page_path) DO UPDATE SET view_count = view_count + 1, last_viewed = CURRENT_TIMESTAMP";
    try {
      await dbQuery(sql, [path || ""]);
      return { success: true };
    } catch (error) {
      console.error("Analytics error in incrementPageView:", error);
      return { success: false };
    }
  });
