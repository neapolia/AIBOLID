import { NextResponse } from 'next/server';
import { getInvoiceDetails } from '@/app/lib/actions';

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const invoice = await getInvoiceDetails(params.id);
    
    if (!invoice) {
      return new NextResponse('Invoice not found', { status: 404 });
    }

    return NextResponse.json(invoice);
  } catch (error) {
    console.error('Error fetching invoice details:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
} 