"use server";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";

export async function signInEmailAction(formData: FormData) {
    const email = String(formData.get("email"));
    if (!email) return { error: "Por favor, insira seu email." };
    const password = String(formData.get("password"));
    if (!password) return { error: "Por favor, insira sua senha." };

    try{
        await auth.api.signInEmail({
            headers: await headers(),
            body:{
                email,
                password
            }
        })

        //==
        // const setCookieHeader = res.headers.get("set-cookie");
        // if(setCookieHeader){

        // }
        //==


        return {error: null}
    } catch (err: any){
        const errorCode = err.body?.code;

        switch (errorCode) {
            case 'INVALID_EMAIL_OR_PASSWORD':
                return { error: "E-mail ou senha incorretos." };
            case 'USER_NOT_FOUND':
                return { error: "Usuário não encontrado." };
            default:
                return { error: "Erro ao tentar fazer login. Tente novamente." };
        }
        
        if (err instanceof Error){
            return {error: "Ocorreu um erro ao tentar fazer login: " + err.message};
        }

        return {error: "Erro interno"};
    }
}