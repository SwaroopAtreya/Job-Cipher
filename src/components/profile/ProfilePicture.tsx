
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Upload, User } from "lucide-react";

interface ProfilePictureProps {
  avatarUrl: string;
  onUpload: (event: React.ChangeEvent<HTMLInputElement>) => void;
  uploading: boolean;
}

export const ProfilePicture = ({ avatarUrl, onUpload, uploading }: ProfilePictureProps) => {
  return (
    <div className="relative">
      <Avatar className="w-24 h-24">
        <AvatarImage src={avatarUrl} />
        <AvatarFallback>
          <User className="w-12 h-12" />
        </AvatarFallback>
      </Avatar>
      <div className="absolute -bottom-2 -right-2">
        <label htmlFor="avatar-upload">
          <Button size="icon" className="rounded-full" disabled={uploading}>
            <Upload className="w-4 h-4" />
          </Button>
        </label>
        <input
          id="avatar-upload"
          type="file"
          accept="image/*"
          className="hidden"
          onChange={onUpload}
          disabled={uploading}
        />
      </div>
    </div>
  );
};
