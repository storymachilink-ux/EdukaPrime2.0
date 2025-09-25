import { Button } from "./button";
import { KeyRound } from "lucide-react";

interface LoginButtonProps {
  onClick?: () => void;
}

export function LoginButton({ onClick }: LoginButtonProps) {
  return (
    <Button
      variant="outline"
      size="lg"
      onClick={onClick}
      className="group relative overflow-hidden border-border bg-surface text-ink hover:bg-accent"
    >
      <span className="mr-8 transition-opacity duration-500 group-hover:opacity-0">
        Login
      </span>
      <i className="absolute right-1 top-1 bottom-1 rounded-md z-10 grid w-1/4 place-items-center transition-all duration-500 bg-black/5 group-hover:w-[calc(100%-0.5rem)] group-active:scale-95">
        <KeyRound size={18} strokeWidth={2.5} aria-hidden="true" />
      </i>
    </Button>
  );
}