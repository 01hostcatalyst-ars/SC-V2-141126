import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

const BASE_START_COUNT = 213;
const TARGET_GOAL = 500;

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const {
      country,
      currency,
      earningsBracket,
      platform,
      platforms,
      deliverables,
      niche,
      followerTier,
      engagementRate,
      dealScope,
      email,
    } = body;

    const countryName = String(country || "United States");
    const platformList = Array.isArray(platforms) && platforms.length > 0
      ? platforms
      : platform ? [String(platform)] : ["Instagram"];

    if (!countryName || !earningsBracket) {
      return NextResponse.json(
        { error: "Missing required survey fields" },
        { status: 400 }
      );
    }

    let createdId = "local-" + Date.now();
    try {
      const response = await prisma.surveyResponse.create({
        data: {
          country: countryName,
          currency: String(currency || "USD"),
          earningsBracket: String(earningsBracket),
          platform: platformList[0] || "Instagram",
          platforms: platformList,
          deliverables: deliverables ? (deliverables as object) : undefined,
          niche: String(niche || "Other"),
          followerTier: String(followerTier || "Under 5K"),
          engagementRate: String(engagementRate || "Don't Know"),
          dealScope: Array.isArray(dealScope) ? dealScope : [],
          email: email ? String(email).trim() : null,
        },
      });
      createdId = response.id;
    } catch (dbError) {
      console.warn("Database storage warning (proceeding optimistically):", dbError);
    }

    // Dynamic country counter logic: Starts at 213 + total submissions for country
    let dbCount = 0;
    try {
      dbCount = await prisma.surveyResponse.count({
        where: { country: countryName },
      });
    } catch {
      // Fallback
    }

    const countForCountry = BASE_START_COUNT + dbCount;

    return NextResponse.json({
      success: true,
      id: createdId,
      country: countryName,
      countForCountry,
      target: TARGET_GOAL,
    });
  } catch (error) {
    console.error("Survey submission API error:", error);
    return NextResponse.json(
      { error: "Failed to submit survey" },
      { status: 500 }
    );
  }
}

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const country = searchParams.get("country") || "United States";

    let dbCount = 0;
    try {
      dbCount = await prisma.surveyResponse.count({
        where: { country },
      });
    } catch {
      // Fallback
    }

    return NextResponse.json({
      country,
      countForCountry: BASE_START_COUNT + dbCount,
      target: TARGET_GOAL,
    });
  } catch (error) {
    console.error("Survey stats API error:", error);
    return NextResponse.json({
      country: "United States",
      countForCountry: BASE_START_COUNT,
      target: TARGET_GOAL,
    });
  }
}
