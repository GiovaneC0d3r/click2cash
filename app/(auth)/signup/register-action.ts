"use server";
import { auth } from "@/lib/auth";
export async function signUpEmailAction(formData: FormData) {
    const name = String(formData.get("name"));
    if (!name) return { error: "Por favor, insira seu nome." };

    const email = String(formData.get("email"));
    if (!email) return { error: "Por favor, insira seu email." };

    const password = String(formData.get("password"));
    if (!password) return { error: "Por favor, insira sua senha." };
    try {
        await auth.api.signUpEmail({
        body: { name, email, password },
        });
        
        return { error: null };
    } catch (error: any) {
        // 1. Log para debug no servidor
        console.error("Signup error detail:", error.body?.code);

        // 2. Personalização das mensagens baseada no código de erro
        const errorCode = error.body?.code;

        switch (errorCode) {
        case 'USER_ALREADY_EXISTS_USE_ANOTHER_EMAIL':
            return { error: "Este e-mail já está cadastrado. Tente outro ou faça login." };
        
        case 'INVALID_EMAIL':
            return { error: "O formato do e-mail é inválido." };
        
        case 'PASSWORD_TOO_SHORT':
            return { error: "A senha precisa ser mais forte (mínimo 8 caracteres)." };
        
        default:
            // Mensagem genérica para erros desconhecidos ou de rede
            return { error: "Ocorreu um erro ao criar sua conta. Tente novamente mais tarde." };
        }
    }

    return {error: "Internal server error"}

}

