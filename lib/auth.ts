import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
// If your Prisma file is located elsewhere, you can change the path
import prisma from "./prisma";
import { sendEmail } from "./mail";
import { nextCookies } from "better-auth/next-js";



export const auth = betterAuth({
    emailAndPassword:{
        enabled: true,
        sendResetPassword: async ({ user, url, token }, request) => {
            // Chamada da nossa função importada
            await sendEmail({
                to: user.email,
                subject: "Recuperação de Senha",
                text: `Clique no link para resetar sua senha: ${url}`,
                html: `<strong>Recuperação de Senha</strong><p>Clique no link abaixo:</p><a href="${url}">${url}</a>`,
            });
        } 
    },
    database: prismaAdapter(prisma, {
        provider: "postgresql", // or "mysql", "postgresql", ...etc
    }),
    plugins:[nextCookies()]
});