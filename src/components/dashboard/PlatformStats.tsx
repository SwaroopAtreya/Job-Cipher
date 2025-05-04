
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface PlatformStatsProps {
  applications: any[];
  applicationStats: {
    pending: number;
    accepted: number;
    rejected: number;
  };
}

const PlatformStats = ({ applications, applicationStats }: PlatformStatsProps) => {
  const statsData = [
    { name: 'Pending', value: applicationStats.pending },
    { name: 'Accepted', value: applicationStats.accepted },
    { name: 'Rejected', value: applicationStats.rejected }
  ];

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h2 className="text-lg font-semibold text-gray-900 mb-4">Job Platform Stats</h2>
      {applications.length > 0 ? (
        <div className="space-y-4">
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={statsData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis allowDecimals={false} />
                <Tooltip />
                <Bar dataKey="value" fill="#3b82f6" />
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div className="grid grid-cols-3 gap-4 text-center">
            <div className="bg-yellow-50 p-2 rounded">
              <img 
                src="https://www.linkedin.com/favicon.ico" 
                alt="LinkedIn"
                className="h-4 w-4 mx-auto"
              />
              <p className="text-sm font-medium mt-1">LinkedIn</p>
              <p className="text-lg font-semibold">8</p>
            </div>
            <div className="bg-blue-50 p-2 rounded">
              <img 
                src="https://www.naukri.com/favicon.ico" 
                alt="Naukri"
                className="h-4 w-4 mx-auto"
              />
              <p className="text-sm font-medium mt-1">Naukri</p>
              <p className="text-lg font-semibold">12</p>
            </div>
            <div className="bg-purple-50 p-2 rounded">
              <img 
                src="https://www.foundit.in/favicon.ico" 
                alt="Foundit"
                className="h-4 w-4 mx-auto"
              />
              <p className="text-sm font-medium mt-1">Foundit</p>
              <p className="text-lg font-semibold">5</p>
            </div>
          </div>
        </div>
      ) : (
        <p className="text-sm text-gray-600">
          Connect your job platform accounts to see your application statistics here.
        </p>
      )}
    </div>
  );
};

export default PlatformStats;
