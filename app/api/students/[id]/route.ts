import { NextRequest, NextResponse } from "next/server"
import pool from "@/lib/db"

// PUT - 更新学生信息
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await request.json()
    const { name, age, email, phone, address } = body

    if (!name || !age || !email) {
      return NextResponse.json(
        { error: "姓名、年龄和邮箱为必填项" },
        { status: 400 }
      )
    }

    const result = await pool.query(
      `UPDATE students 
       SET name = $1, age = $2, email = $3, phone = $4, address = $5
       WHERE id = $6
       RETURNING *`,
      [name, age, email, phone || null, address || null, id]
    )

    if (result.rows.length === 0) {
      return NextResponse.json(
        { error: "学生不存在" },
        { status: 404 }
      )
    }

    return NextResponse.json(result.rows[0])
  } catch (error: any) {
    console.error("更新学生失败:", error)
    if (error.code === "23505") {
      return NextResponse.json(
        { error: "邮箱已存在" },
        { status: 400 }
      )
    }
    return NextResponse.json(
      { error: "更新学生失败" },
      { status: 500 }
    )
  }
}

// DELETE - 删除学生
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const result = await pool.query(
      "DELETE FROM students WHERE id = $1 RETURNING *",
      [id]
    )

    if (result.rows.length === 0) {
      return NextResponse.json(
        { error: "学生不存在" },
        { status: 404 }
      )
    }

    return NextResponse.json({ message: "删除成功" })
  } catch (error) {
    console.error("删除学生失败:", error)
    return NextResponse.json(
      { error: "删除学生失败" },
      { status: 500 }
    )
  }
}
