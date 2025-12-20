import { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '../../../lib/prisma';
import bcrypt from 'bcryptjs';

function validatePassword(password: string): boolean {
  // At least 10 chars, must contain letters and numbers
  return (
    password.length >= 10 &&
    /[a-zA-Z]/.test(password) &&
    /[0-9]/.test(password)
  );
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { userId, oldPassword, newPassword } = req.body;
  if (!userId || !oldPassword || !newPassword) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  if (!validatePassword(newPassword)) {
    return res.status(400).json({ error: 'Password must be at least 10 characters and contain both letters and numbers.' });
  }

  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user || !user.password) {
    return res.status(404).json({ error: 'User not found' });
  }

  const isValid = await bcrypt.compare(oldPassword, user.password);
  if (!isValid) {
    return res.status(401).json({ error: 'Old password is incorrect' });
  }

  const hashedPassword = await bcrypt.hash(newPassword, 10);
  await prisma.user.update({
    where: { id: userId },
    data: { password: hashedPassword },
  });

  return res.status(200).json({ message: 'Password updated successfully' });
}
