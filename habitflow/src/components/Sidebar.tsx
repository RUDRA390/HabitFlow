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

// 🔥 HARD SAFETY
const safeNav = Array.isArray(navItems) ? navItems : [];

return ( <aside className="hidden lg:flex flex-col w-72 bg-card border-r p-6">

```
  {/* PROFILE */}
  {profile && (
    <div className="mb-6">
      <h2 className="text-xl font-bold">
        {profile.displayName || "User"}
      </h2>
      <p className="text-sm text-gray-400">
        {profile.title || "Beginner"}
      </p>
      <p className="text-xs">
        Level {profile.level || 1}
      </p>
    </div>
  )}

  {/* NAVIGATION */}
  <nav className="flex-1 space-y-2">

    {/* 🔥 EMPTY STATE */}
    {safeNav.length === 0 && (
      <p className="text-gray-400 text-sm">No Navigation</p>
    )}

    {safeNav.map((item, index) => {

      // 🔥 CRASH PROTECTION
      if (!item || !item.id) return null;

      const Icon = item.icon;

      return (
        <button
          key={item.id || index}
          onClick={() => setActiveTab(item.id)}
          className={`w-full flex items-center gap-3 px-4 py-2 rounded transition ${
            activeTab === item.id
              ? "bg-primary text-white"
              : "hover:bg-white/10"
          }`}
        >
          {/* 🔥 ICON SAFE */}
          {Icon ? <Icon className="w-5 h-5" /> : null}

          <span>{item.label || "Item"}</span>
        </button>
      );
    })}
  </nav>

</aside>
```

);
}
