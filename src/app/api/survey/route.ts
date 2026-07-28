import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

const BASE_START_COUNT = 213;
const TARGET_GOAL = 500;

// Global in-memory counter map for instant increment resilience across server requests
const memoryCounts: Record<string, number> = {};

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

    // Always increment in-memory counter for instant guaranteed bump
    memoryCounts[countryName] = (memoryCounts[countryName] || 0) + 1;

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
      console.warn("Database storage warning (proceeding with memory increment):", dbError);
    }

    // Count in DB
    let dbCount = 0;
    try {
      dbCount = await prisma.surveyResponse.count({
        where: { country: countryName },
      });
    } catch {
      // Fallback
    }

    const effectiveAdditions = Math.max(dbCount, memoryCounts[countryName] || 1);
    const countForCountry = BASE_START_COUNT + effectiveAdditions;

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

export async function PATCH(req: Request) {
  try {
    const body = await req.json();
    const { id, email, country } = body;

    if (!email || !email.includes("@")) {
      return NextResponse.json({ error: "Invalid email" }, { status: 400 });
    }

    const cleanEmail = String(email).trim();

    if (id && typeof id === "string" && !id.startsWith("local-")) {
      try {
        await prisma.surveyResponse.update({
          where: { id },
          data: { email: cleanEmail },
        });
      } catch (e) {
        console.warn("Could not update survey response by ID:", e);
      }
    } else {
      // Find the most recent response without an email for this country
      try {
        const latest = await prisma.surveyResponse.findFirst({
          where: { country: String(country || "United States"), email: null },
          orderBy: { createdAt: "desc" },
        });

        if (latest) {
          await prisma.surveyResponse.update({
            where: { id: latest.id },
            data: { email: cleanEmail },
          });
        }
      } catch (e) {
        console.warn("Could not attach email to latest survey response:", e);
      }
    }

    return NextResponse.json({
      success: true,
      message: "Email saved successfully",
    });
  } catch (error) {
    console.error("Survey email update error:", error);
    return NextResponse.json(
      { error: "Failed to save email" },
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

    const effectiveAdditions = Math.max(dbCount, memoryCounts[country] || 0);

    return NextResponse.json({
      country,
      countForCountry: BASE_START_COUNT + effectiveAdditions,
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
