import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/dashboard/appointments")({
  component: Appointments,
});

function Appointments() {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold text-gray-900">Appointments</h2>
        <div className="flex gap-2">
          <button className="px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50">
            Calendar View
          </button>
          <button className="px-4 py-2 bg-indigo-600 text-white text-sm font-semibold rounded-md hover:bg-indigo-700">
            Sync Calendar
          </button>
        </div>
      </div>

      <div className="bg-white shadow rounded-lg border border-gray-200 overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Customer</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Service</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date & Time</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {appointments.map((apt) => (
              <tr key={apt.id}>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{apt.customer}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{apt.service}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{apt.date} at {apt.time}</td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                    apt.status === 'Completed' ? 'bg-green-100 text-green-800' :
                    apt.status === 'Scheduled' ? 'bg-blue-100 text-blue-800' :
                    'bg-red-100 text-red-800'
                  }`}>
                    {apt.status}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <button className="text-indigo-600 hover:text-indigo-900 mr-3">Edit</button>
                  <button className="text-gray-400 hover:text-gray-600">...</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

const appointments = [
  { id: 1, customer: 'Alice Cooper', service: 'Full Color', time: '10:00 AM', date: 'Today', status: 'Scheduled' },
  { id: 2, customer: 'Bob Marley', service: 'Beard Trim', time: '9:30 AM', date: 'Today', status: 'Completed' },
  { id: 3, customer: 'Sarah Jenkins', service: 'Haircut', time: '2:00 PM', date: 'Today', status: 'Scheduled' },
  { id: 4, customer: 'Michael Jordan', service: 'Fade', time: '4:00 PM', date: 'Yesterday', status: 'Completed' },
  { id: 5, customer: 'Elvis Presley', service: 'Wash & Dry', time: '11:00 AM', date: 'Yesterday', status: 'Cancelled' },
];
