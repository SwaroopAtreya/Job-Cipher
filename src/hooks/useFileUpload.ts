
import { useState } from "react";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";

type FileType = 'avatar' | 'resume';

export const useFileUpload = () => {
  const [uploadingImage, setUploadingImage] = useState(false);
  const [uploadingResume, setUploadingResume] = useState(false);
  const { toast } = useToast();

  const handleFileUpload = async (
    event: React.ChangeEvent<HTMLInputElement>,
    type: FileType,
    onSuccess: (url: string) => void
  ) => {
    try {
      if (!event.target.files || event.target.files.length === 0) {
        throw new Error("Please select a file to upload.");
      }

      if (type === 'avatar') {
        setUploadingImage(true);
      } else {
        setUploadingResume(true);
      }

      const file = event.target.files[0];

      // Validate file type for resumes
      if (type === 'resume') {
        const validTypes = ['.pdf', '.doc', '.docx'];
        const fileExt = '.' + file.name.split('.').pop()?.toLowerCase();
        if (!validTypes.includes(fileExt)) {
          throw new Error("Please upload a PDF, DOC, or DOCX file.");
        }
      }

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("No user logged in");

      const fileExt = file.name.split('.').pop();
      const fileName = type === 'resume' 
        ? `${user.id}/default_resume.${fileExt}`
        : `${user.id}/${crypto.randomUUID()}.${fileExt}`;

      const bucket = type === 'avatar' ? 'avatars' : 'resumes';

      // For resumes, always use upsert to allow overwriting
      const { error: uploadError } = await supabase.storage
        .from(bucket)
        .upload(fileName, file, { 
          upsert: type === 'resume',
          cacheControl: '3600'
        });

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from(bucket)
        .getPublicUrl(fileName);

      const { error: updateError } = await supabase
        .from('profiles')
        .update({ [type === 'avatar' ? 'avatar_url' : 'resume_url']: publicUrl })
        .eq('id', user.id);

      if (updateError) throw updateError;

      onSuccess(publicUrl);
      toast({
        title: "Success",
        description: `${type === 'avatar' ? 'Profile picture' : 'Default resume'} updated successfully!`,
      });
    } catch (error: any) {
      console.error('Upload error:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "Failed to upload file",
      });
    } finally {
      if (type === 'avatar') {
        setUploadingImage(false);
      } else {
        setUploadingResume(false);
      }
    }
  };

  return {
    handleFileUpload,
    uploadingImage,
    uploadingResume
  };
};
