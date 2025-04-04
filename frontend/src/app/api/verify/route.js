import { NextResponse } from "next/server";
import { verifyCloudProof } from "@worldcoin/idkit";

export async function POST(req) {
  try {
    const proof = await req.json();
    const verifyRes = await verifyCloudProof(
      proof,
      process.env.NEXT_PUBLIC_WORLDCOIN_APP_ID,
      process.env.NEXT_PUBLIC_WORLDCOIN_ACTION_ID
    );

    if (verifyRes.success) {
      return NextResponse.json({ success: true });
    } else {
      return NextResponse.json(
        { success: false, error: "Verification failed" },
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
