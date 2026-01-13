"use client"

import { useState, useEffect, useCallback, useMemo } from "react"
import { AgGridReact } from "ag-grid-react"
import type { ColDef, GetContextMenuItemsParams } from "ag-grid-community"
import "ag-grid-community/styles/ag-grid.css"
import "ag-grid-community/styles/ag-theme-alpine.css"
import "./ag-grid-custom.css"
import { initAgGrid } from "@/lib/ag-grid-config"

// 在模块加载时初始化 AG Grid（只在客户端执行）
if (globalThis.window !== undefined) {
  initAgGrid()
}
import {
  Box,
  Button,
  Container,
  Dialog,
  Field,
  Heading,
  HStack,
  Input,
  NumberInput,
  Stack,
  Textarea,
} from "@chakra-ui/react"
import { toaster } from "@/components/ui/toaster"

interface Student {
  id?: number
  name: string
  age: number
  email: string
  phone?: string
  address?: string
}

interface ActionButtonsProps {
  student: Student
  onEdit: (student: Student) => void
  onDelete: (id: number) => void
}

function ActionButtons({ student, onEdit, onDelete }: Readonly<ActionButtonsProps>) {
  return (
    <HStack gap="2">
      <Button
        size="xs"
        colorPalette="blue"
        variant="solid"
        fontWeight="medium"
        onClick={() => onEdit(student)}
      >
        编辑
      </Button>
      <Button
        size="xs"
        colorPalette="red"
        variant="solid"
        fontWeight="medium"
        onClick={() => onDelete(student.id!)}
      >
        删除
      </Button>
    </HStack>
  )
}

ActionButtons.displayName = "ActionButtons"

const createActionCellRenderer = (
  onEdit: (student: Student) => void,
  onDelete: (id: number) => void
) => {
  const CellRenderer = (params: { data: Student }) => (
    <ActionButtons
      student={params.data}
      onEdit={onEdit}
      onDelete={onDelete}
    />
  )
  CellRenderer.displayName = "ActionCellRenderer"
  return CellRenderer
}

export default function StudentsPage() {
  const [rowData, setRowData] = useState<Student[]>([])
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const [editingStudent, setEditingStudent] = useState<Student | null>(null)
  const [formData, setFormData] = useState<Student>({
    name: "",
    age: 18,
    email: "",
    phone: "",
    address: "",
  })
  // 获取学生列表
  const fetchStudents = useCallback(async () => {
    try {
      const response = await fetch("/api/students")
      if (!response.ok) throw new Error("获取学生列表失败")
      const data = await response.json()
      setRowData(data)
    } catch {
      toaster.error({
        title: "错误",
        description: "获取学生列表失败",
      })
    }
  }, [])

  useEffect(() => {
    fetchStudents()
  }, [fetchStudents])

  // 处理编辑
  const handleEdit = useCallback((student: Student) => {
    setEditingStudent(student)
    setFormData({
      name: student.name,
      age: student.age,
      email: student.email,
      phone: student.phone || "",
      address: student.address || "",
    })
    setIsEditing(true)
    setIsDialogOpen(true)
  }, [])

  // 处理删除
  const handleDelete = useCallback(async (id: number) => {
    if (!confirm("确定要删除这个学生吗？")) return

    try {
      const response = await fetch(`/api/students/${id}`, {
        method: "DELETE",
      })
      if (!response.ok) throw new Error("删除失败")
      toaster.success({
        title: "成功",
        description: "删除成功",
      })
      fetchStudents()
    } catch {
      toaster.error({
        title: "错误",
        description: "删除失败",
      })
    }
  }, [fetchStudents])

  // AG Grid Enterprise 右键菜单配置
  const getContextMenuItems = useCallback(
    (params: GetContextMenuItemsParams) => {
      const student = params.node?.data as Student
      if (!student) return []

      return [
        {
          name: "编辑",
          action: () => {
            handleEdit(student)
          },
          icon: '<span class="ag-icon ag-icon-edit"></span>',
        },
        {
          name: "删除",
          action: () => {
            if (student.id) {
              handleDelete(student.id)
            }
          },
          icon: '<span class="ag-icon ag-icon-trash"></span>',
          cssClasses: ["ag-menu-item-danger"],
        },
      ]
    },
    [handleEdit, handleDelete]
  )

  // 列定义
  const columnDefs: ColDef[] = useMemo(() => [
    { field: "id", headerName: "ID", width: 80, sortable: true },
    { field: "name", headerName: "姓名", width: 120, editable: false },
    { field: "age", headerName: "年龄", width: 100, editable: false },
    { field: "email", headerName: "邮箱", width: 200, editable: false },
    { field: "phone", headerName: "电话", width: 150, editable: false },
    { field: "address", headerName: "地址", flex: 1, editable: false },
    {
      headerName: "操作",
      width: 200,
      cellRenderer: createActionCellRenderer(handleEdit, handleDelete),
    },
  ], [handleEdit, handleDelete])

  // 处理表单提交
  const handleSubmit = async () => {
    if (!formData.name || !formData.email) {
      toaster.error({
        title: "错误",
        description: "请填写必填项",
      })
      return
    }

    try {
      const url = isEditing
        ? `/api/students/${editingStudent?.id}`
        : "/api/students"
      const method = isEditing ? "PUT" : "POST"

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || "操作失败")
      }

      toaster.success({
        title: "成功",
        description: isEditing ? "更新成功" : "创建成功",
      })

      setIsDialogOpen(false)
      setFormData({
        name: "",
        age: 18,
        email: "",
        phone: "",
        address: "",
      })
      setIsEditing(false)
      setEditingStudent(null)
      fetchStudents()
    } catch (error) {
      const message = error instanceof Error ? error.message : "操作失败"
      toaster.error({
        title: "错误",
        description: message,
      })
    }
  }

  // 重置表单
  const handleReset = () => {
    setFormData({
      name: "",
      age: 18,
      email: "",
      phone: "",
      address: "",
    })
    setIsEditing(false)
    setEditingStudent(null)
  }

  return (
    <Box
      height="100vh"
      width="100%"
      display="flex"
      flexDirection="column"
      overflow="hidden"
      bg="white"
    >
      <Container maxW="1400px" width="100%" height="100%" display="flex" flexDirection="column" py="4" px="6">
        <HStack justify="space-between" mb="4" flexShrink={0}>
          <Heading size="xl" color="gray.800" fontWeight="bold">
            学生信息管理
          </Heading>
          <Button
            colorPalette="blue"
            size="md"
            onClick={() => {
              handleReset()
              setIsDialogOpen(true)
            }}
          >
            新增学生
          </Button>
        </HStack>

        <Box
          className="ag-theme-alpine"
          flex="1"
          minHeight="0"
          width="100%"
          style={{
            borderRadius: "8px",
            overflow: "visible",
            boxShadow: "0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)"
          }}
        >
          <AgGridReact
            rowData={rowData}
            columnDefs={columnDefs}
            theme="legacy"
            defaultColDef={{
              sortable: true,
              filter: true,
              resizable: true,
            }}
            pagination={false}
            animateRows={true}
            getContextMenuItems={getContextMenuItems}
          />
        </Box>
      </Container>

      <Dialog.Root
        open={isDialogOpen}
        onOpenChange={(e) => {
          setIsDialogOpen(e.open)
          if (!e.open) {
            handleReset()
          }
        }}
      >
        <Dialog.Backdrop />
        <Dialog.Positioner>
          <Dialog.Content>
            <Dialog.Header color="gray.800" fontWeight="semibold" fontSize="lg">
              {isEditing ? "编辑学生" : "新增学生"}
            </Dialog.Header>
            <Dialog.Body>
              <Stack gap="4">
                <Field.Root required>
                  <Field.Label color="gray.700" fontWeight="medium">姓名 *</Field.Label>
                  <Input
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                    placeholder="请输入姓名"
                  />
                </Field.Root>

                <Field.Root required>
                  <Field.Label color="gray.700" fontWeight="medium">年龄 *</Field.Label>
                  <NumberInput.Root
                    value={formData.age.toString()}
                    onValueChange={(e) =>
                      setFormData({ ...formData, age: Number.parseInt(e.value) || 18 })
                    }
                    min={1}
                    max={150}
                  >
                    <NumberInput.Control />
                    <NumberInput.Input />
                  </NumberInput.Root>
                </Field.Root>

                <Field.Root required>
                  <Field.Label color="gray.700" fontWeight="medium">邮箱 *</Field.Label>
                  <Input
                    type="email"
                    value={formData.email}
                    onChange={(e) =>
                      setFormData({ ...formData, email: e.target.value })
                    }
                    placeholder="请输入邮箱"
                  />
                </Field.Root>

                <Field.Root>
                  <Field.Label color="gray.700" fontWeight="medium">电话</Field.Label>
                  <Input
                    value={formData.phone}
                    onChange={(e) =>
                      setFormData({ ...formData, phone: e.target.value })
                    }
                    placeholder="请输入电话"
                  />
                </Field.Root>

                <Field.Root>
                  <Field.Label color="gray.700" fontWeight="medium">地址</Field.Label>
                  <Textarea
                    value={formData.address}
                    onChange={(e) =>
                      setFormData({ ...formData, address: e.target.value })
                    }
                    placeholder="请输入地址"
                    rows={3}
                  />
                </Field.Root>
              </Stack>
            </Dialog.Body>
            <Dialog.Footer>
              <HStack gap="2">
                <Button
                  variant="outline"
                  onClick={() => {
                    setIsDialogOpen(false)
                    handleReset()
                  }}
                >
                  取消
                </Button>
                <Button colorPalette="blue" onClick={handleSubmit}>
                  {isEditing ? "更新" : "创建"}
                </Button>
              </HStack>
            </Dialog.Footer>
          </Dialog.Content>
        </Dialog.Positioner>
      </Dialog.Root>
    </Box>
  )
}
