import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.7.1";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }
  
  try {
    // Extract job search parameters from request
    const searchParams = await req.json();
    console.log("Job search parameters:", searchParams);
    
    // Directly use the updated EC2 IP address
    const AWS_SERVER_URL = "http://52.66.253.153:5000/job-search";
    
    // Prepare parameters for the AWS EC2 service - match the Python script format
    const jobData = {
      name: searchParams.name || "",
      College: searchParams.College || "",
      Branch: searchParams.Branch || "",
      keyword: searchParams.keyword || "",
      location: searchParams.location || "india",
      experience: searchParams.experience || 0,
      job_type: searchParams.job_type || "fulltime",
      remote: searchParams.remote || "on-site",
      date_posted: searchParams.date_posted || "1 week",
      company: searchParams.company || "",
      industry: searchParams.industry || "",
      ctc_filters: searchParams.ctc_filters || "",
      radius: searchParams.radius || "10"
    };
    
    console.log("Sending job search request to AWS:", jobData);
    
    let jsonData = [];
    let usedMockData = false;
    
    try {
      // Make the request to the AWS server with an increased timeout
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 45000); // 45 second timeout
      
      const response = await fetch(AWS_SERVER_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(jobData),
        signal: controller.signal
      }).catch(error => {
        console.error("Network error during fetch:", error.message);
        throw new Error(`Network error: ${error.message}`);
      });
      
      clearTimeout(timeoutId);
      
      console.log("AWS response status:", response.status);
      
      if (!response.ok) {
        const errorText = await response.text().catch(e => "Could not read error response");
        console.error("AWS error response:", errorText);
        throw new Error(`Job search service error: ${response.statusText} (${response.status})`);
      }
      
      // Get response text (CSV data)
      const csvData = await response.text().catch(e => {
        console.error("Error reading response text:", e);
        throw new Error("Failed to read response data");
      });
      
      console.log("Received CSV data of length:", csvData?.length || 0);
      
      // If CSV is empty or invalid, use mock data
      if (!csvData || csvData.trim() === "" || !csvData.includes(',')) {
        console.log("No valid CSV data received, using mock data");
        jsonData = getMockJobData();
        usedMockData = true;
      } else {
        // Convert CSV to JSON
        const rows = csvData.split('\n');
        if (rows.length <= 1) {
          console.log("CSV has insufficient rows, using mock data");
          jsonData = getMockJobData();
          usedMockData = true;
        } else {
          const headers = rows[0].split(',').map(header => header.trim());
          console.log("CSV Headers:", headers);
          
          jsonData = rows.slice(1)
            .filter(row => row.trim())
            .map(row => {
              // Split by comma, but handle commas within quotes
              const values = [];
              let currentValue = '';
              let insideQuote = false;
              
              for (let i = 0; i < row.length; i++) {
                const char = row[i];
                if (char === '"') {
                  insideQuote = !insideQuote;
                } else if (char === ',' && !insideQuote) {
                  values.push(currentValue.trim());
                  currentValue = '';
                } else {
                  currentValue += char;
                }
              }
              values.push(currentValue.trim());
              
              // Create job object with header mappings
              const jobObject = {};
              headers.forEach((header, index) => {
                if (index < values.length) {
                  jobObject[header] = values[index].replace(/^"|"$/g, '');
                } else {
                  jobObject[header] = "";
                }
              });
              
              return jobObject;
          });
          
          console.log(`Processed ${jsonData.length} job results`);
        }
      }
    } catch (fetchError) {
      console.error("Fetch error:", fetchError.message);
      jsonData = getMockJobData();
      usedMockData = true;
      console.log("Using mock data due to fetch error");
    }
    
    // Return the data (either from AWS or mock)
    return new Response(
      JSON.stringify({ 
        success: true, 
        data: jsonData,
        mock: usedMockData
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
    );
    
  } catch (error) {
    console.error("Error in job search:", error);
    return new Response(
      JSON.stringify({ 
        error: error.message,
        success: false,
        data: getMockJobData(),
        mock: true
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
    );
  }
});

// Mock job data for when the AWS service is unavailable
function getMockJobData() {
  return [
    {
      job_title: "Frontend Developer",
      company_name: "TechSolutions Inc",
      location: "Bangalore, India",
      job_link: "https://example.com/job/1",
      date_posted: "1 day ago",
      skills: "React|JavaScript|TypeScript|HTML|CSS",
      salary: "₹10-15 LPA"
    },
    {
      job_title: "Full Stack Engineer",
      company_name: "Digital Innovations",
      location: "Mumbai, India",
      job_link: "https://example.com/job/2",
      date_posted: "3 days ago",
      skills: "Node.js|React|MongoDB|Express|JavaScript",
      salary: "₹15-20 LPA"
    },
    {
      job_title: "Software Developer",
      company_name: "Global Systems",
      location: "Delhi, India",
      job_link: "https://example.com/job/3",
      date_posted: "5 days ago",
      skills: "Java|Spring Boot|SQL|REST API|Git",
      salary: "₹12-18 LPA"
    },
    {
      job_title: "UI/UX Designer",
      company_name: "Creative Solutions",
      location: "Hyderabad, India",
      job_link: "https://example.com/job/4",
      date_posted: "2 days ago",
      skills: "Figma|Adobe XD|UI Design|Wireframing|Prototyping",
      salary: "₹8-14 LPA"
    },
    {
      job_title: "DevOps Engineer",
      company_name: "CloudTech Services",
      location: "Pune, India",
      job_link: "https://example.com/job/5",
      date_posted: "1 week ago",
      skills: "AWS|Docker|Kubernetes|CI/CD|Linux",
      salary: "₹18-25 LPA"
    }
  ];
}
