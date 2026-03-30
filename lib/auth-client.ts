import { createAuthClient } from "better-auth/react"

export const {useSession, resetPassword, requestPasswordReset, signOut} = createAuthClient();