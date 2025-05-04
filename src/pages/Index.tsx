import { Button } from "@/components/ui/button";
import Navbar from "@/components/Navbar";
import { ArrowRight, Search, Briefcase, Users, Award, MapPin } from "lucide-react";
import { useNavigate } from "react-router-dom";

const Index = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-white to-purple-50">
      <Navbar />
      
      {/* Hero Section */}
      <section className="relative pt-20 lg:pt-32 pb-16 px-4 sm:px-6 lg:px-8 overflow-hidden">
        <div className="absolute inset-0 bg-grid-pattern opacity-5" />
        <div className="max-w-7xl mx-auto relative">
          {/* Remove Logo section */}
          <div className="text-center space-y-8 animate-fade-up">
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold text-gray-900">
              Your Career Journey,{" "}
              <span className="bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent">
                Simplified
              </span>
            </h1>
            <p className="max-w-2xl mx-auto text-lg sm:text-xl text-gray-600">
              Upload your resume and let AI find your perfect job match across LinkedIn, Naukri, and more - all in one place.
            </p>

            {/* Search Bar */}
            <div className="max-w-3xl mx-auto bg-white p-2 rounded-full shadow-lg flex items-center gap-2">
              <div className="flex-1 flex items-center gap-2 px-4">
                <Search className="h-5 w-5 text-gray-400" />
                <input 
                  type="text"
                  placeholder="Job title, keywords, or company"
                  className="w-full py-2 focus:outline-none text-gray-800"
                />
              </div>
              <div className="flex-1 flex items-center gap-2 px-4 border-l">
                <MapPin className="h-5 w-5 text-gray-400" />
                <input 
                  type="text"
                  placeholder="Location"
                  className="w-full py-2 focus:outline-none text-gray-800"
                />
              </div>
              <Button 
                size="lg" 
                className="bg-primary hover:bg-primary-hover text-white rounded-full px-8"
                onClick={() => navigate('/dashboard')}
              >
                Search Jobs
              </Button>
            </div>

            <div className="flex flex-col sm:flex-row justify-center items-center gap-4 pt-4">
              <Button 
                size="lg" 
                className="bg-primary hover:bg-primary-hover text-white rounded-full"
                onClick={() => navigate('/dashboard')}
              >
                Upload Resume
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
              <Button 
                variant="outline" 
                size="lg"
                className="rounded-full"
              >
                Learn More
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Remove Stats Section and continue with Features Section */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900">
              Why Choose JobCipher?
            </h2>
            <p className="mt-4 text-lg text-gray-600">
              Get ahead in your career with our powerful features
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <FeatureCard key={index} {...feature} />
            ))}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900">
              How It Works
            </h2>
            <p className="mt-4 text-lg text-gray-600">
              Three simple steps to your next career move
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {steps.map((step, index) => (
              <StepCard key={index} number={index + 1} {...step} />
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};

// Component definitions
const StatsCard = ({ icon, number, label }) => (
  <div className="text-center p-6 bg-white rounded-2xl shadow-sm hover:shadow-md transition-shadow">
    <div className="inline-flex p-3 bg-primary/10 rounded-full mb-4">
      {icon}
    </div>
    <h3 className="text-3xl font-bold text-gray-900">{number}</h3>
    <p className="text-gray-600 mt-1">{label}</p>
  </div>
);

const FeatureCard = ({ icon, title, description }) => (
  <div className="bg-white p-6 rounded-2xl shadow-sm hover:shadow-md transition-all">
    <div className="inline-flex p-3 bg-primary/10 rounded-lg mb-4">
      {icon}
    </div>
    <h3 className="text-xl font-semibold text-gray-900 mb-2">{title}</h3>
    <p className="text-gray-600">{description}</p>
  </div>
);

const StepCard = ({ number, title, description }) => (
  <div className="relative bg-white p-6 rounded-2xl shadow-sm hover:shadow-md transition-all">
    <div className="absolute -top-4 left-6 w-8 h-8 bg-primary text-white rounded-full flex items-center justify-center font-bold">
      {number}
    </div>
    <h3 className="text-xl font-semibold text-gray-900 mt-4 mb-2">{title}</h3>
    <p className="text-gray-600">{description}</p>
  </div>
);

const features = [
  {
    title: "AI-Powered Matching",
    description: "Our AI analyzes your skills and experience to find the perfect job matches across platforms.",
    icon: (props: any) => (
      <svg
        {...props}
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M12 2v20M2 12h20" />
      </svg>
    ),
  },
  {
    title: "Multi-Platform Integration",
    description: "Access jobs from LinkedIn, Naukri, and more - all in one unified dashboard.",
    icon: (props: any) => (
      <svg
        {...props}
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <rect width="18" height="18" x="3" y="3" rx="2" />
        <path d="M3 9h18M9 21V9" />
      </svg>
    ),
  },
  {
    title: "Smart Recommendations",
    description: "Get personalized job recommendations based on your unique skill set and preferences.",
    icon: (props: any) => (
      <svg
        {...props}
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z" />
        <path d="M12 3a6 6 0 0 1-9 9 9 9 0 1 0 9-9Z" />
      </svg>
    ),
  },
];

const steps = [
  {
    title: "Upload Your Resume",
    description: "Simply upload your resume and let our AI extract your skills and experience.",
  },
  {
    title: "AI Analysis",
    description: "Our advanced AI analyzes your profile and matches you with relevant opportunities.",
  },
  {
    title: "Apply with Ease",
    description: "Apply to multiple jobs across platforms with just a few clicks.",
  },
];

export default Index;
