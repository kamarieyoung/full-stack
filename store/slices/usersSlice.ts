import { createSlice, type PayloadAction } from "@reduxjs/toolkit"

export interface User {
  id: string
  name: string
  avatar?: string
  followed: boolean
}

interface UsersState {
  users: User[]
}

const initialState: UsersState = {
  users: [
    {
      id: "1",
      name: "张三",
      avatar: "https://i.pravatar.cc/150?img=12",
      followed: false,
    },
    {
      id: "2",
      name: "李四",
      avatar: "https://i.pravatar.cc/150?img=33",
      followed: false,
    },
    {
      id: "3",
      name: "王五",
      followed: false,
    },
  ],
}

const usersSlice = createSlice({
  name: "users",
  initialState,
  reducers: {
    toggleFollow: (state, action: PayloadAction<string>) => {
      const user = state.users.find((u) => u.id === action.payload)
      if (user) {
        user.followed = !user.followed
      }
    },
    addUser: (state, action: PayloadAction<Omit<User, "id">>) => {
      const newUser: User = {
        ...action.payload,
        id: Date.now().toString(),
      }
      state.users.push(newUser)
    },
    removeUser: (state, action: PayloadAction<string>) => {
      state.users = state.users.filter((u) => u.id !== action.payload)
    },
  },
})

export const { toggleFollow, addUser, removeUser } = usersSlice.actions
export default usersSlice.reducer
