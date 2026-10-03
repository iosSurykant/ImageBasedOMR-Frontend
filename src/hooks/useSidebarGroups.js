import { useCallback, useEffect, useMemo, useState } from "react";
import { isGroupActive } from "config/sidebarItems";

/**
 * Open/closed state for sidebar groups, shared by Sidebar and TabletSidebar.
 *
 * A group auto-opens when the page changes to one of its children. The effect
 * depends on a string key (not on `items`), so a parent that passes a new
 * `routes` array every render can't re-open a group the user just closed.
 */
export const useSidebarGroups = (items, pathname) => {
  const [openGroups, setOpenGroups] = useState({});

  const activeKey = useMemo(
    () =>
      items
        .filter((i) => i.type === "group" && isGroupActive(i, pathname))
        .map((i) => i.name)
        .join("|"),
    [items, pathname]
  );

  useEffect(() => {
    if (!activeKey) return;
    setOpenGroups((prev) => {
      const next = { ...prev };
      activeKey.split("|").forEach((name) => {
        next[name] = true;
      });
      return next;
    });
  }, [activeKey]);

  const openGroup = useCallback((name) => setOpenGroups((p) => ({ ...p, [name]: true })), []);
  const toggleGroup = useCallback((name) => setOpenGroups((p) => ({ ...p, [name]: !p[name] })), []);

  return { openGroups, openGroup, toggleGroup };
};