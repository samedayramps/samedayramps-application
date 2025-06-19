import { db } from '@/lib/db';
import { NextResponse } from 'next/server';

interface UpdateData {
  status?: 'PENDING' | 'AGREEMENT_SENT' | 'AGREEMENT_SIGNED' | 'INSTALLATION_SCHEDULED' | 'ACTIVE' | 'REMOVAL_SCHEDULED' | 'ON_HOLD' | 'COMPLETED' | 'CANCELLED';
  installationDate?: Date;
  removalDate?: Date;
  eSignaturesContractId?: string;
}

export async function PATCH(
  req: Request,
  { params: { id } }: { params: { id: string } }
) {
  try {
    const { action } = await req.json();

    const updateData: UpdateData = {};
    const rental = await db.rental.findUnique({
      where: { id },
      include: { customer: true, quote: true },
    });

    if (!rental) {
      return new NextResponse(JSON.stringify({ message: 'Rental not found' }), { status: 404 });
    }

    if (action === 'revertStage') {
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
          if (!process.env.ESIGNATURES_API_KEY || !process.env.ESIGNATURES_TEMPLATE_ID) {
            throw new Error('eSignatures API key or Template ID is not configured.');
          }

          const response = await fetch(`https://esignatures.com/api/contracts?token=${process.env.ESIGNATURES_API_KEY}`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              template_id: process.env.ESIGNATURES_TEMPLATE_ID,
              title: `Rental Agreement for ${rental.customer.firstName} ${rental.customer.lastName} - ${rental.quote?.installationAddress || 'N/A'}`,
              metadata: rental.id,
              test: process.env.NODE_ENV !== 'production' ? 'yes' : 'no',
              signers: [
                {
                  name: `${rental.customer.firstName} ${rental.customer.lastName}`,
                  email: rental.customer.email,
                },
              ],
              placeholder_fields: [
                {
                  api_key: "customer_name",
                  value: `${rental.customer.firstName} ${rental.customer.lastName}`
                },
                {
                  api_key: "installation_address",
                  value: rental.quote?.installationAddress || 'N/A'
                },
                {
                  api_key: "upfront_cost",
                  value: `$${rental.upfrontCost.toFixed(2)}`
                },
                {
                  api_key: "monthly_rate",
                  value: `$${rental.monthlyRate.toFixed(2)}`
                }
              ]
            }),
          });
          
          if (!response.ok) {
            const errorBody = await response.json();
            console.error('eSignatures.com Error:', errorBody);
            throw new Error(`Failed to create eSignature contract: ${errorBody.error_message || 'Unknown error'}`);
          }

          const responseData = await response.json();
          const contractId = responseData.data?.contract?.id;

          if (!contractId) {
             console.error('Could not find contract ID in eSignatures.com response:', responseData);
             throw new Error('Could not extract contract ID from eSignatures.com response.');
          }

          updateData.eSignaturesContractId = contractId;
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