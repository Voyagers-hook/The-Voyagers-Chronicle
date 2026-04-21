import logo from "@/assets/logo.png";

export const Logo = ({ className = "w-12 h-12" }: { className?: string }) => (
  <img src={logo} alt="Little Voyagers Project — The Voyagers Chronicle" className={className} />
);
