import {
  BookOpen,
  BriefcaseBusiness,
  CodeXml,
  Cpu,
  Globe2,
  NotebookPen,
} from "lucide-react";
export function CategoryIcon({
  category,
  size = 20,
}: {
  category: string;
  size?: number;
}) {
  const Icon =
    (
      {
        Technology: Cpu,
        "Software Engineering": CodeXml,
        Tutorials: BookOpen,
        Career: BriefcaseBusiness,
        "Personal Notes": NotebookPen,
        "World News": Globe2,
      } as Record<string, typeof Cpu>
    )[category] || BookOpen;
  return <Icon size={size} strokeWidth={1.65} aria-hidden="true" />;
}
