import { NextResponse } from 'next/server';
import { 
  getAllPayments, 
  createPayment, 
  updatePayment, 
  deletePayment,
  getPaymentById,
  getPaymentsSummary,
  getPaymentsByMonth 
} from '@/lib/db';

// GET /api/admin/payments - List payments with filters
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    
    // Parse filters
    const filters = {
      startDate: searchParams.get('startDate') || undefined,
      endDate: searchParams.get('endDate') || undefined,
      status: searchParams.get('status') || undefined,
      recorderId: searchParams.get('recorderId') || undefined,
    };
    
    // Check if requesting summary
    const summary = searchParams.get('summary');
    if (summary === 'true') {
      const paymentSummary = getPaymentsSummary();
      const monthly = getPaymentsByMonth();
      return NextResponse.json({ 
        summary: paymentSummary,
        monthly
      });
    }
    
    const payments = getAllPayments(filters);
    return NextResponse.json({ payments });
  } catch (error) {
    console.error('Error fetching payments:', error);
    return NextResponse.json(
      { error: 'Failed to fetch payments' },
      { status: 500 }
    );
  }
}

// POST /api/admin/payments - Create new payment
export async function POST(request: Request) {
  try {
    const body = await request.json();
    
    // Validation
    if (!body.paymentRecorderId || !body.amount || !body.date || !body.description) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }
    
    if (isNaN(body.amount) || body.amount <= 0) {
      return NextResponse.json(
        { error: 'Amount must be a positive number' },
        { status: 400 }
      );
    }
    
    const payment = createPayment({
      paymentRecorderId: body.paymentRecorderId,
      amount: parseFloat(body.amount),
      date: body.date,
      description: body.description,
      status: body.status || 'pending'
    });
    
    return NextResponse.json({ payment }, { status: 201 });
  } catch (error) {
    console.error('Error creating payment:', error);
    return NextResponse.json(
      { error: 'Failed to create payment' },
      { status: 500 }
    );
  }
}

// PATCH /api/admin/payments - Update payment
export async function PATCH(request: Request) {
  try {
    const body = await request.json();
    
    if (!body.id) {
      return NextResponse.json(
        { error: 'Payment ID is required' },
        { status: 400 }
      );
    }
    
    const existingPayment = getPaymentById(body.id);
    if (!existingPayment) {
      return NextResponse.json(
        { error: 'Payment not found' },
        { status: 404 }
      );
    }
    
    const updateData: any = {};
    if (body.paymentRecorderId !== undefined) updateData.paymentRecorderId = body.paymentRecorderId;
    if (body.amount !== undefined) updateData.amount = parseFloat(body.amount);
    if (body.date !== undefined) updateData.date = body.date;
    if (body.description !== undefined) updateData.description = body.description;
    if (body.status !== undefined) updateData.status = body.status;
    
    const payment = updatePayment(body.id, updateData);
    return NextResponse.json({ payment });
  } catch (error) {
    console.error('Error updating payment:', error);
    return NextResponse.json(
      { error: 'Failed to update payment' },
      { status: 500 }
    );
  }
}

// DELETE /api/admin/payments - Delete payment
export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    
    if (!id) {
      return NextResponse.json(
        { error: 'Payment ID is required' },
        { status: 400 }
      );
    }
    
    const success = deletePayment(parseInt(id));
    
    if (!success) {
      return NextResponse.json(
        { error: 'Payment not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting payment:', error);
    return NextResponse.json(
      { error: 'Failed to delete payment' },
      { status: 500 }
    );
  }
}
