import { NextResponse } from "next/server";

export async function POST(req) {
  try {
    const proof = await req.json();
    console.log('proof', proof);
    const response = await fetch(
      'https://developer.worldcoin.org/api/v2/verify/app_staging_129259332fd6f93d4fabaadcc5e4ff9d',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ ...proof, action: "test"}),
      }
    );

    if (response.ok) {
      const { verified } = await response.json();
      return NextResponse.json({ success: verified });
    } else {
      const { code, detail } = await response.json();
      return NextResponse.json(
        { success: false, error: `Error Code ${code}: ${detail}` },
        { status: 400 }
      );
    }
  } catch (error) {
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}
