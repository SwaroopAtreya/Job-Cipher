
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { User, Briefcase, FileText } from "lucide-react";

const QuickActions = () => {
  const navigate = useNavigate();
  
  return (
    <div className="bg-white rounded-lg shadow p-6 space-y-4">
      <h2 className="text-lg font-semibold text-gray-900">Quick Actions</h2>
      <div className="space-y-3">
        <Button 
          variant="outline" 
          className="w-full justify-start" 
          onClick={() => navigate("/profile")}
        >
          <User className="mr-2 h-4 w-4" />
          Resume Scan
        </Button>
        <Button 
          variant="outline" 
          className="w-full justify-start"
          onClick={() => navigate("/jobs")}
        >
          <Briefcase className="mr-2 h-4 w-4" />
          Job Match Pro
        </Button>
        <Button 
          variant="outline" 
          className="w-full justify-start"
          onClick={() => navigate("/extract-skills")}
        >
          <FileText className="mr-2 h-4 w-4" />
          Resume Skills Extraction
        </Button>
      </div>
    </div>
  );
};

export default QuickActions;
