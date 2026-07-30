import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/dashboard/leads")({
  component: Leads,
});

function Leads() {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold text-gray-900">Lead Management</h2>
        <button className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700">
          Add Lead
        </button>
      </div>

      <div className="bg-white shadow rounded-lg border border-gray-200 overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Contact</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Source</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Last Interaction</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {leads.map((lead) => (
              <tr key={lead.id}>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-gray-900">{lead.name}</div>
                  <div className="text-sm text-gray-500">{lead.email}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    lead.source === 'Web' ? 'bg-purple-100 text-purple-800' :
                    lead.source === 'Call' ? 'bg-green-100 text-green-800' :
                    lead.source === 'Text' ? 'bg-blue-100 text-blue-800' :
                    'bg-pink-100 text-pink-800'
                  }`}>
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
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{lead.lastDate}</td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <button className="text-indigo-600 hover:text-indigo-900">View</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

const leads = [
  { id: 1, name: 'Sarah Jenkins', email: 'sarah.j@example.com', source: 'Web', status: 'Hot', lastDate: 'Today' },
  { id: 2, name: 'Michael Ross', email: 'mross@legal.com', source: 'Text', status: 'Warm', lastDate: 'Yesterday' },
  { id: 3, name: 'David Miller', email: 'dmiller@gmail.com', source: 'Call', status: 'Cold', lastDate: '2 days ago' },
  { id: 4, name: 'Jessica Alba', email: 'j.alba@stars.com', source: 'Social', status: 'Hot', lastDate: '3 days ago' },
  { id: 5, name: 'Kevin Hart', email: 'kevin@comedy.com', source: 'Web', status: 'Warm', lastDate: 'Today' },
  { id: 6, name: 'Robert Downey', email: 'rdj@stark.com', source: 'Call', status: 'Hot', lastDate: '1 week ago' },
];
