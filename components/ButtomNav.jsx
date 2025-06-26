"use client";

import { sidebarLinks } from "@constants/arrays";
// import { sidebarLinks } from "@constants/arrays";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";

function ButtomNav() {
  const pathname = usePathname();

  return (
    <section className="fixed bottom-0 z-10 w-full bg-primary p-2 xs:px-7">
      <div className="flex items-center justify-between gap-3 xs:gap-5">
        {sidebarLinks.map((link) => {
          const isActive =
            (pathname.includes(link.route) && link.route.length > 1) ||
            pathname === link.route;

          return (
            <Link
              href={link.route}
              key={link.label}
              className={`relative flex flex-col items-center gap-2 rounded-lg p-1 px-2 sm:flex-1 sm:px-2 sm:py-1 ${
                isActive && "bg-primary-500"
              }`}
            >
              <Image
                src={link.imgURL}
                alt={link.label}
                width={14}
                height={11}
                className="object-contain"
              />

              <p className="text-[10px] text-light-1 max-sm:">
                {link.label.split(/\s+/)[0]}
              </p>
            </Link>
          );
        })}
      </div>
    </section>
  );
}

export default ButtomNav;
