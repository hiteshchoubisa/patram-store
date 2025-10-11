import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const phone = searchParams.get("phone");

    if (!phone) {
      return NextResponse.json({ error: "Phone number is required" }, { status: 400 });
    }

    // Clean the phone number (remove spaces, dashes, etc.)
    const cleanPhone = phone.replace(/\D/g, "");

    // Search for client by phone number
    const { data: clients, error } = await supabase
      .from("clients")
      .select("id, name, phone, address, email, city, pincode, state, country")
      .eq("phone", cleanPhone)
      .limit(1);

    if (error) {
      console.error("Supabase error:", error);
      return NextResponse.json({ error: "Database error" }, { status: 500 });
    }

    if (clients && clients.length > 0) {
      return NextResponse.json({ 
        found: true, 
        client: clients[0] 
      });
    } else {
      return NextResponse.json({ 
        found: false, 
        client: null 
      });
    }

  } catch (error) {
    console.error("Client search error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
