"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import {
  LayoutDashboard,
  Plane,
  AlertTriangle,
  BarChart3,
  Upload,
  Settings,
  ChevronLeft,
  ChevronRight,
  Brain,
} from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";

interface NavItem {
  icon: React.ReactNode;
  label: string;
  id: string;
  href?: string;
}

const navItems: NavItem[] = [
  { icon: <LayoutDashboard size={20} />, label: "Dashboard", id: "dashboard" },
  { icon: <Plane size={20} />, label: "Flights", id: "flights" },
  { icon: <Brain size={20} />, label: "3D Optimizer", id: "optimizer", href: "/optimizer" },
  { icon: <AlertTriangle size={20} />, label: "Alerts", id: "alerts" },
  { icon: <BarChart3 size={20} />, label: "Analytics", id: "analytics" },
  { icon: <Upload size={20} />, label: "Upload", id: "upload" },
];

interface SidebarProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

export default function Sidebar({ activeTab, onTabChange }: SidebarProps) {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <motion.aside
      initial={{ width: 240 }}
      animate={{ width: collapsed ? 72 : 240 }}
      transition={{ duration: 0.3 }}
      className="h-screen bg-cyber-bg border-r border-cyber-cyan/30 flex flex-col"
    >
      {/* Logo */}
      <div className="p-4 border-b border-cyber-cyan/20">
        <motion.div
          initial={{ opacity: 1 }}
          animate={{ opacity: collapsed ? 0 : 1 }}
          className="flex items-center gap-3"
        >
          <div className="w-10 h-10 bg-cyber-card border border-cyber-cyan rounded flex items-center justify-center">
            <Plane className="text-cyber-cyan" size={24} />
          </div>
          {!collapsed && (
            <div>
              <h1 className="font-display text-cyber-cyan text-lg font-bold tracking-wider">
                SKYLOAD
              </h1>
              <p className="text-[10px] text-cyber-cyan/60 font-mono tracking-widest">
                ANALYZER v1.0
              </p>
            </div>
          )}
        </motion.div>
        {collapsed && (
          <div className="w-10 h-10 bg-cyber-card border border-cyber-cyan rounded flex items-center justify-center mx-auto">
            <Plane className="text-cyber-cyan" size={24} />
          </div>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-3">
        <ul className="space-y-2">
          {navItems.map((item) => (
            <li key={item.id}>
              {item.href ? (
                <Link
                  href={item.href}
                  className={cn(
                    "w-full flex items-center gap-3 px-3 py-3 rounded transition-all duration-300 group",
                    "hover:bg-cyber-card border border-transparent hover:border-cyber-magenta/30",
                    "bg-cyber-magenta/5 border-cyber-magenta/20"
                  )}
                >
                  <span className="text-cyber-magenta group-hover:text-cyber-magenta">
                    {item.icon}
                  </span>
                  {!collapsed && (
                    <span className="font-body text-sm tracking-wide text-cyber-magenta group-hover:text-white">
                      {item.label}
                    </span>
                  )}
                </Link>
              ) : (
                <button
                  onClick={() => onTabChange(item.id)}
                  className={cn(
                    "w-full flex items-center gap-3 px-3 py-3 rounded transition-all duration-300 group",
                    activeTab === item.id
                      ? "bg-cyber-cyan/10 border border-cyber-cyan/50 shadow-neon-cyan-sm"
                      : "hover:bg-cyber-card border border-transparent hover:border-cyber-cyan/20"
                  )}
                >
                  <span
                    className={cn(
                      "transition-colors",
                      activeTab === item.id
                        ? "text-cyber-cyan"
                        : "text-gray-400 group-hover:text-cyber-cyan"
                    )}
                  >
                    {item.icon}
                  </span>
                  {!collapsed && (
                    <span
                      className={cn(
                        "font-body text-sm tracking-wide transition-colors",
                        activeTab === item.id
                          ? "text-cyber-cyan font-semibold"
                          : "text-gray-400 group-hover:text-white"
                      )}
                    >
                      {item.label}
                    </span>
                  )}
                </button>
              )}
            </li>
          ))}
        </ul>
      </nav>

      {/* Settings & Collapse */}
      <div className="p-3 border-t border-cyber-cyan/20">
        <button
          className="w-full flex items-center gap-3 px-3 py-3 rounded hover:bg-cyber-card transition-colors group"
        >
          <Settings size={20} className="text-gray-400 group-hover:text-cyber-cyan" />
          {!collapsed && (
            <span className="font-body text-sm text-gray-400 group-hover:text-white">
              Settings
            </span>
          )}
        </button>
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="w-full flex items-center justify-center gap-3 px-3 py-2 mt-2 rounded border border-cyber-cyan/20 hover:border-cyber-cyan/50 transition-colors"
        >
          {collapsed ? (
            <ChevronRight size={16} className="text-cyber-cyan" />
          ) : (
            <>
              <ChevronLeft size={16} className="text-cyber-cyan" />
              <span className="font-mono text-xs text-cyber-cyan">COLLAPSE</span>
            </>
          )}
        </button>
      </div>
    </motion.aside>
  );
}

