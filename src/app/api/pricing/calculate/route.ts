import { db } from "@/lib/db";
import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { Client, TravelMode } from "@googlemaps/google-maps-services-js";
import { Decimal } from "@prisma/client/runtime/library";

const mapsClient = new Client({});

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  try {
    const body = await req.json();
    const { customerAddress, rampLength } = body;

    if (!customerAddress || !rampLength) {
      return new NextResponse("Missing customer address or ramp length", { status: 400 });
    }

    const settings = await db.settings.findUnique({ where: { id: "singleton" } });
    if (!settings || !settings.warehousePlaceId) {
      return new NextResponse("Warehouse settings are not configured.", { status: 500 });
    }

    // 1. Calculate distance
    const distanceResponse = await mapsClient.distancematrix({
      params: {
        origins: [`place_id:${settings.warehousePlaceId}`],
        destinations: [customerAddress],
        key: process.env.GOOGLE_MAPS_API_KEY!,
        travelMode: TravelMode.driving,
        units: "imperial",
      },
    });

    if (distanceResponse.data.rows[0].elements[0].status !== "OK") {
      return new NextResponse("Could not calculate distance to the customer address.", { status: 400 });
    }

    const distanceInMiles = distanceResponse.data.rows[0].elements[0].distance.value / 1609.34; // meters to miles

    // 2. Calculate fees
    const deliveryFee = new Decimal(distanceInMiles)
      .times(settings.costPerMile)
      .times(2) // Round trip
      .plus(settings.deliveryFlatFee);

    const installFee = new Decimal(rampLength)
      .times(settings.installFeePerFoot)
      .plus(settings.installFlatFee);

    const monthlyRate = new Decimal(rampLength)
      .times(settings.rentalPricePerFoot);

    const upfrontCost = deliveryFee.plus(installFee);

    return NextResponse.json({
      deliveryFee: deliveryFee.toFixed(2),
      installFee: installFee.toFixed(2),
      monthlyRate: monthlyRate.toFixed(2),
      upfrontCost: upfrontCost.toFixed(2),
      distance: distanceInMiles.toFixed(1),
    });

  } catch (error) {
    console.error("[PRICING_CALCULATION_POST]", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
} 