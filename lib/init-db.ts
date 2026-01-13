import pool from "./db"

export async function initDatabase() {
  const client = await pool.connect()
  try {
    // 创建 students 表
    await client.query(`
      CREATE TABLE IF NOT EXISTS students (
        id SERIAL PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        age INTEGER NOT NULL,
        email VARCHAR(100) NOT NULL UNIQUE,
        phone VARCHAR(20),
        address TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `)

    // 创建更新时间触发器
    await client.query(`
      CREATE OR REPLACE FUNCTION update_updated_at_column()
      RETURNS TRIGGER AS $$
      BEGIN
        NEW.updated_at = CURRENT_TIMESTAMP;
        RETURN NEW;
      END;
      $$ language 'plpgsql';
    `)

    await client.query(`
      DROP TRIGGER IF EXISTS update_students_updated_at ON students;
      CREATE TRIGGER update_students_updated_at
      BEFORE UPDATE ON students
      FOR EACH ROW
      EXECUTE FUNCTION update_updated_at_column();
    `)

    console.log("数据库初始化成功")
  } catch (error) {
    console.error("数据库初始化失败:", error)
    throw error
  } finally {
    client.release()
  }
}
