import React from "react";
import { matchPath } from "react-router-dom";
import { MdOutlineDashboardCustomize } from "react-icons/md";

/**
 * Sidebar groups (expandable menus).
 * A route joins a group by adding  parent: "<Group name>"  in routes.js.
 * To add another group later (e.g. "Test Management"), add it here
 * and put  parent: "Test Management"  on its child routes.
 */
export const SIDEBAR_GROUPS = {
  "Custom Template": { icon: <MdOutlineDashboardCustomize /> },
};

const DEFAULT_GROUP_ICON = <MdOutlineDashboardCustomize />;

const ROLE_LABELS = {
  admin: "Super Admin",
  operator: "Operator",
  moderator: "Moderator",
};

const readUserData = () => {
  try {
    return JSON.parse(localStorage.getItem("userData")) || {};
  } catch (error) {
    console.error("Error parsing userData from localStorage:", error);
    return {};
  }
};

export const getUserRole = () => readUserData().role || "";

export const getUserInfo = () => {
  const u = readUserData();
  const name = u.name || u.userName || u.username || u.fullName || u.empid || "User";
  return {
    name,
    initial: String(name).trim().charAt(0).toUpperCase() || "U",
    roleLabel: ROLE_LABELS[u.role] || u.role || "",
  };
};

/**
 * Same rule NavLink uses (segment-aware), so the highlighted link and the
 * group logic can never disagree. "/app/template" matches
 * "/app/template/create-template/5" but not "/app/template-v2".
 */
export const isRouteActive = (route, pathname) =>
  Boolean(matchPath({ path: route.layout + route.path, end: false }, pathname));

export const isGroupActive = (group, pathname) =>
  group.children.some((c) => isRouteActive(c, pathname));

/**
 * Turns the flat routes array into sidebar items:
 *   { type: "link",  route }
 *   { type: "group", name, icon, children: [route, ...] }
 * A group sits where its first child appears in routes.js.
 */
export const buildSidebarItems = (routes, userRole) => {
  const visible = routes.filter(
    (r) =>
      r.showInSidebar === true &&
      (!r.roles || r.roles.length === 0 || r.roles.includes(userRole))
  );

  const items = [];
  const groups = {};

  visible.forEach((route) => {
    if (route.parent) {
      if (!groups[route.parent]) {
        groups[route.parent] = {
          type: "group",
          name: route.parent,
          icon: SIDEBAR_GROUPS[route.parent]?.icon || DEFAULT_GROUP_ICON,
          children: [],
        };
        items.push(groups[route.parent]);
      }
      groups[route.parent].children.push(route);
    } else {
      items.push({ type: "link", route });
    }
  });

  return items;
};