import { createFileRoute, useRouter } from "@tanstack/react-router";
import { createServerFn } from "@tanstack/react-start";
import { useState } from "react";

const getDashboardData = createServerFn({ method: "GET" }).handler(async () => {
  const { execSync } = await import("node:child_process");
  
  try {
    const submissionsJson = execSync(`team-db "SELECT * FROM contact_submissions ORDER BY created_at DESC"`).toString();
    const viewsJson = execSync(`team-db "SELECT * FROM page_views ORDER BY view_count DESC"`).toString();
    const leadsJson = execSync(`team-db "SELECT l.*, p.stage, p.call_scheduled, p.proposal_sent, p.notes as pipeline_notes FROM leads l LEFT JOIN sales_pipeline p ON l.id = p.lead_id ORDER BY l.created_at DESC"`).toString();
    const proposalsJson = execSync(`team-db "SELECT pr.*, l.business_name FROM proposals pr JOIN leads l ON pr.lead_id = l.id ORDER BY pr.created_at DESC"`).toString();
    
    return {
      submissions: JSON.parse(submissionsJson),
      views: JSON.parse(viewsJson),
      leads: JSON.parse(leadsJson),
      proposals: JSON.parse(proposalsJson),
      success: true
    };
  } catch (error) {
    console.error("Dashboard data fetch error:", error);
    return { success: false, error: "Failed to fetch data" };
  }
});

const saveProposal = createServerFn({ method: "POST" })
  .validator((data: { leadId: number; content: string }) => data)
  .handler(async ({ data }) => {
    const { execSync } = await import("node:child_process");
    const escape = (str: string) => str?.replace(/'/g, "''") ?? "";
    const sql = `INSERT INTO proposals (lead_id, content) VALUES (${data.leadId}, '${escape(data.content)}')`;
    const updateSql = `UPDATE sales_pipeline SET stage = 'proposal', proposal_sent = 1 WHERE lead_id = ${data.leadId}`;
    
    try {
      execSync(`team-db "${sql}"`);
      execSync(`team-db "${updateSql}"`);
      return { success: true };
    } catch (error) {
      console.error("Save proposal error:", error);
      return { success: false };
    }
  });

const updateLeadStage = createServerFn({ method: "POST" })
  .validator((data: { leadId: number; stage: string }) => data)
  .handler(async ({ data }) => {
    const { execSync } = await import("node:child_process");
    const sql = `UPDATE sales_pipeline SET stage = '${data.stage}', updated_at = datetime('now') WHERE lead_id = ${data.leadId}`;
    
    try {
      execSync(`team-db "${sql}"`);
      return { success: true };
    } catch (error) {
      console.error("Update lead stage error:", error);
      return { success: false };
    }
  });

export const Route = createFileRoute("/admin")({
  loader: () => getDashboardData(),
  head: () => ({
    meta: [
      { title: "Admin Dashboard | Reply AI" },
    ],
  }),
  component: AdminDashboard,
});

function AdminDashboard() {
  const data = Route.useLoaderData();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<"overview" | "pipeline" | "proposals" | "outreach" | "analytics">("overview");
  const [outreachFilter, setOutreachFilter] = useState<string>("all");
  const [isProcessing, setIsProcessing] = useState(false);

  if (!data.success) {
    return <div className="p-8 text-red-600">Error: {data.error}</div>;
  }

  const stages = ['new', 'inbound', 'contacted', 'qualified', 'proposal', 'closed-won', 'closed-lost'];

  const downloadCSV = () => {
    const headers = ["ID", "Business Name", "Owner Name", "Email", "Phone", "Status", "Stage", "Source", "Created At"];
    const rows = data.leads.map((l: any) => [
      l.id,
      `"${l.business_name?.replace(/"/g, '""')}"`,
      `"${l.owner_name?.replace(/"/g, '""')}"`,
      l.email,
      l.phone,
      l.status,
      l.stage || 'new',
      l.source,
      l.created_at
    ]);

    const csvContent = [headers, ...rows].map(e => e.join(",")).join("\n");
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `reply-ai-leads-${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleGenerateProposal = async (lead: any) => {
    setIsProcessing(true);
    const content = JSON.stringify({
        businessName: lead.business_name,
        painPoints: "High lead leakage, slow manual response times, inconsistent follow-up.",
        recommendedSolutions: [
            "AI Chatbot for 24/7 instant inquiry handling",
            "Automated Appointment Booking synced with calendar",
            "Missed-Call Text-Back to capture every mobile lead"
        ],
        pricing: {
            setup: "$1,500 - $3,500",
            monthly: "$500 - $1,500/mo"
        },
        timeline: "14 days to full integration and launch."
    }, null, 2);

    try {
        const res = await saveProposal({ data: { leadId: lead.id, content } });
        if (res.success) {
            await router.invalidate();
        }
    } finally {
        setIsProcessing(false);
    }
  };

  const handleMarkAsContacted = async (leadId: number) => {
      setIsProcessing(true);
      try {
          const res = await updateLeadStage({ data: { leadId, stage: 'contacted' } });
          if (res.success) {
              await router.invalidate();
          }
      } finally {
          setIsProcessing(false);
      }
  };

  return (
    <div className="min-h-screen bg-slate-50 p-8 font-sans">
      <div className="max-w-7xl mx-auto">
        <header className="mb-12 flex justify-between items-center border-b border-slate-200 pb-6">
          <div>
            <h1 className="text-3xl font-bold text-indigo-600">Reply AI Admin Dashboard</h1>
            <p className="text-slate-600">Manage leads and track performance</p>
          </div>
          <div className="flex items-center gap-4">
            <button 
                onClick={downloadCSV}
                className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 text-slate-700 rounded-lg text-sm font-medium hover:bg-slate-50 transition-colors shadow-sm"
            >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
                Export CSV
            </button>
            <a href="/" className="text-sm font-medium text-slate-500 hover:text-indigo-600 transition-colors">Back to Site</a>
          </div>
        </header>

        <nav className="flex gap-4 mb-8 overflow-x-auto pb-2">
            {['overview', 'pipeline', 'proposals', 'outreach', 'analytics'].map((tab) => (
                <button
                    key={tab}
                    onClick={() => setActiveTab(tab as any)}
                    className={`px-4 py-2 rounded-lg font-medium capitalize transition-all whitespace-nowrap ${
                        activeTab === tab 
                        ? "bg-indigo-600 text-white shadow-md shadow-indigo-100" 
                        : "text-slate-600 hover:bg-slate-100"
                    }`}
                >
                    {tab.replace('-', ' ')}
                </button>
            ))}
        </nav>

        {activeTab === 'overview' && (
            <>
                <div className="grid lg:grid-cols-3 gap-8 mb-12">
                    <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
                        <h3 className="text-sm font-medium text-slate-500 uppercase tracking-wider mb-2">Total Leads</h3>
                        <p className="text-4xl font-bold text-slate-900">{data.leads.length}</p>
                    </div>
                    <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
                        <h3 className="text-sm font-medium text-slate-500 uppercase tracking-wider mb-2">Total Page Views</h3>
                        <p className="text-4xl font-bold text-slate-900">
                            {data.views.reduce((acc: number, curr: any) => acc + (curr.view_count || 0), 0)}
                        </p>
                    </div>
                    <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
                        <h3 className="text-sm font-medium text-slate-500 uppercase tracking-wider mb-2">Conversion Rate</h3>
                        <p className="text-4xl font-bold text-slate-900">
                            {data.views.length > 0 ? ((data.leads.length / data.views.reduce((acc: number, curr: any) => acc + (curr.view_count || 0), 0)) * 100).toFixed(1) : 0}%
                        </p>
                    </div>
                </div>

                <section className="mb-12">
                <h2 className="text-xl font-bold text-slate-900 mb-6">Recent Contact Submissions</h2>
                <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                    <table className="min-w-full divide-y divide-slate-200">
                    <thead className="bg-slate-50">
                        <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Date</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Name</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Business</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Contact</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Message</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-slate-200">
                        {data.submissions.slice(0, 10).map((sub: any) => (
                        <tr key={sub.id}>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">{new Date(sub.created_at).toLocaleDateString()}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-slate-900">{sub.name}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">{sub.business}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">
                            <div>{sub.email}</div>
                            <div className="text-xs text-slate-400">{sub.phone}</div>
                            </td>
                            <td className="px-6 py-4 text-sm text-slate-500 max-w-xs truncate">{sub.message}</td>
                        </tr>
                        ))}
                    </tbody>
                    </table>
                </div>
                </section>
            </>
        )}

        {activeTab === 'pipeline' && (
            <section className="mb-12">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-xl font-bold text-slate-900">Sales Pipeline</h2>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-7 gap-4 overflow-x-auto pb-4">
                    {stages.map(stage => {
                        const leadsInStage = data.leads.filter((l: any) => {
                            const currentStage = l.stage || (l.status === 'inbound' ? 'inbound' : 'new');
                            return currentStage === stage;
                        });
                        return (
                            <div key={stage} className="min-w-[180px] bg-slate-100 p-4 rounded-xl border border-slate-200">
                                <h3 className="text-xs font-bold text-slate-500 uppercase mb-4 flex justify-between">
                                    {stage}
                                    <span className="bg-white px-1.5 py-0.5 rounded text-[10px]">{leadsInStage.length}</span>
                                </h3>
                                <div className="space-y-3">
                                    {leadsInStage.map((lead: any) => (
                                        <div key={lead.id} className="bg-white p-3 rounded-lg shadow-sm border border-slate-200 text-sm">
                                            <div className="font-bold text-slate-900 mb-1">{lead.business_name}</div>
                                            <div className="text-xs text-slate-500 mb-2">{lead.owner_name}</div>
                                            <div className="flex justify-between items-center">
                                                <span className={`text-[10px] px-1.5 py-0.5 rounded ${lead.lead_score > 50 ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-600'}`}>
                                                    Score: {lead.lead_score}
                                                </span>
                                                {lead.call_scheduled && (
                                                    <span title="Call Scheduled" className="text-indigo-600">
                                                        <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20"><path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z"></path></svg>
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        );
                    })}
                </div>
            </section>
        )}

        {activeTab === 'proposals' && (
            <section className="mb-12">
                <h2 className="text-xl font-bold text-slate-900 mb-6">Proposal Management</h2>
                <div className="grid lg:grid-cols-2 gap-8">
                    <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                        <div className="p-4 bg-slate-50 border-b border-slate-200 font-bold text-sm">Qualified Leads</div>
                        <div className="divide-y divide-slate-100">
                            {data.leads.filter((l: any) => ['qualified', 'proposal'].includes(l.stage)).map((lead: any) => (
                                <div key={lead.id} className="p-4 flex justify-between items-center">
                                    <div>
                                        <div className="font-bold">{lead.business_name}</div>
                                        <div className="text-xs text-slate-500 uppercase">{lead.stage}</div>
                                    </div>
                                    <button 
                                        disabled={isProcessing}
                                        onClick={() => handleGenerateProposal(lead)}
                                        className="px-3 py-1.5 bg-indigo-600 text-white text-xs font-bold rounded-lg hover:bg-indigo-700 disabled:opacity-50"
                                    >
                                        {isProcessing ? 'Processing...' : 'Generate Proposal'}
                                    </button>
                                </div>
                            ))}
                            {data.leads.filter((l: any) => ['qualified', 'proposal'].includes(l.stage)).length === 0 && (
                                <div className="p-8 text-center text-slate-400 italic">No qualified leads ready for proposals</div>
                            )}
                        </div>
                    </div>
                    <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                        <div className="p-4 bg-slate-50 border-b border-slate-200 font-bold text-sm">Recent Proposals</div>
                        <div className="divide-y divide-slate-100">
                            {data.proposals.map((prop: any) => (
                                <div key={prop.id} className="p-4">
                                    <div className="flex justify-between items-start mb-2">
                                        <div className="font-bold">{prop.business_name}</div>
                                        <span className="text-[10px] px-1.5 py-0.5 bg-green-100 text-green-700 rounded uppercase font-bold">{prop.status}</span>
                                    </div>
                                    <div className="text-xs text-slate-500 mb-3">{new Date(prop.created_at).toLocaleString()}</div>
                                    <pre className="text-[10px] bg-slate-50 p-2 rounded max-h-32 overflow-y-auto font-mono whitespace-pre-wrap">{prop.content}</pre>
                                </div>
                            ))}
                            {data.proposals.length === 0 && (
                                <div className="p-8 text-center text-slate-400 italic">No proposals generated yet</div>
                            )}
                        </div>
                    </div>
                </div>
            </section>
        )}

        {activeTab === 'outreach' && (
            <section className="mb-12">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-xl font-bold text-slate-900">Outreach Preparation</h2>
                    <select 
                        className="bg-white border border-slate-200 rounded-lg px-3 py-1.5 text-sm outline-none"
                        value={outreachFilter}
                        onChange={(e) => setOutreachFilter(e.target.value)}
                    >
                        <option value="all">All Stages</option>
                        {stages.map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                </div>
                <div className="grid gap-6">
                    {data.leads
                        .filter((l: any) => outreachFilter === 'all' || (l.stage || 'new') === outreachFilter)
                        .map((lead: any) => (
                        <div key={lead.id} className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
                            <div className="flex justify-between items-start mb-4">
                                <div>
                                    <h3 className="text-lg font-bold text-slate-900">{lead.business_name}</h3>
                                    <p className="text-sm text-slate-500">{lead.owner_name} • {lead.email} • {lead.phone}</p>
                                </div>
                                <div className="flex gap-2">
                                    <span className="px-2 py-1 bg-slate-100 text-slate-600 rounded text-xs font-bold uppercase">{lead.stage || 'new'}</span>
                                    {['new', 'inbound'].includes(lead.stage || 'new') && (
                                        <button 
                                            disabled={isProcessing}
                                            onClick={() => handleMarkAsContacted(lead.id)}
                                            className="px-3 py-1 bg-indigo-600 text-white text-xs font-bold rounded-lg hover:bg-indigo-700 disabled:opacity-50"
                                        >
                                            {isProcessing ? 'Working...' : 'Mark as Contacted'}
                                        </button>
                                    )}
                                </div>
                            </div>
                            <div className="grid md:grid-cols-2 gap-6">
                                <div className="bg-slate-50 p-4 rounded-lg border border-slate-100">
                                    <h4 className="text-xs font-bold text-slate-400 uppercase mb-2">Personalization Notes</h4>
                                    <p className="text-sm text-slate-700 italic">"{lead.personalization_notes || 'No notes available'}"</p>
                                </div>
                                <div className="bg-indigo-50/50 p-4 rounded-lg border border-indigo-100">
                                    <h4 className="text-xs font-bold text-indigo-400 uppercase mb-2">Drafted Outreach</h4>
                                    <p className="text-sm text-slate-700">
                                        {lead.pipeline_notes || `Hi ${lead.owner_name?.split(' ')[0] || 'there'}, I saw ${lead.business_name} and wanted to reach out about how our AI systems can help you convert more of your inbound leads...`}
                                    </p>
                                </div>
                            </div>
                        </div>
                    ))}
                    {data.leads.length === 0 && (
                        <div className="p-12 text-center bg-white rounded-xl border border-slate-200 text-slate-400 italic">
                            No leads matching filters
                        </div>
                    )}
                </div>
            </section>
        )}

        {activeTab === 'analytics' && (
            <section>
                <h2 className="text-xl font-bold text-slate-900 mb-6">Page Traffic Analytics</h2>
                <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                    <table className="min-w-full divide-y divide-slate-200">
                    <thead className="bg-slate-50">
                        <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Page Path</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Views</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Last Viewed</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Trend</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-slate-200">
                        {data.views.map((view: any) => (
                        <tr key={view.id}>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-indigo-600">{view.page_path}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-900">{view.view_count}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">{new Date(view.last_viewed).toLocaleString()}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">
                                <div className="w-24 h-2 bg-slate-100 rounded-full overflow-hidden">
                                    <div 
                                        className="h-full bg-indigo-500" 
                                        style={{ width: `${Math.min(100, (view.view_count / data.views.reduce((acc: number, curr: any) => Math.max(acc, curr.view_count), 1)) * 100)}%` }}
                                    ></div>
                                </div>
                            </td>
                        </tr>
                        ))}
                    </tbody>
                    </table>
                </div>
            </section>
        )}
      </div>
    </div>
  );
}
