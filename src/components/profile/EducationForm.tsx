
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { collegeOptions, branchOptions, skillOptions } from "@/data/options";

interface EducationFormProps {
  college: string;
  branch: string;
  semester: number;
  skills: string[];
  onChange: (field: string, value: string | number) => void;
}

export const EducationForm = ({ college, branch, semester, skills, onChange }: EducationFormProps) => {
  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold">Education</h2>
      
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          College
        </label>
        <Select
          value={college}
          onValueChange={(value) => onChange('college', value)}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select your college" />
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              {collegeOptions.map((college) => (
                <SelectItem key={college} value={college}>
                  {college}
                </SelectItem>
              ))}
            </SelectGroup>
          </SelectContent>
        </Select>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Branch
        </label>
        <Select
          value={branch}
          onValueChange={(value) => onChange('branch', value)}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select your branch" />
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              {branchOptions.map((branch) => (
                <SelectItem key={branch} value={branch}>
                  {branch}
                </SelectItem>
              ))}
            </SelectGroup>
          </SelectContent>
        </Select>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Semester
        </label>
        <Select
          value={semester.toString()}
          onValueChange={(value) => onChange('semester', parseInt(value))}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select semester" />
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              {[1, 2, 3, 4, 5, 6, 7, 8].map((sem) => (
                <SelectItem key={sem} value={sem.toString()}>
                  {sem}
                </SelectItem>
              ))}
            </SelectGroup>
          </SelectContent>
        </Select>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Skills
        </label>
        <Select
          value={skills[0] || ""}
          onValueChange={(value) => onChange('skills', value)}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select your primary skill" />
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              {skillOptions.map((skill) => (
                <SelectItem key={skill} value={skill}>
                  {skill}
                </SelectItem>
              ))}
            </SelectGroup>
          </SelectContent>
        </Select>
      </div>
    </div>
  );
};
