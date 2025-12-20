import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  // Check if user already exists
  const existingUser = await prisma.user.findUnique({
    where: { email: 'duke01savage@gmail.com' }
  })

  if (existingUser) {
    console.log('✅ Admin user duke01savage@gmail.com already exists!')
    return
  }

  // Create new admin user
  const hashedPassword = await bcrypt.hash('12345678', 10)
  
  const newAdmin = await prisma.user.create({
    data: {
      email: 'duke01savage@gmail.com',
      name: 'Duke Sav',
      password: hashedPassword,
      role: 'ADMIN',
      bio: 'Platform Administrator and Developer',
    },
  })

  console.log('✅ Successfully created admin user:', newAdmin.email)
  console.log('📧 Email: duke01savage@gmail.com')
  console.log('🔑 Password: 12345678')
  console.log('👤 Role: ADMIN')
}

main()
  .catch((e) => {
    console.error('❌ Error:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
