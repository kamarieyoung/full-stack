import pool from "../lib/db"
import { initDatabase } from "../lib/init-db"

// 生成随机中文姓名
const surnames = ["张", "王", "李", "赵", "刘", "陈", "杨", "黄", "周", "吴", "徐", "孙", "马", "朱", "胡", "林", "郭", "何", "高", "罗"]
const givenNames = ["伟", "芳", "娜", "秀英", "敏", "静", "丽", "强", "磊", "军", "洋", "勇", "艳", "杰", "娟", "涛", "明", "超", "秀兰", "霞", "平", "刚", "桂英"]

function generateChineseName(): string {
  const surname = surnames[Math.floor(Math.random() * surnames.length)]
  const givenName1 = givenNames[Math.floor(Math.random() * givenNames.length)]
  const givenName2 = Math.random() > 0.5 ? givenNames[Math.floor(Math.random() * givenNames.length)] : ""
  return surname + givenName1 + givenName2
}

// 生成随机邮箱
function generateEmail(name: string, index: number): string {
  const domains = ["gmail.com", "qq.com", "163.com", "sina.com", "outlook.com", "yahoo.com"]
  const domain = domains[Math.floor(Math.random() * domains.length)]
  const namePart = name.toLowerCase().replace(/\s+/g, "") + index
  return `${namePart}@${domain}`
}

// 生成随机电话
function generatePhone(): string {
  const prefixes = ["130", "131", "132", "133", "134", "135", "136", "137", "138", "139", "150", "151", "152", "153", "155", "156", "157", "158", "159", "180", "181", "182", "183", "184", "185", "186", "187", "188", "189"]
  const prefix = prefixes[Math.floor(Math.random() * prefixes.length)]
  const suffix = Math.floor(10000000 + Math.random() * 90000000).toString()
  return prefix + suffix
}

// 生成随机地址
const cities = ["北京", "上海", "广州", "深圳", "杭州", "南京", "成都", "武汉", "西安", "重庆"]
const districts = ["朝阳区", "海淀区", "西城区", "东城区", "丰台区", "石景山区", "通州区", "昌平区"]

function generateAddress(): string {
  const city = cities[Math.floor(Math.random() * cities.length)]
  const district = districts[Math.floor(Math.random() * districts.length)]
  const street = Math.floor(Math.random() * 100) + 1
  const number = Math.floor(Math.random() * 200) + 1
  return `${city}市${district}${street}号${number}室`
}

// 生成随机年龄
function generateAge(): number {
  return Math.floor(Math.random() * (25 - 18 + 1)) + 18 // 18-25岁
}

async function seedStudents() {
  try {
    console.log("开始初始化数据库...")
    await initDatabase()
    console.log("数据库初始化完成")

    console.log("开始生成并插入 10000 条学生数据...")
    const batchSize = 100 // 每批插入 100 条
    const totalRecords = 10000
    const batches = Math.ceil(totalRecords / batchSize)

    for (let batch = 0; batch < batches; batch++) {
      const startIndex = batch * batchSize
      const endIndex = Math.min(startIndex + batchSize, totalRecords)
      const values: any[] = []
      const placeholders: string[] = []

      for (let i = startIndex; i < endIndex; i++) {
        const name = generateChineseName()
        const age = generateAge()
        const email = generateEmail(name, i)
        const phone = generatePhone()
        const address = generateAddress()

        const paramIndex = values.length + 1
        values.push(name, age, email, phone, address)
        placeholders.push(`($${paramIndex}, $${paramIndex + 1}, $${paramIndex + 2}, $${paramIndex + 3}, $${paramIndex + 4})`)
      }

      // 构建批量插入 SQL
      const sql = `
        INSERT INTO students (name, age, email, phone, address)
        VALUES ${placeholders.join(", ")}
      `

      await pool.query(sql, values)
      console.log(`已插入 ${endIndex} / ${totalRecords} 条记录`)
    }

    console.log("✅ 成功插入 10000 条学生数据！")
    process.exit(0)
  } catch (error) {
    console.error("❌ 插入数据失败:", error)
    process.exit(1)
  }
}

seedStudents()
