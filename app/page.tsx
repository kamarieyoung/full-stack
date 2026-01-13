"use client"

import { Box, Stack } from "@chakra-ui/react";
import { UserCard } from "@/components/UserCard";
import { useAppSelector } from "@/store/hooks";

export default function Home() {
  const users = useAppSelector((state) => state.users.users);

  return (
    <Box
      minH="100vh"
      display="flex"
      alignItems="center"
      justifyContent="center"
      padding={{ base: "4", md: "8" }}
      bg="bg.subtle"
    >
      <Stack
        gap="6"
        width="100%"
        maxW="1200px"
        alignItems="center"
      >
        {users.map((user) => (
          <UserCard key={user.id} user={user} />
        ))}
      </Stack>
    </Box>
  );
}
