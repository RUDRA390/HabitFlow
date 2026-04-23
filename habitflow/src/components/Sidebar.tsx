import { UserProfile } from "../types";

interface SidebarProps {
activeTab: string;
setActiveTab: (tab: string) => void;
profile: UserProfile | null;
navItems?: any[];
}

export default function Sidebar({
activeTab,
setActiveTab,
profile,
navItems = [],
}: SidebarProps) {

const safeNav = Array.isArray(navItems) ? navItems : [];

return ( <aside className="hidden lg:flex flex-col w-72 bg-card border-r p-6">

```
  {/* PROFILE */}
  {profile && (
    <div className="mb-6">
      <h2 className="text-xl font-bold">{profile.displayName || "User"}</h2>
      <p className="text-sm text-gray-400">{profile.title}</p>
      <p className="text-xs">Level {profile.level}</p>
    </div>
  )}

  {/* NAV */}
  <nav className="flex-1 space-y-2">
    {safeNav.map((item) => {
      const Icon = item.icon;

      return (
        <button
          key={item.id}
          onClick={() => setActiveTab(item.id)}
          className={`w-full flex items-center gap-3 px-4 py-2 rounded ${
            activeTab === item.id
              ? "bg-primary text-white"
              : "hover:bg-white/10"
          }`}
        >
          {Icon && <Icon className="w-5 h-5" />}
          <span>{item.label}</span>
        </button>
      );
    })}
  </nav>

</aside>
```

);
}
