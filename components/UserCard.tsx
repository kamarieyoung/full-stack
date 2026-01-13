"use client"

import { Avatar, Button, Card, HStack, Stack, Text } from "@chakra-ui/react"
import { useAppDispatch } from "@/store/hooks"
import { toggleFollow } from "@/store/slices/usersSlice"
import type { User } from "@/store/slices/usersSlice"

interface UserCardProps {
  user: User
}

export function UserCard({ user }: Readonly<UserCardProps>) {
  const dispatch = useAppDispatch()
  const { name, avatar, followed } = user

  return (
    <Card.Root
      width="100%"
      maxW={{ base: "100%", sm: "400px", md: "500px" }}
      variant="outline"
    >
      <Card.Body>
        <HStack
          gap={{ base: "3", md: "4" }}
          flexDirection={{ base: "column", sm: "row" }}
          alignItems={{ base: "center", sm: "flex-start" }}
        >
          <Avatar.Root size={{ base: "lg", md: "xl" }}>
            {avatar && <Avatar.Image src={avatar} />}
            <Avatar.Fallback name={name} />
          </Avatar.Root>

          <Stack
            gap="1"
            flex="1"
            alignItems={{ base: "center", sm: "flex-start" }}
            textAlign={{ base: "center", sm: "left" }}
          >
            <Text
              fontSize={{ base: "lg", md: "xl" }}
              fontWeight="semibold"
            >
              {name}
            </Text>
          </Stack>

          <Button
            size={{ base: "sm", md: "md" }}
            variant={followed ? "outline" : "solid"}
            colorPalette="blue"
            onClick={() => dispatch(toggleFollow(user.id))}
            width={{ base: "100%", sm: "auto" }}
          >
            {followed ? "已关注" : "关注"}
          </Button>
        </HStack>
      </Card.Body>
    </Card.Root>
  )
}
