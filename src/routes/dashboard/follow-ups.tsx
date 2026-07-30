import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/dashboard/follow-ups")({
  component: FollowUps,
});

function FollowUps() {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold text-gray-900">Pending Follow-ups</h2>
        <span className="bg-indigo-100 text-indigo-800 text-xs font-semibold px-2.5 py-0.5 rounded-full">
          {followUps.length} Pending
        </span>
      </div>

      <div className="bg-white shadow rounded-lg border border-gray-200 overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Customer</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Follow-up Reason</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Scheduled Date</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {followUps.map((item) => (
              <tr key={item.id}>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-gray-900">{item.customer}</div>
                  <div className="text-sm text-gray-500">{item.phone}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {item.reason}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {item.date}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <button className="text-indigo-600 hover:text-indigo-900 mr-3">Now</button>
                  <button className="text-gray-400 hover:text-gray-600">Pause</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

const followUps = [
  { id: 1, customer: 'John Lennon', phone: '+1 (555) 0123', reason: 'Unbooked Lead Recovery', date: 'In 2 hours' },
  { id: 2, customer: 'Paul McCartney', phone: '+1 (555) 4567', reason: '7-Day Re-engagement', date: 'Tomorrow' },
  { id: 3, customer: 'George Harrison', phone: '+1 (555) 8901', reason: 'Post-Appointment Review', date: 'July 2nd' },
  { id: 4, customer: 'Ringo Starr', phone: '+1 (555) 2345', reason: 'Seasonal Promotion', date: 'July 5th' },
];
