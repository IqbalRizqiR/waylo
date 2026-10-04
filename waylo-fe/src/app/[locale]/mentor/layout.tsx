import {MentorShell} from "@/components/mentor/mentor-shell";

export default function MentorLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <MentorShell>{children}</MentorShell>;
}
