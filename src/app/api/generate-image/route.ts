import { NextRequest, NextResponse } from "next/server";
import { generateImage } from "@/lib/hf";

export const runtime = "nodejs";
export const maxDuration = 120;

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as {
      prompt?: string;
      model?: string;
      width?: number;
      height?: number;
      negativePrompt?: string;
    };

    if (!body.prompt) {
      return NextResponse.json({ error: "prompt is required" }, { status: 400 });
    }

    const dataUrl = await generateImage({
      prompt: body.prompt,
      model: body.model,
      width: body.width,
      height: body.height,
      negativePrompt: body.negativePrompt,
    });

    return NextResponse.json({ image: dataUrl });
  } catch (err) {
    console.error("Image generation error:", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Image generation failed" },
      { status: 500 }
    );
  }
}