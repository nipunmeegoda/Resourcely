import Link from "next/link";

type NavLinkProps = {
  href: string;
  label: string;
  icon?: React.ElementType; // optional icon component
};

const NavLink = ({ href, icon: Icon, label }: NavLinkProps) => (
  <Link
    href={href}
    className="flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
  >
    {Icon && <Icon className="w-4 h-4" />} {/* render only if icon exists */}
    {label}
  </Link>
);

export default NavLink;
