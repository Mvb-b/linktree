import { NextRequest, NextResponse } from 'next/server';
import { authMiddleware } from '@/lib/auth';
import { 
  getUsers, 
  createUser, 
  updateUser, 
  deactivateUser, 
  activateUser, 
  deleteUser,
  updateUserPassword,
  CreateUserInput,
  UpdateUserInput 
} from '@/lib/users-db';

// GET /api/admin/users - List users with filters
export async function GET(request: NextRequest) {
  const auth = await authMiddleware(request);
  
  if (!auth.isAuthenticated || !auth.isAdmin) {
    return NextResponse.json(
      { success: false, error: 'Unauthorized' }, 
      { status: 401 }
    );
  }

  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search') || undefined;
    const role = searchParams.get('role') as 'admin' | 'user' | undefined;
    const status = searchParams.get('status') as 'active' | 'inactive' | undefined;
    const limit = parseInt(searchParams.get('limit') || '100');
    const offset = parseInt(searchParams.get('offset') || '0');

    const result = getUsers(
      { search, role, status },
      limit,
      offset
    );

    return NextResponse.json({ success: true, data: result });
  } catch (error) {
    console.error('Error fetching users:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch users' },
      { status: 500 }
    );
  }
}

// POST /api/admin/users - Create new user
export async function POST(request: NextRequest) {
  const auth = await authMiddleware(request);
  
  if (!auth.isAuthenticated || !auth.isAdmin) {
    return NextResponse.json(
      { success: false, error: 'Unauthorized' }, 
      { status: 401 }
    );
  }

  try {
    const body = await request.json();
    
    // Validation
    if (!body.name || !body.email || !body.password) {
      return NextResponse.json(
        { success: false, error: 'Name, email and password are required' },
        { status: 400 }
      );
    }

    if (!body.email.includes('@')) {
      return NextResponse.json(
        { success: false, error: 'Invalid email format' },
        { status: 400 }
      );
    }

    if (body.password.length < 6) {
      return NextResponse.json(
        { success: false, error: 'Password must be at least 6 characters' },
        { status: 400 }
      );
    }

    const userData: CreateUserInput = {
      name: body.name.trim(),
      email: body.email.trim().toLowerCase(),
      password: body.password,
      role: body.role === 'admin' ? 'admin' : 'user',
      status: body.status === 'inactive' ? 'inactive' : 'active'
    };

    const user = createUser(userData);
    
    return NextResponse.json({ success: true, data: user });
  } catch (error: any) {
    console.error('Error creating user:', error);
    
    if (error.message?.includes('UNIQUE constraint failed: users.email')) {
      return NextResponse.json(
        { success: false, error: 'Email already exists' },
        { status: 409 }
      );
    }
    
    return NextResponse.json(
      { success: false, error: 'Failed to create user' },
      { status: 500 }
    );
  }
}

// PUT /api/admin/users - Update user
export async function PUT(request: NextRequest) {
  const auth = await authMiddleware(request);
  
  if (!auth.isAuthenticated || !auth.isAdmin) {
    return NextResponse.json(
      { success: false, error: 'Unauthorized' }, 
      { status: 401 }
    );
  }

  try {
    const body = await request.json();
    const { id, password, ...updates } = body;

    if (!id) {
      return NextResponse.json(
        { success: false, error: 'User ID is required' },
        { status: 400 }
      );
    }

    const userId = parseInt(id);

    // Prevent self-deactivation
    if (updates.status === 'inactive' && userId === auth.user?.id) {
      return NextResponse.json(
        { success: false, error: 'Cannot deactivate your own account' },
        { status: 400 }
      );
    }

    // Validate email format if provided
    if (updates.email && !updates.email.includes('@')) {
      return NextResponse.json(
        { success: false, error: 'Invalid email format' },
        { status: 400 }
      );
    }

    // Build update data
    const updateData: UpdateUserInput = {};
    if (updates.name !== undefined) updateData.name = updates.name.trim();
    if (updates.email !== undefined) updateData.email = updates.email.trim().toLowerCase();
    if (updates.role !== undefined) updateData.role = updates.role;
    if (updates.status !== undefined) updateData.status = updates.status;

    const user = updateUser(userId, updateData);
    
    if (!user) {
      return NextResponse.json(
        { success: false, error: 'User not found' },
        { status: 404 }
      );
    }

    // Update password if provided
    if (password) {
      if (password.length < 6) {
        return NextResponse.json(
          { success: false, error: 'Password must be at least 6 characters' },
          { status: 400 }
        );
      }
      updateUserPassword(userId, password);
    }

    return NextResponse.json({ success: true, data: user });
  } catch (error: any) {
    console.error('Error updating user:', error);
    
    if (error.message?.includes('UNIQUE constraint failed: users.email')) {
      return NextResponse.json(
        { success: false, error: 'Email already exists' },
        { status: 409 }
      );
    }
    
    return NextResponse.json(
      { success: false, error: 'Failed to update user' },
      { status: 500 }
    );
  }
}

// DELETE /api/admin/users - Soft delete (deactivate) or hard delete
export async function DELETE(request: NextRequest) {
  const auth = await authMiddleware(request);
  
  if (!auth.isAuthenticated || !auth.isAdmin) {
    return NextResponse.json(
      { success: false, error: 'Unauthorized' }, 
      { status: 401 }
    );
  }

  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    const hard = searchParams.get('hard') === 'true';

    if (!id) {
      return NextResponse.json(
        { success: false, error: 'User ID is required' },
        { status: 400 }
      );
    }

    const userId = parseInt(id);

    // Prevent self-deletion
    if (userId === auth.user?.id) {
      return NextResponse.json(
        { success: false, error: 'Cannot delete your own account' },
        { status: 400 }
      );
    }

    if (hard) {
      const success = deleteUser(userId);
      if (!success) {
        return NextResponse.json(
          { success: false, error: 'User not found' },
          { status: 404 }
        );
      }
      return NextResponse.json({ success: true, message: 'User deleted permanently' });
    } else {
      const success = deactivateUser(userId);
      if (!success) {
        return NextResponse.json(
          { success: false, error: 'User not found' },
          { status: 404 }
        );
      }
      return NextResponse.json({ success: true, message: 'User deactivated' });
    }
  } catch (error) {
    console.error('Error deleting user:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to delete user' },
      { status: 500 }
    );
  }
}
