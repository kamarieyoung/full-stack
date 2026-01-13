import { Pool } from "pg"

const pool = new Pool({
  host: "localhost",
  port: 5432,
  user: process.env.DB_USER || "postgres",
  password: process.env.DB_PASSWORD || "qj782991",
  database: process.env.DB_NAME || "postgres",
  // 添加连接超时和重试配置
  connectionTimeoutMillis: 5000,
  idleTimeoutMillis: 30000,
  max: 20,
})

// 测试连接
pool.on("error", (err) => {
  console.error("数据库连接错误:", err)
})

export default pool
