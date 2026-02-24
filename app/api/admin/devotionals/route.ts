import { NextResponse } from 'next/server';
import {
  listDevotionals,
  createDevotional,
  getDevotionalById,
  updateDevotional,
  softDeleteDevotional,
  restoreDevotional,
  DevotionalInput
} from '@/lib/db';
import { requireAdmin } from '@/lib/auth';

// GET /api/admin/devotionals - List devotionals with filters
export async function GET(request: Request) {
  try {
    // Check admin auth
    await requireAdmin();

    const { searchParams } = new URL(request.url);
    
    // Parse filters
    const filters = {
      status: (searchParams.get('status') as 'draft' | 'published') || undefined,
      search: searchParams.get('search') || undefined,
      includeDeleted: searchParams.get('includeDeleted') === 'true',
    };

    const devotionals = listDevotionals(filters);
    return NextResponse.json({ devotionals });
  } catch (error) {
    if (error instanceof Error && error.message.includes('Unauthorized')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    if (error instanceof Error && error.message.includes('Forbidden')) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }
    console.error('Error fetching devotionals:', error);
    return NextResponse.json(
      { error: 'Failed to fetch devotionals' },
      { status: 500 }
    );
  }
}

// POST /api/admin/devotionals - Create new devotional
export async function POST(request: Request) {
  try {
    // Check admin auth
    await requireAdmin();

    const body = await request.json();
    
    // Validation
    if (!body.title || !body.content || !body.devotional_date) {
      return NextResponse.json(
        { error: 'Missing required fields: title, content, devotional_date' },
        { status: 400 }
      );
    }

    const input: DevotionalInput = {
      title: body.title.trim(),
      content: body.content,
      devotional_date: body.devotional_date,
      status: body.status === 'published' ? 'published' : 'draft',
    };

    const devotional = createDevotional(input);
    return NextResponse.json({ devotional }, { status: 201 });
  } catch (error) {
    if (error instanceof Error && error.message.includes('Unauthorized')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    if (error instanceof Error && error.message.includes('Forbidden')) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }
    console.error('Error creating devotional:', error);
    return NextResponse.json(
      { error: 'Failed to create devotional' },
      { status: 500 }
    );
  }
}

// PATCH /api/admin/devotionals - Update devotional
export async function PATCH(request: Request) {
  try {
    // Check admin auth
    await requireAdmin();

    const body = await request.json();
    
    if (!body.id) {
      return NextResponse.json(
        { error: 'Devotional ID is required' },
        { status: 400 }
      );
    }

    const existingDevotional = getDevotionalById(body.id);
    if (!existingDevotional) {
      return NextResponse.json(
        { error: 'Devotional not found' },
        { status: 404 }
      );
    }

    const updateData: Partial<DevotionalInput> = {};
    if (body.title !== undefined) updateData.title = body.title.trim();
    if (body.content !== undefined) updateData.content = body.content;
    if (body.devotional_date !== undefined) updateData.devotional_date = body.devotional_date;
    if (body.status !== undefined) updateData.status = body.status;

    const devotional = updateDevotional(body.id, updateData);
    return NextResponse.json({ devotional });
  } catch (error) {
    if (error instanceof Error && error.message.includes('Unauthorized')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    if (error instanceof Error && error.message.includes('Forbidden')) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }
    console.error('Error updating devotional:', error);
    return NextResponse.json(
      { error: 'Failed to update devotional' },
      { status: 500 }
    );
  }
}

// DELETE /api/admin/devotionals - Soft delete devotional
export async function DELETE(request: Request) {
  try {
    // Check admin auth
    await requireAdmin();

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    const action = searchParams.get('action') || 'soft'; // 'soft', 'restore', or 'hard'

    if (!id) {
      return NextResponse.json(
        { error: 'Devotional ID is required' },
        { status: 400 }
      );
    }

    const numericId = parseInt(id);
    if (isNaN(numericId)) {
      return NextResponse.json(
        { error: 'Invalid devotional ID' },
        { status: 400 }
      );
    }

    // Get devotional first to check if exists
    const devotional = getDevotionalById(numericId);
    if (!devotional) {
      return NextResponse.json(
        { error: 'Devotional not found' },
        { status: 404 }
      );
    }

    if (action === 'restore') {
      const success = restoreDevotional(numericId);
      if (!success) {
        return NextResponse.json(
          { error: 'Failed to restore devotional' },
          { status: 400 }
        );
      }
    } else {
      // Soft delete
      const success = softDeleteDevotional(numericId);
      if (!success) {
        return NextResponse.json(
          { error: 'Devotional not found or already deleted' },
          { status: 404 }
        );
      }
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    if (error instanceof Error && error.message.includes('Unauthorized')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    if (error instanceof Error && error.message.includes('Forbidden')) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }
    console.error('Error deleting devotional:', error);
    return NextResponse.json(
      { error: 'Failed to delete devotional' },
      { status: 500 }
    );
  }
}
