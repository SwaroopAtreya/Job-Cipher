
import { Button } from "@/components/ui/button";
import { FileText } from "lucide-react";

interface UserSkillsProps {
  userSkills: string[];
}

const UserSkills = ({ userSkills }: UserSkillsProps) => {
  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h2 className="text-lg font-semibold text-gray-900 mb-4">My Skills</h2>
      {userSkills.length > 0 ? (
        <div className="flex flex-wrap gap-2">
          {userSkills.map((skill, index) => (
            <span 
              key={index} 
              className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm"
            >
              {skill}
            </span>
          ))}
        </div>
      ) : (
        <div className="text-center py-8">
          <FileText className="h-12 w-12 text-gray-300 mx-auto mb-3" />
          <p className="text-sm text-gray-500 mb-4">No skills added yet</p>
          <Button 
            variant="outline"
            disabled
          >
            Add Skills
          </Button>
        </div>
      )}
    </div>
  );
};

export default UserSkills;
