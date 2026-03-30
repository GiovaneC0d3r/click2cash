import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
// Importe sua função de verificação de sessão (ajuste o caminho conforme seu projeto)
// No better-auth, geralmente você verifica a existência do cookie de sessão
import { auth } from "@/lib/auth"; 

export async function proxy(request: NextRequest) {
  // 1. Obter o cookie de sessão (o nome padrão do better-auth geralmente é "better-auth.session_token")
  // Verifique no seu navegador qual o nome exato do cookie salvo após o login
  const session = await auth.api.getSession({
    headers: request.headers
  });

  // 2. Se não houver cookie, redireciona para o login
  if (!session) {
    // É importante passar a URL original para que o Next saiba de onde veio o redirecionamento
    const loginUrl = new URL('/signin', request.url);
    
    // Opcional: Adicionar um parâmetro para redirecionar de volta após o login
    // loginUrl.searchParams.set('callbackUrl', request.nextUrl.pathname);
    
    return NextResponse.redirect(loginUrl);
  }

  // 3. Se o cookie existe, permite que a requisição continue
  return NextResponse.next();
}

// 4. Configurar quais rotas este Proxy deve proteger
export const config = {
  matcher: [
    '/dashboard/:path*', // Protege /dashboard e qualquer sub-rota como /dashboard/perfil
    '/settings/:path*',  // Você pode adicionar várias rotas aqui
  ],
}