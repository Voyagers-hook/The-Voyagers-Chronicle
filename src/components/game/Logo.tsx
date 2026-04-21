import logo from "@/assets/logo.png";

export function Logo({ className = "w-12 h-12" }: { className?: string }) {
  return <img src={logo} alt="Little Voyagers Project — The Voyagers Chronicle" className={className} />;
}
