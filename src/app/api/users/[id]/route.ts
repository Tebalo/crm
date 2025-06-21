import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/db"
import { updateUserSchema } from "@/lib/validations/auth"
import bcrypt from "bcryptjs"

// GET /api/users/[id] - Get single user
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { id } = params

    // Users can view their own profile, admins/supervisors can view any
    if (session.user.id !== id && !["ADMIN", "SUPERVISOR"].includes(session.user.role!)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    const user = await prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        isActive: true,
        createdAt: true,
        updatedAt: true,
        _count: {
          select: {
            assignedCases: true,
            activities: true,
          }
        }
      }
    })

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    return NextResponse.json({ user })

  } catch (error) {
    console.error("Error fetching user:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}

// PUT /api/users/[id] - Update user
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { id } = params
    const body = await request.json()

    // Users can update their own profile (limited fields), admins can update any
    const canUpdateRole = session.user.role === "ADMIN"
    const canUpdateUser = session.user.id === id || canUpdateRole

    if (!canUpdateUser) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    // Validate input
    const validatedData = updateUserSchema.parse(body)

    // Remove role update if user is not admin
    if (!canUpdateRole && validatedData.role) {
      delete validatedData.role
    }

    // Handle password update if provided
    const updateData: any = { ...validatedData }
    if (body.password) {
      if (body.password.length < 8) {
        return NextResponse.json(
          { error: "Password must be at least 8 characters" },
          { status: 400 }
        )
      }
      updateData.password = await bcrypt.hash(body.password, 12)
    }

    const user = await prisma.user.update({
      where: { id },
      data: {
        ...updateData,
        updatedAt: new Date(),
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        isActive: true,
        updatedAt: true,
      }
    })

    return NextResponse.json({
      message: "User updated successfully",
      user
    })

  } catch (error) {
    console.error("Error updating user:", error)
    
    if (error instanceof Error && error.name === "ZodError") {
      return NextResponse.json(
        { error: "Invalid input data", details: error },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}

// DELETE /api/users/[id] - Deactivate user (soft delete)
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { id } = params

    // Prevent self-deletion
    if (session.user.id === id) {
      return NextResponse.json(
        { error: "Cannot deactivate your own account" },
        { status: 400 }
      )
    }

    // Soft delete by setting isActive to false
    const user = await prisma.user.update({
      where: { id },
      data: { isActive: false },
      select: {
        id: true,
        name: true,
        email: true,
        isActive: true,
      }
    })

    return NextResponse.json({
      message: "User deactivated successfully",
      user
    })

  } catch (error) {
    console.error("Error deactivating user:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}