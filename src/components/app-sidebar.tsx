"use client"

import * as React from "react"
import {
  IconDashboard,
  IconFileText,
  IconChecklist,
  IconBuilding,
  IconChartBar,
  IconShield,
  IconSearch,
  IconHelp,
  IconSettings,
  IconBookmark,
  IconDownload,
  IconCalendar,
  IconBell,
  IconMessage,
} from "@tabler/icons-react"

import { NavDocuments } from "@/components/nav-documents"
import { NavMain } from "@/components/nav-main"
import { NavSecondary } from "@/components/nav-secondary"
import { NavUser } from "@/components/nav-user"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"

const data = {
  user: {
    name: "John Doe",
    email: "john.doe@standardbank.co.bw",
    avatar: "/avatars/user.jpg",
  },
  navMain: [
    {
      title: "Dashboard",
      url: "/dashboard",
      icon: IconDashboard,
    },
    {
      title: "Documents",
      url: "/documents",
      icon: IconFileText,
    },
    {
      title: "Compliance Checklist",
      url: "/checklist",
      icon: IconChecklist,
    },
    {
      title: "Authorities",
      url: "/authorities",
      icon: IconBuilding,
    },
    {
      title: "Analytics",
      url: "/analytics",
      icon: IconChartBar,
    },
  ],
  navClouds: [
    {
      title: "Bank of Botswana",
      icon: IconShield,
      isActive: false,
      url: "/authorities/bob",
      items: [
        {
          title: "Banking Regulations",
          url: "/authorities/bob/banking",
        },
        {
          title: "Monetary Policy",
          url: "/authorities/bob/monetary",
        },
        {
          title: "Supervision Guidelines",
          url: "/authorities/bob/supervision",
        },
      ],
    },
    {
      title: "NBFIRA",
      icon: IconShield,
      url: "/authorities/nbfira",
      items: [
        {
          title: "Insurance Regulations",
          url: "/authorities/nbfira/insurance",
        },
        {
          title: "Pension Guidelines",
          url: "/authorities/nbfira/pension",
        },
        {
          title: "Market Conduct",
          url: "/authorities/nbfira/conduct",
        },
      ],
    },
    {
      title: "FIA",
      icon: IconShield,
      url: "/authorities/fia",
      items: [
        {
          title: "AML Guidelines",
          url: "/authorities/fia/aml",
        },
        {
          title: "Reporting Requirements",
          url: "/authorities/fia/reporting",
        },
        {
          title: "Compliance Forms",
          url: "/authorities/fia/forms",
        },
      ],
    },
  ],
  navSecondary: [
    {
      title: "Search",
      url: "/search",
      icon: IconSearch,
    },
    {
      title: "FAQ",
      url: "/faq",
      icon: IconHelp,
    },
    {
      title: "Support",
      url: "/support",
      icon: IconMessage,
    },
    {
      title: "Settings",
      url: "/settings",
      icon: IconSettings,
    },
  ],
  documents: [
    {
      name: "My Bookmarks",
      url: "/bookmarks",
      icon: IconBookmark,
    },
    {
      name: "Downloads",
      url: "/downloads",
      icon: IconDownload,
    },
    {
      name: "Regulatory Calendar",
      url: "/calendar",
      icon: IconCalendar,
    },
    {
      name: "Notifications",
      url: "/notifications",
      icon: IconBell,
    },
  ],
  authorities: [
    {
      name: "Bank of Botswana",
      url: "/authorities/bob",
      icon: IconShield,
    },
    {
      name: "NBFIRA",
      url: "/authorities/nbfira", 
      icon: IconShield,
    },
    {
      name: "FIA",
      url: "/authorities/fia",
      icon: IconShield,
    },
  ],
}

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  return (
    <Sidebar collapsible="offcanvas" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              asChild
              className="data-[slot=sidebar-menu-button]:!p-1.5"
            >
              <a href="/dashboard">
                <IconShield className="!size-5 text-blue-600" />
                <span className="text-base font-semibold">Financial Regulatory Portal</span>
              </a>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={data.navMain} />
        <NavDocuments items={data.authorities} />
        <NavDocuments items={data.documents} />
        <NavSecondary items={data.navSecondary} className="mt-auto" />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={data.user} />
      </SidebarFooter>
    </Sidebar>
  )
}