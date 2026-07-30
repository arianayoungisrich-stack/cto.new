import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/dashboard/")({
  component: DashboardOverview,
});

function DashboardOverview() {
  const stats = [
    { name: 'Total Leads', value: '1,284', change: '+12%', changeType: 'positive' },
    { name: 'Appointments Today', value: '12', change: '+4', changeType: 'positive' },
    { name: 'Conversion Rate', value: '18.5%', change: '+2.4%', changeType: 'positive' },
    { name: 'Estimated Revenue', value: '$24,500', change: '+$3,200', changeType: 'positive' },
  ];

  return (
    <div className="space-y-8">
      {/* Quick Actions */}
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-gray-900">Dashboard Overview</h2>
        <div className="flex gap-3">
          <button className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50">
            Export Data
          </button>
          <button className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700">
            Create New Lead
          </button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((item) => (
          <div key={item.name} className="bg-white overflow-hidden shadow rounded-lg p-5 border border-gray-100">
            <dt className="text-sm font-medium text-gray-500 truncate">{item.name}</dt>
            <dd className="mt-1 flex items-baseline justify-between">
              <div className="text-2xl font-bold text-indigo-600">{item.value}</div>
              <div className={`inline-flex items-baseline px-2.5 py-0.5 rounded-full text-sm font-medium ${
                item.changeType === 'positive' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
              }`}>
                {item.change}
              </div>
            </dd>
          </div>
        ))}
      </div>

      {/* Recent Leads Table */}
      <div className="bg-white shadow rounded-lg border border-gray-200 overflow-hidden">
        <div className="px-6 py-5 border-b border-gray-200 flex justify-between items-center">
          <h3 className="text-lg font-medium text-gray-900">Recent Leads</h3>
          <a href="/dashboard/leads" className="text-sm font-medium text-indigo-600 hover:text-indigo-500">View all</a>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Source</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {recentLeads.map((lead) => (
                <tr key={lead.id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{lead.name}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-800">
                      {lead.source}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      lead.status === 'Hot' ? 'bg-red-100 text-red-800' : 
                      lead.status === 'Warm' ? 'bg-yellow-100 text-yellow-800' : 'bg-blue-100 text-blue-800'
                    }`}>
                      {lead.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{lead.date}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

const recentLeads = [
  { id: 1, name: 'Sarah Jenkins', source: 'Web Chat', status: 'Hot', date: '5 mins ago' },
  { id: 2, name: 'Michael Ross', source: 'SMS', status: 'Warm', date: '1 hour ago' },
  { id: 3, name: 'David Miller', source: 'Call', status: 'Cold', date: '2 hours ago' },
  { id: 4, name: 'Jessica Alba', source: 'Social', status: 'Hot', date: '3 hours ago' },
  { id: 5, name: 'Kevin Hart', source: 'Web Chat', status: 'Warm', date: '5 hours ago' },
];
