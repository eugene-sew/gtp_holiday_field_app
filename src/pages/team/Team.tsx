import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../stores/authStore';
import { useTeamStore } from '../../stores/teamStore';
import { useTaskStore } from '../../stores/taskStore';
import TeamMemberCard from '../../components/team/TeamMemberCard';
import { Users } from 'lucide-react';

const Team = () => {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const { team } = useTeamStore();
  const { tasks } = useTaskStore();
  
  // Only admin can access team page
  useEffect(() => {
    if (user?.role !== 'admin') {
      navigate('/dashboard');
    }
  }, [user, navigate]);
  
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Team Management</h1>
        <p className="mt-1 text-sm text-gray-500">
          View and manage your field team members
        </p>
      </div>
      
      {team.length === 0 ? (
        <div className="bg-white shadow rounded-lg p-12 text-center">
          <div className="mx-auto h-16 w-16 flex items-center justify-center rounded-full bg-blue-100">
            <Users className="h-8 w-8 text-blue-600" />
          </div>
          <h3 className="mt-4 text-lg font-medium text-gray-900">No team members</h3>
          <p className="mt-1 text-sm text-gray-500">
            Your team list is empty.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {team.map(member => (
            <TeamMemberCard 
              key={member.id} 
              member={member} 
              tasks={tasks}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default Team;