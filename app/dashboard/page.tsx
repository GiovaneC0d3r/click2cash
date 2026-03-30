"use client"
import { useSession, signOut } from "@/lib/auth-client";
import { useRouter } from "next/navigation";
export default  function DashboardPage(){
    const session  = useSession();
    const router = useRouter();
    const handleSignOut = () => {
        signOut({
            fetchOptions:{
                onSuccess: ()=>{
                    router.push("/signin")
                }
            }
        });
    };

    return (
        <>
            <div>seja bem vindo {session?.data?.user.name}</div>
            <button onClick={handleSignOut}>Sair</button>
        </>
    )
}