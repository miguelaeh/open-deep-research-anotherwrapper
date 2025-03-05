import { NextRequest, NextResponse } from "next/server";

import { AIModel } from "@/lib/deep-research/ai/providers";
import { generateFeedback } from "@/lib/deep-research/feedback";
import { APICallError } from "ai";

export async function POST(req: NextRequest) {
  try {
    const { query, numQuestions, modelId = "openai/o3-mini" } = await req.json();

    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const brainLinkAccesstoken = authHeader.split(" ")[1];

    console.log("\n🔍 [FEEDBACK ROUTE] === Request Started ===");
    console.log("Query:", query);
    console.log("Model ID:", modelId);
    console.log("Number of Questions:", numQuestions);

    try {
      const questions = await generateFeedback({
        query,
        numQuestions,
        modelId: modelId as AIModel,
        apiKey: brainLinkAccesstoken,
      });

      console.log("\n✅ [FEEDBACK ROUTE] === Success ===");
      console.log("Generated Questions:", questions);
      console.log("Number of Questions Generated:", questions.length);

      return NextResponse.json({ questions });
    } catch (error) {
      console.error("\n❌ [FEEDBACK ROUTE] === Generation Error ===");
      console.error("Error:", error);

      if (error instanceof APICallError) {
        if (error.statusCode === 402) return NextResponse.json({ error: "Out of credits", details: "Please toup your BrainLink account"}, { status: 402 });
      }
      throw error;
    }
  } catch (error) {
    console.error("\n💥 [FEEDBACK ROUTE] === Route Error ===");
    console.error("Error:", error);

    return NextResponse.json(
      {
        error: "Feedback generation failed",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}
