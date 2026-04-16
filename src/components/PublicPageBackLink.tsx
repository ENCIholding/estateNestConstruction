import { ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

type PublicPageBackLinkProps = {
  label?: string;
  to?: string;
};

export default function PublicPageBackLink({
  label = "Back to home",
  to = "/",
}: PublicPageBackLinkProps) {
  return (
    <Button
      asChild
      variant="ghost"
      className="mb-6 rounded-full px-0 text-sm font-semibold text-enc-text-secondary hover:bg-transparent hover:text-enc-orange"
    >
      <Link to={to}>
        <ArrowLeft className="mr-2 h-4 w-4" />
        {label}
      </Link>
    </Button>
  );
}
