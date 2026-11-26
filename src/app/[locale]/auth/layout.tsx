import { privateRobots } from "@/lib/seo";

export const metadata = privateRobots;

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
