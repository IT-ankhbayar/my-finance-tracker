import CredentialsProvider from "next-auth/providers/credentials";
import { createClient } from "@supabase/supabase-js";
import bcrypt from "bcryptjs";
import { JWT } from "next-auth/jwt";
import { User } from "next-auth";

// Supabase холболт
const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY! // Энэ түлхүүр заавал нууц байх ёстой
);

export const authOptions = {
    providers: [
        CredentialsProvider({
            name: "Credentials",
            credentials: {
                email: { label: "Email", type: "email" },
                password: { label: "Password", type: "password" }
            },
            async authorize(credentials) {
                if (!credentials?.email || !credentials?.password) {
                    throw new Error("Мэдээллээ бүрэн оруулна уу");
                }

                // 1. Supabase-ээс хэрэглэгчийг хайх
                const { data: user, error } = await supabase
                    .from("users")
                    .select("*")
                    .eq("email", credentials.email)
                    .single();

                if (error || !user) {
                    throw new Error("Хэрэглэгч олдсонгүй");
                }

                // 2. Нууц үг шалгах
                const isValid = await bcrypt.compare(credentials.password, user.password);

                if (!isValid) {
                    throw new Error("Нууц үг буруу байна");
                }

                // 3. Session-д хадгалах мэдээлэл
                return {
                    id: user.user_id,
                    email: user.email,
                    name: user.name,
                };
            }
        })
    ],
    callbacks: {
        // token болон user-т зориулсан төрлүүдийг зааж өгнө
        async jwt({ token, user }: { token: JWT; user?: User | any }) {
            if (user) {
                token.id = user.id;
            }
            return token;
        },

        // session болон token-т зориулсан төрлүүдийг зааж өгнө
        async session({ session, token }: { session: any; token: JWT }) {
            if (session.user) {
                session.user.id = token.id as string;
            }
            return session;
        }
    },
}