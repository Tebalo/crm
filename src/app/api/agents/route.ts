import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/db"

// GET /api/agents - Get available agents for case assignment
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Only admins, supervisors, and agents can view agent list
    if (!["ADMIN", "SUPERVISOR", "AGENT"].includes(session.user.role!)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    const agents = await prisma.user.findMany({
      where: {
        role: { in: ["AGENT", "SUPERVISOR", "ADMIN"] },
        isActive: true,
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        _count: {
          select: {
            assignedCases: {
              where: {
                status: { in: ["OPEN", "IN_PROGRESS"] }
              }
            }
          }
        }
      },
      orderBy: [
        { role: "asc" }, // ADMIN, AGENT, SUPERVISOR alphabetically
        { name: "asc" }
      ]
    })

    // Format response with workload information
    const agentsWithWorkload = agents.map(agent => ({
      ...agent,
      activeCases: agent._count.assignedCases,
      workloadLevel: getWorkloadLevel(agent._count.assignedCases)
    }))

    return NextResponse.json({ agents: agentsWithWorkload })

  } catch (error) {
    console.error("Error fetching agents:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}

// Helper function to determine workload level
function getWorkloadLevel(caseCount: number): string {
  if (caseCount === 0) return "Available"
  if (caseCount <= 5) return "Light"
  if (caseCount <= 10) return "Moderate"
  if (caseCount <= 15) return "Heavy"
  return "Overloaded"
}