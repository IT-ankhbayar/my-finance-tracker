import NextAuth, { DefaultSession } from "next-auth";

declare module "next-auth" {
    /**
     * 'session' объект доторх 'user' төрлийг өргөтгөх
     */
    interface Session {
        user: {
            id: string;
        } & DefaultSession["user"];
    }

    /**
     * 'user' объект (authorize функцээс ирэх) төрлийг өргөтгөх
     */
    interface User {
        id: string;
    }
}

declare module "next-auth/jwt" {
    /**
     * JWT токен дотор 'id' байгааг TypeScript-д таниулах
     */
    interface JWT {
        id: string;
    }
}