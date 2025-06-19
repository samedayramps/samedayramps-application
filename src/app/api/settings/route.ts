import { db } from "@/lib/db";
import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { Client } from "@googlemaps/google-maps-services-js";

const SETTINGS_ID = "singleton";
const mapsClient = new Client({});

// Helper to get or create settings
async function getSettings() {
  let settings = await db.settings.findUnique({
    where: { id: SETTINGS_ID },
  });

  if (!settings) {
    settings = await db.settings.create({
      data: {
        id: SETTINGS_ID,
        warehouseAddress: "1600 Amphitheatre Parkway, Mountain View, CA",
        costPerMile: 2.5,
        installFeePerFoot: 15,
        rentalPricePerFoot: 20,
        deliveryFlatFee: 50,
        installFlatFee: 100,
        warehouseFormattedAddress: "1600 Amphitheatre Pkwy, Mountain View, CA 94043, USA",
        warehousePlaceId: "ChIJ2eUgeAK6j4ARbn5u_wAGqWA",
      },
    });
  }
  return settings;
}

export async function GET() {
  const session = await auth();
  if (!session?.user) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  try {
    const settings = await getSettings();
    return NextResponse.json(settings);
  } catch (error) {
    console.error("[SETTINGS_GET]", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}

export async function PATCH(req: Request) {
  const session = await auth();
  if (!session?.user) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  try {
    const body = await req.json();
    const {
      warehouseAddress,
      costPerMile,
      installFeePerFoot,
      rentalPricePerFoot,
      deliveryFlatFee,
      installFlatFee,
    } = body;

    let validatedAddressData = {};

    // Only re-validate if the address has changed
    const currentSettings = await db.settings.findUnique({ where: { id: SETTINGS_ID } });
    if (warehouseAddress && warehouseAddress !== currentSettings?.warehouseAddress) {
      const geocodeResponse = await mapsClient.geocode({
        params: {
          address: warehouseAddress,
          key: process.env.GOOGLE_MAPS_API_KEY!,
        },
      });

      if (geocodeResponse.data.status !== "OK" || geocodeResponse.data.results.length === 0) {
        return new NextResponse("Invalid warehouse address. Please provide a valid address that Google Maps can recognize.", { status: 400 });
      }

      const { formatted_address, place_id } = geocodeResponse.data.results[0];
      validatedAddressData = {
        warehouseFormattedAddress: formatted_address,
        warehousePlaceId: place_id,
      };
    }

    const updatedSettings = await db.settings.update({
      where: { id: SETTINGS_ID },
      data: {
        warehouseAddress,
        costPerMile: parseFloat(costPerMile),
        installFeePerFoot: parseFloat(installFeePerFoot),
        rentalPricePerFoot: parseFloat(rentalPricePerFoot),
        deliveryFlatFee: parseFloat(deliveryFlatFee),
        installFlatFee: parseFloat(installFlatFee),
        ...validatedAddressData,
      },
    });

    return NextResponse.json(updatedSettings);
  } catch (error) {
    console.error("[SETTINGS_PATCH]", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
} 