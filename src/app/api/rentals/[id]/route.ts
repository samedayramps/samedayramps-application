import { db } from '@/lib/db';
import { NextResponse } from 'next/server';
import { RentalStatus } from '@prisma/client';

interface UpdateData {
  status?: RentalStatus;
  installationDate?: Date;
  removalDate?: Date;
}

export async function PATCH(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const { action } = await req.json();

    const updateData: UpdateData = {};

    if (action === 'revertStage') {
      const rental = await db.rental.findUnique({ where: { id } });
      if (!rental) {
        return new NextResponse(JSON.stringify({ message: 'Rental not found' }), { status: 404 });
      }

      switch (rental.status) {
        case 'AGREEMENT_SENT': updateData.status = 'PENDING'; break;
        case 'AGREEMENT_SIGNED': updateData.status = 'AGREEMENT_SENT'; break;
        case 'INSTALLATION_SCHEDULED': updateData.status = 'AGREEMENT_SIGNED'; break;
        case 'ACTIVE': updateData.status = 'INSTALLATION_SCHEDULED'; break;
        case 'REMOVAL_SCHEDULED': updateData.status = 'ACTIVE'; break;
        case 'COMPLETED': updateData.status = 'REMOVAL_SCHEDULED'; break;
        default: return new NextResponse(JSON.stringify({ message: 'Cannot revert from current status' }), { status: 400 });
      }
    } else {
      switch (action) {
        case 'sendAgreement':
          updateData.status = "AGREEMENT_SENT";
          break;
        case 'markAgreementSigned':
          updateData.status = "AGREEMENT_SIGNED";
          break;
        case 'scheduleInstallation':
          updateData.status = "INSTALLATION_SCHEDULED";
          break;
        case 'markInstalled':
          updateData.status = "ACTIVE";
          updateData.installationDate = new Date();
          break;
        case 'scheduleRemoval':
          updateData.status = "REMOVAL_SCHEDULED";
          break;
        case 'completeRemoval':
          updateData.status = "COMPLETED";
          updateData.removalDate = new Date();
          break;
        default:
          return new NextResponse(JSON.stringify({ message: 'Invalid action' }), { status: 400 });
      }
    }

    const updatedRental = await db.rental.update({
      where: { id },
      data: updateData,
      include: {
        customer: true,
        quote: true,
      },
    });

    return NextResponse.json(updatedRental);
  } catch (error) {
    console.error('[RENTAL_PATCH]', error);
    const errorMessage = error instanceof Error ? error.message : 'Internal Server Error';
    return new NextResponse(JSON.stringify({ message: errorMessage }), { status: 500 });
  }
} 