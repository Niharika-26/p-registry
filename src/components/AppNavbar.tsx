import { IconUserPlus, IconUsersGroup } from "@tabler/icons-react";
import { ClipboardList } from "lucide-react";
import { NavLink, useLocation } from "react-router-dom";

export function AppNavbar() {
  const location = useLocation();

  const links = [
    {
      label: "Register Patient",
      href: "/register-patient",
      icon: IconUserPlus,
    },
    {
      label: "View Patients",
      href: "/",
      icon: IconUsersGroup,
    },
  ];

  return (
    <nav className="h-full w-[300px] p-4 flex flex-col bg-[#3B3B98]">
      <div className="flex items-center gap-2 text-xl font-bold mb-8 text-white">
        <ClipboardList className="w-6 h-6 text-blue-300" />
        <span>P-Registry</span>
      </div>

      <div className="flex-1">
        {links.map((item) => {
          const Icon = item.icon;
          const isActive =
            location.pathname === item.href ||
            (item.href === "/" && location.pathname === "/");

          return (
            <NavLink
              to={item.href}
              key={item.href}
              className={`
                flex items-center no-underline text-sm px-3 py-2 rounded-md font-medium mb-1
                ${
                  isActive
                    ? "bg-white text-[#3B3B98] shadow-sm"
                    : "text-white/100 hover:text-white hover:bg-[#3B3B98]/80"
                }
              `}
            >
              <Icon
                className={`w-5 h-5 mr-3 ${
                  isActive ? "text-[#3B3B98]" : "text-white/70"
                }`}
                stroke={1.5}
              />
              <span>{item.label}</span>
            </NavLink>
          );
        })}
      </div>
    </nav>
  );
}
