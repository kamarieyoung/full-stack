import { NextRequest, NextResponse } from "next/server"
import pool from "@/lib/db"
import { initDatabase } from "@/lib/init-db"

// 初始化数据库（仅在第一次调用时）
let dbInitialized = false

async function ensureDbInitialized() {
  if (!dbInitialized) {
    try {
      await initDatabase()
      dbInitialized = true
    } catch (error: any) {
      console.error("数据库初始化错误:", error)
      throw new Error(`数据库初始化失败: ${error?.message || "未知错误"}`)
    }
  }
}

// GET - 获取所有学生
export async function GET() {
  try {
    await ensureDbInitialized()
    const result = await pool.query("SELECT * FROM students ORDER BY id DESC")
    return NextResponse.json(result.rows)
  } catch (error: any) {
    console.error("获取学生列表失败:", error)
    const errorMessage = error?.message || "获取学生列表失败"
    return NextResponse.json(
      { error: errorMessage, details: error?.code },
      { status: 500 }
    )
  }
}

// POST - 创建新学生
export async function POST(request: NextRequest) {
  try {
    await ensureDbInitialized()
    const body = await request.json()
    const { name, age, email, phone, address } = body

    if (!name || !age || !email) {
      return NextResponse.json(
        { error: "姓名、年龄和邮箱为必填项" },
        { status: 400 }
      )
    }

    // 验证年龄是数字
    const ageNum = Number.parseInt(String(age), 10)
    if (isNaN(ageNum) || ageNum <= 0) {
      return NextResponse.json(
        { error: "年龄必须是正整数" },
        { status: 400 }
      )
    }

    const result = await pool.query(
      `INSERT INTO students (name, age, email, phone, address)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING *`,
      [name, ageNum, email, phone || null, address || null]
    )

    return NextResponse.json(result.rows[0], { status: 201 })
  } catch (error: any) {
    console.error("创建学生失败:", error)
    console.error("错误详情:", {
      message: error?.message,
      code: error?.code,
      detail: error?.detail,
      stack: error?.stack,
    })
    
    if (error.code === "23505") {
      // 唯一约束违反
      return NextResponse.json(
        { error: "邮箱已存在" },
        { status: 400 }
      )
    }
    
    if (error.code === "ECONNREFUSED" || error.code === "ENOTFOUND") {
      return NextResponse.json(
        { error: "数据库连接失败，请确保 PostgreSQL 正在运行" },
        { status: 500 }
      )
    }
    
    return NextResponse.json(
      { 
        error: "创建学生失败",
        details: error?.message || "未知错误",
        code: error?.code
      },
      { status: 500 }
    )
  }
}
