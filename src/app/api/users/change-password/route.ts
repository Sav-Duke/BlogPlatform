import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';

function validatePassword(password: string) {
  // At least 10 chars, at least one letter and one number
  return /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{10,}$/.test(password);
}

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const { currentPassword, newPassword } = await req.json();
    if (!currentPassword || !newPassword) {
      return NextResponse.json({ error: 'All fields are required' }, { status: 400 });
    }
    if (!validatePassword(newPassword)) {
      return NextResponse.json({ error: 'Password must be at least 10 characters and contain both letters and numbers.' }, { status: 400 });
    }
    const user = await prisma.user.findUnique({ where: { email: session.user.email } });
    if (!user || !user.password) {
      return NextResponse.json({ error: 'User not found or password not set' }, { status: 404 });
    }
    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) {
      return NextResponse.json({ error: 'Current password is incorrect' }, { status: 400 });
    }
    const hashed = await bcrypt.hash(newPassword, 10);
    await prisma.user.update({ where: { email: session.user.email }, data: { password: hashed } });
    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Failed to change password' }, { status: 500 });
  }
}
