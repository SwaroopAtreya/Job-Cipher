
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { LogOut, Save } from "lucide-react";
import { ProfilePicture } from "@/components/profile/ProfilePicture";
import { EducationForm } from "@/components/profile/EducationForm";
import { useFileUpload } from "@/hooks/useFileUpload";

const Profile = () => {
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState({
    full_name: "",
    avatar_url: "",
    title: "",
    contact_number: "",
    location: "",
    college: "",
    branch: "",
    semester: 1,
    skills: [] as string[],
    bio: "",
    referral_code: "",
    resume_url: "",
  });
  const [saving, setSaving] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();
  const { handleFileUpload, uploadingImage } = useFileUpload();

  useEffect(() => {
    getProfile();
  }, []);

  const getProfile = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        navigate("/auth");
        return;
      }

      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single();

      if (error) throw error;

      if (data) {
        setProfile({
          full_name: data.full_name || "",
          avatar_url: data.avatar_url || "",
          title: data.title || "",
          contact_number: data.contact_number || "",
          location: data.location || "",
          college: data.college || "",
          branch: data.branch || "",
          semester: data.semester || 1,
          skills: data.skills || [],
          bio: data.bio || "",
          referral_code: data.referral_code || "",
          resume_url: data.resume_url || "",
        });
      }
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message,
      });
    } finally {
      setLoading(false);
    }
  };

  const updateProfile = async () => {
    try {
      setSaving(true);
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) throw new Error("No user logged in");

      const { error } = await supabase
        .from("profiles")
        .update({
          ...profile,
          updated_at: new Date().toISOString(),
        })
        .eq("id", user.id);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Profile updated successfully!",
      });

      // Redirect to dashboard after successful save
      navigate("/dashboard");
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message,
      });
    } finally {
      setSaving(false);
    }
  };

  const handleSignOut = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      navigate("/auth");
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message,
      });
    }
  };

  const handleFieldChange = (field: string, value: string | number) => {
    if (field === 'skills') {
      setProfile(prev => ({ ...prev, [field]: [value as string] }));
    } else {
      setProfile(prev => ({ ...prev, [field]: value }));
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Loading...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="max-w-7xl mx-auto mt-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-2xl font-bold">My Profile</h1>
          <Button
            variant="outline"
            onClick={handleSignOut}
            className="gap-2"
          >
            <LogOut className="w-4 h-4" />
            Sign Out
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="space-y-6 bg-white/80 backdrop-blur-md rounded-xl p-6 border border-gray-100">
            <div className="flex flex-col items-center space-y-4">
              <ProfilePicture
                avatarUrl={profile.avatar_url}
                onUpload={(e) => handleFileUpload(e, 'avatar', (url) => setProfile(prev => ({ ...prev, avatar_url: url })))}
                uploading={uploadingImage}
              />
              
              <div className="w-full space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Full Name
                  </label>
                  <Input
                    value={profile.full_name}
                    onChange={(e) => handleFieldChange('full_name', e.target.value)}
                    placeholder="Enter your full name"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Professional Title
                  </label>
                  <Input
                    value={profile.title}
                    onChange={(e) => handleFieldChange('title', e.target.value)}
                    placeholder="e.g. Software Engineer"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Contact Number
                  </label>
                  <Input
                    value={profile.contact_number}
                    onChange={(e) => handleFieldChange('contact_number', e.target.value)}
                    placeholder="Enter your contact number"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Location
                  </label>
                  <Input
                    value={profile.location}
                    onChange={(e) => handleFieldChange('location', e.target.value)}
                    placeholder="e.g. San Francisco, CA"
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-6 bg-white/80 backdrop-blur-md rounded-xl p-6 border border-gray-100">
            <EducationForm
              college={profile.college}
              branch={profile.branch}
              semester={profile.semester}
              skills={profile.skills}
              onChange={handleFieldChange}
            />
          </div>

          <div className="space-y-6 bg-white/80 backdrop-blur-md rounded-xl p-6 border border-gray-100">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Bio
              </label>
              <Textarea
                value={profile.bio}
                onChange={(e) => handleFieldChange('bio', e.target.value)}
                placeholder="Write a short bio about yourself"
                className="h-32"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Referral Code (optional)
              </label>
              <Input
                value={profile.referral_code}
                onChange={(e) => handleFieldChange('referral_code', e.target.value)}
                placeholder="Enter referral code"
              />
            </div>
          </div>
        </div>

        <div className="mt-8 flex justify-end">
          <Button
            onClick={updateProfile}
            disabled={saving}
            className="gap-2"
          >
            <Save className="w-4 h-4" />
            {saving ? "Saving..." : "Save Changes"}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Profile;
