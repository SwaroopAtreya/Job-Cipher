
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { ArrowLeft, Briefcase, Building, MapPin, Clock, Search, Filter } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { Skeleton } from "@/components/ui/skeleton";

interface Job {
  job_title?: string;
  company_name?: string;
  location?: string;
  skills?: string;
  date_posted?: string;
  job_link?: string;
  salary?: string;
}

const Jobs = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [jobs, setJobs] = useState<Job[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const { toast } = useToast();
  const [userSkills, setUserSkills] = useState<string[]>([]);
  const [userLocation, setUserLocation] = useState<string>("");

  useEffect(() => {
    checkUser();
  }, []);

  const checkUser = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        navigate("/auth");
        return;
      }
      
      // Get user profile to fetch skills and location
      const { data: profile } = await supabase
        .from('profiles')
        .select('skills, location')
        .eq('id', user.id)
        .single();
      
      if (profile) {
        setUserSkills(profile.skills || []);
        setUserLocation(profile.location || "");
        
        // Use first skill as keyword if available
        const keyword = profile.skills && profile.skills.length > 0 ? profile.skills[0] : "";
        fetchJobs(keyword, profile.location || "india");
      } else {
        fetchJobs("", "india");
      }
    } catch (error) {
      console.error("Error checking user:", error);
      setIsLoading(false);
    }
  };

  const fetchJobs = async (keyword: string = "", location: string = "india") => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("job-search", {
        body: {
          keyword,
          location,
          experience: 0,
          job_type: "fulltime",
          date_posted: "1 week"
        }
      });
      
      if (error) throw error;
      
      if (data?.data && Array.isArray(data.data)) {
        setJobs(data.data);
      } else {
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to fetch jobs or no jobs found"
        });
        setJobs([]);
      }
    } catch (error: any) {
      console.error("Error fetching jobs:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "Failed to fetch jobs"
      });
      setJobs([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearch = () => {
    fetchJobs(searchTerm, userLocation);
  };

  const handleSkillClick = (skill: string) => {
    setSearchTerm(skill);
    fetchJobs(skill, userLocation);
  };

  const formatSalary = (salary: string) => {
    if (!salary) return "Not specified";
    return salary;
  };

  const formatSkills = (skills: string) => {
    if (!skills) return [];
    return skills.split('|').map(s => s.trim()).filter(Boolean);
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Button
          variant="ghost"
          className="mb-6"
          onClick={() => navigate("/dashboard")}
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Dashboard
        </Button>
        
        <div className="flex items-center mb-8">
          <Briefcase className="h-8 w-8 text-primary mr-3" />
          <h1 className="text-2xl font-bold">Job Match Pro</h1>
        </div>
        
        <div className="bg-white rounded-lg shadow p-8 mb-8">
          <h2 className="text-xl font-semibold mb-6">Jobs Matched to Your Skills</h2>
          
          <div className="flex flex-col gap-4 mb-6">
            <div className="flex flex-wrap gap-2 mb-2">
              {userSkills.map((skill, index) => (
                <Button
                  key={index}
                  variant="outline"
                  size="sm"
                  onClick={() => handleSkillClick(skill)}
                  className={searchTerm === skill ? "bg-primary/10" : ""}
                >
                  {skill}
                </Button>
              ))}
            </div>
            
            <div className="flex gap-2">
              <div className="relative flex-grow">
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search for jobs by keyword..."
                  className="w-full px-4 py-2 border rounded-md"
                />
              </div>
              <Button onClick={handleSearch}>
                <Search className="h-4 w-4 mr-2" />
                Search
              </Button>
              <Button variant="outline" onClick={() => fetchJobs()}>
                <Filter className="h-4 w-4 mr-2" />
                Reset
              </Button>
            </div>
          </div>
          
          {isLoading ? (
            <div className="space-y-6">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="border rounded-lg p-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <Skeleton className="h-6 w-48 mb-2" />
                      <Skeleton className="h-4 w-32 mb-1" />
                    </div>
                    <Skeleton className="h-9 w-24" />
                  </div>
                  <div className="mt-3">
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-3/4 mt-1" />
                  </div>
                  <div className="mt-3 flex flex-wrap gap-1">
                    <Skeleton className="h-5 w-16 rounded-full" />
                    <Skeleton className="h-5 w-20 rounded-full" />
                    <Skeleton className="h-5 w-14 rounded-full" />
                  </div>
                </div>
              ))}
            </div>
          ) : jobs.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <p className="mb-4">No job matches found. Try different search terms or check back later.</p>
              <Button variant="outline" onClick={() => fetchJobs()}>
                <Filter className="h-4 w-4 mr-2" />
                Reset Filters
              </Button>
            </div>
          ) : (
            <div className="space-y-6">
              {jobs.map((job, index) => (
                <div key={index} className="border rounded-lg p-4 hover:bg-gray-50 transition-colors">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-medium text-lg">{job.job_title || "Position"}</h3>
                      <div className="flex items-center mt-1 text-gray-600">
                        <Building className="h-4 w-4 mr-1" />
                        <span className="mr-3">{job.company_name || "Company"}</span>
                        <MapPin className="h-4 w-4 mr-1" />
                        <span>{job.location || "Location not specified"}</span>
                      </div>
                    </div>
                    {job.job_link && (
                      <Button size="sm" asChild>
                        <a href={job.job_link} target="_blank" rel="noopener noreferrer">
                          Apply Now
                        </a>
                      </Button>
                    )}
                  </div>
                  
                  {job.salary && (
                    <div className="mt-2 text-green-700">
                      Salary: {formatSalary(job.salary)}
                    </div>
                  )}
                  
                  <div className="mt-3 flex flex-wrap gap-1">
                    {formatSkills(job.skills || "").map((skill, skillIndex) => (
                      <span key={skillIndex} className="bg-blue-100 text-blue-800 px-2 py-0.5 rounded-full text-xs">
                        {skill}
                      </span>
                    ))}
                  </div>
                  
                  <div className="mt-3 flex justify-between items-center text-sm text-gray-500">
                    <span className="flex items-center">
                      <Clock className="h-3 w-3 mr-1" />
                      {job.date_posted || "Recently posted"}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Jobs;
