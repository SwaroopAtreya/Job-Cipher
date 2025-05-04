
import { Button } from "@/components/ui/button";
import { FileText, Upload, Eye, Trash2 } from "lucide-react";
import { useState } from "react";

interface ResumeUploadProps {
  resumeUrl: string;
  onUpload: (event: React.ChangeEvent<HTMLInputElement>) => void;
  uploading: boolean;
}

export const ResumeUpload = ({ resumeUrl, onUpload, uploading }: ResumeUploadProps) => {
  const [uploadAttempted, setUploadAttempted] = useState(false);
  
  const handleFileInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    console.log("🔄 File input change detected");
    console.log("📄 Files:", event.target.files ? Array.from(event.target.files).map(f => f.name) : "No files");
    setUploadAttempted(true);
    
    try {
      console.log("🔄 Calling onUpload handler...");
      onUpload(event);
      console.log("✅ onUpload handler called successfully");
    } catch (error) {
      console.error("❌ Error in file input change handler:", error);
    }
  };
  
  const handleUploadClick = () => {
    console.log("🖱️ Upload button clicked, activating file input");
    const fileInput = document.getElementById('resume-upload');
    if (fileInput) {
      fileInput.click();
      console.log("✅ File input click triggered");
    } else {
      console.error("❌ Could not find resume-upload element");
    }
  };
  
  console.log("🔄 ResumeUpload rendering state:", { resumeUrl, uploading, uploadAttempted });
  
  return (
    <div>
      <h2 className="text-xl font-semibold mb-4">Resume</h2>
      <div className="border-2 border-dashed rounded-lg">
        <div className="p-6">
          {resumeUrl ? (
            <div className="space-y-4">
              <div className="flex items-center justify-center">
                <FileText className="h-12 w-12 text-primary" />
              </div>
              <p className="text-center text-sm text-gray-500">Resume uploaded successfully</p>
              <div className="flex flex-wrap justify-center gap-2">
                <Button asChild variant="outline" size="sm">
                  <a href={resumeUrl} target="_blank" rel="noopener noreferrer">
                    <Eye className="mr-2 h-4 w-4" />
                    View Resume
                  </a>
                </Button>
              </div>
            </div>
          ) : (
            <div className="text-center space-y-4">
              <div className="flex items-center justify-center">
                <FileText className="h-12 w-12 text-gray-300" />
              </div>
              <p className="text-sm text-gray-500">
                {uploadAttempted && uploading ? 
                  "Processing your resume..." : 
                  "No resume uploaded yet"}
              </p>
            </div>
          )}
          <div className="mt-4">
            <input
              id="resume-upload"
              type="file"
              accept=".pdf,.doc,.docx"
              className="hidden"
              onChange={handleFileInputChange}
              disabled={uploading}
              onClick={(e) => console.log("🖱️ File input clicked")}
            />
            <Button 
              variant="outline" 
              disabled={uploading}
              className="w-full cursor-pointer"
              onClick={handleUploadClick}
            >
              {uploading ? (
                <>
                  <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent"></div>
                  Uploading & Extracting...
                </>
              ) : resumeUrl ? (
                <>
                  <Upload className="mr-2 h-4 w-4" />
                  Replace Resume
                </>
              ) : (
                <>
                  <Upload className="mr-2 h-4 w-4" />
                  Upload Resume
                </>
              )}
            </Button>
          </div>
          <p className="mt-2 text-xs text-center text-gray-500">
            Supported formats: PDF, DOC, DOCX
          </p>
        </div>
      </div>
    </div>
  );
};
