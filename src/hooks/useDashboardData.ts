
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";

interface Job {
  id: string;
  title: string;
  company: string;
  location: string;
  salary_range: string;
  job_type: string;
}

interface Application {
  id: string;
  job_id: string;
  status: string;
  applied_at: string;
  job: Job;
}

export const useDashboardData = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [recentJobs, setRecentJobs] = useState<Job[]>([]);
  const [applications, setApplications] = useState<Application[]>([]);
  const [applicationStats, setApplicationStats] = useState({
    pending: 0,
    accepted: 0,
    rejected: 0
  });
  const [userSkills, setUserSkills] = useState<string[]>([]);

  useEffect(() => {
    checkUser();
    fetchRecentJobs();
    fetchApplications();
    fetchUserSkills();
  }, []);

  const checkUser = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      navigate("/auth");
    }
  };

  const fetchUserSkills = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('profiles')
        .select('skills')
        .eq('id', user.id)
        .single();

      if (error) throw error;
      if (data && data.skills) {
        setUserSkills(data.skills);
      }
    } catch (error: any) {
      console.error("Error fetching skills:", error);
    }
  };

  const fetchRecentJobs = async () => {
    try {
      const { data, error } = await supabase
        .from('jobs')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(3);

      if (error) throw error;
      setRecentJobs(data || []);
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to fetch recent jobs"
      });
    }
  };

  const fetchApplications = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('applications')
        .select(`
          *,
          job:jobs(*)
        `)
        .eq('user_id', user.id)
        .order('applied_at', { ascending: false });

      if (error) throw error;

      setApplications(data || []);
      
      // Calculate statistics
      const stats = (data || []).reduce((acc: any, app: Application) => {
        acc[app.status] = (acc[app.status] || 0) + 1;
        return acc;
      }, {});

      setApplicationStats({
        pending: stats.pending || 0,
        accepted: stats.accepted || 0,
        rejected: stats.rejected || 0
      });

    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to fetch applications"
      });
    }
  };

  return {
    recentJobs,
    applications,
    applicationStats,
    userSkills
  };
};
