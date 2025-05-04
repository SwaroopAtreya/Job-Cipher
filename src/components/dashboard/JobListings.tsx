
import { useState, useEffect } from "react";
import { Clock, Building, MapPin, Tag, Filter } from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";
import { useNavigate } from "react-router-dom";
import { Skeleton } from "@/components/ui/skeleton";

interface Job {
  id?: string;
  job_title?: string;
  title?: string;
  company_name?: string;
  company?: string;
  location?: string;
  keywords?: string[];
  skills?: string;
  postedAt?: string;
  date_posted?: string;
  salary?: string;
  job_link?: string;
}

const JobListings = () => {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    fetchJobs();
  }, []);

  const fetchJobs = async () => {
    setIsLoading(true);
    try {
      // Attempt to get user profile data for job search
      const { data: { user } } = await supabase.auth.getUser();
      
      // Default search parameters
      const searchParams = {
        keyword: "",
        location: "india",
        experience: 0,
        job_type: "fulltime",
        date_posted: "1 week"
      };
      
      // If user is logged in, get their profile data
      if (user) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('skills, location')
          .eq('id', user.id)
          .single();
          
        if (profile) {
          // Use the first skill as keyword if available
          if (profile.skills && profile.skills.length > 0) {
            searchParams.keyword = profile.skills[0];
          }
          
          // Use profile location if available
          if (profile.location) {
            searchParams.location = profile.location;
          }
        }
      }
      
      // Call the job-search edge function
      const { data, error } = await supabase.functions.invoke("job-search", {
        body: searchParams
      });
      
      if (error) throw error;
      
      if (data?.data) {
        // Map the job data to our interface
        const formattedJobs: Job[] = data.data.slice(0, 3).map((job: any, index: number) => ({
          id: index.toString(),
          title: job.job_title || job.title || "Frontend Developer",
          company: job.company_name || job.company || "Tech Company",
          location: job.location || "Remote",
          keywords: job.skills ? job.skills.split('|').filter(Boolean).map((s: string) => s.trim()) : 
                  ['React', 'JavaScript', 'Web Development'],
          postedAt: job.date_posted || job.posted_at || "Recently",
          job_link: job.job_link || null,
          salary: job.salary || null
        }));
        
        setJobs(formattedJobs);
      } else {
        // If no jobs are returned, use mock data
        setJobs(mockJobs);
      }
    } catch (error) {
      console.error("Error fetching jobs:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Could not fetch job listings. Using sample data instead."
      });
      setJobs(mockJobs);
    } finally {
      setIsLoading(false);
    }
  };

  // Mock job data as fallback
  const mockJobs = [
    {
      id: "1",
      title: "Frontend Developer",
      company: "TechCorp Solutions",
      location: "Mumbai, India",
      keywords: ["React", "TypeScript", "Tailwind CSS"],
      postedAt: "2 days ago",
    },
    {
      id: "2",
      title: "React Developer",
      company: "Global Innovations",
      location: "Bangalore, India",
      keywords: ["React", "Redux", "Node.js"],
      postedAt: "1 week ago",
    },
    {
      id: "3",
      title: "Full Stack Engineer",
      company: "Digital Systems Inc",
      location: "New York, USA",
      keywords: ["JavaScript", "React", "MongoDB", "Express"],
      postedAt: "3 days ago",
    }
  ];

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="border rounded-lg p-4">
            <div className="flex justify-between items-start">
              <div>
                <Skeleton className="h-5 w-40 mb-2" />
                <Skeleton className="h-4 w-32" />
              </div>
              <Skeleton className="h-8 w-24" />
            </div>
            <div className="mt-3 flex flex-wrap gap-1">
              <Skeleton className="h-4 w-16 rounded-full" />
              <Skeleton className="h-4 w-20 rounded-full" />
              <Skeleton className="h-4 w-24 rounded-full" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {jobs.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          <p>No job listings found. Try adjusting your filters.</p>
          <Button 
            variant="outline" 
            onClick={fetchJobs} 
            className="mt-4"
          >
            <Filter className="h-4 w-4 mr-2" />
            Refresh Jobs
          </Button>
        </div>
      ) : (
        <>
          {jobs.map((job) => (
            <div 
              key={job.id}
              className="border rounded-lg p-4 hover:bg-gray-50 transition-colors"
            >
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-medium text-lg">{job.title}</h3>
                  <div className="flex items-center mt-1 text-gray-600">
                    <Building className="h-4 w-4 mr-1" />
                    <span>{job.company}</span>
                  </div>
                </div>
                <Button size="sm" onClick={() => navigate("/jobs")}>View</Button>
              </div>
              
              <div className="flex flex-wrap items-center gap-x-4 mt-3 text-sm text-gray-500">
                <span className="flex items-center">
                  <MapPin className="h-4 w-4 mr-1" />
                  {job.location}
                </span>
                {job.salary && (
                  <span className="text-green-600 font-medium">
                    {job.salary}
                  </span>
                )}
                <div className="flex flex-wrap gap-1 mt-1">
                  {(job.keywords || []).slice(0, 3).map((keyword, index) => (
                    <span 
                      key={index} 
                      className="bg-blue-100 text-blue-800 px-2 py-0.5 rounded-full text-xs"
                    >
                      {keyword}
                    </span>
                  ))}
                </div>
                <span className="flex items-center ml-auto">
                  <Clock className="h-4 w-4 mr-1" />
                  {job.postedAt}
                </span>
              </div>
            </div>
          ))}
          <div className="flex justify-center mt-4">
            <Button onClick={() => navigate("/jobs")}>
              View All Jobs
            </Button>
          </div>
        </>
      )}
    </div>
  );
};

export default JobListings;
