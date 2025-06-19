import { db } from "@/lib/db";
import { NextResponse } from "next/server";
import { sendAgreementSignedNotification } from "@/lib/email";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const event = body.event;
    
    // Log all incoming events for debugging purposes
    console.log('eSignatures.io Webhook Event Received:', event);
    console.log('Payload:', body.data);

    if (event === 'contract-signed') {
      const contractData = body.data?.contract;
      const contractId = contractData?.id;
      const signedPdfUrl = contractData?.contract_pdf_url;

      if (!contractId) {
        return NextResponse.json({ message: 'Contract ID missing in webhook payload' }, { status: 400 });
      }

      // Find the rental associated with this contract
      const rental = await db.rental.findFirst({
        where: { eSignaturesContractId: contractId },
        include: {
          customer: true, // Include customer to get their name for the email
        },
      });

      if (rental) {
        const updateData: { status: 'AGREEMENT_SIGNED', signedAgreementUrl?: string } = {
          status: 'AGREEMENT_SIGNED',
        };

        if (signedPdfUrl) {
          updateData.signedAgreementUrl = signedPdfUrl;
        }

        // Only update and send email if the status is not already AGREEMENT_SIGNED
        if (rental.status !== 'AGREEMENT_SIGNED') {
          await db.rental.update({
            where: { id: rental.id },
            data: updateData,
          });
          console.log(`Rental ${rental.id} status updated to AGREEMENT_SIGNED and PDF URL saved.`);

          // Send email notification
          const customerName = `${rental.customer.firstName} ${rental.customer.lastName}`;
          await sendAgreementSignedNotification(rental.id, customerName, 'ty@samedayramps.com');
        } else {
          console.log(`Rental ${rental.id} was already marked as signed. Ignoring webhook.`);
        }
      } else {
        console.warn(`Webhook received for unknown contract ID: ${contractId}`);
      }
    }

    // Acknowledge receipt of the webhook
    return NextResponse.json({ message: 'Webhook received successfully' }, { status: 200 });

  } catch (error) {
    console.error('[ESIGNATURES_WEBHOOK_ERROR]', error);
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
    return NextResponse.json(JSON.stringify({ message: 'Webhook handler failed', error: errorMessage }), { status: 500 });
  }
} 