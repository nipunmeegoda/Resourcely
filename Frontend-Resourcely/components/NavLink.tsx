"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

type NavLinkProps = {
    href: string;
    label: string;
    icon?: React.ElementType; // optional icon component
};

const NavLink = ({ href, icon: Icon, label }: NavLinkProps) => {
    const pathname = usePathname();

    // Normalize trailing slashes so "/admin" === "/admin/"
    const normalize = (p: string) => {
        if (!p) return "/";
        const n = p.replace(/\/+$/, "");
        return n === "" ? "/" : n;
    };

    const isActive = normalize(pathname) === normalize(href);

    return (
        <Link
            href={href}
            className={`flex items-center gap-2 text-sm font-medium transition-colors ${
                isActive
                    ? "text-foreground font-semibold"
                    : "text-muted-foreground hover:text-foreground"
            }`}
        >
            {Icon && <Icon className="w-4 h-4" />}
            {label}
        </Link>
    );
};

export default NavLink;
