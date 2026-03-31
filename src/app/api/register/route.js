import { createClient } from "@supabase/supabase-js";
import bcrypt from "bcrypt";
import { NextResponse } from "next/server";

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
);

export async function POST(req) {
    try {
        const { email, password, name } = await req.json();

        // 1. Нууц үг hash хийх
        const hashedPassword = await bcrypt.hash(password, 10);

        // 2. Supabase руу insert хийх
        const { data, error } = await supabase
            .from("users")
            .insert([{ email, password: hashedPassword, name }])
            .select();

        if (error) {
            return NextResponse.json({ error: error.message }, { status: 400 });
        }

        return NextResponse.json({ message: "Амжилттай бүртгэгдлээ" }, { status: 201 });
    } catch (err) {
        return NextResponse.json({ error: "Серверийн алдаа гарлаа" }, { status: 500 });
    }
}