import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function createAdmin() {
  const hashedPassword = await bcrypt.hash('ReGGie.02', 12)
  
  const admin = await prisma.user.upsert({
    where: { email: 'ty@samedayramps.com' },
    update: {
      password: hashedPassword,
      name: 'Ty Walls',
      role: 'ADMIN'
    },
    create: {
      email: 'ty@samedayramps.com',
      password: hashedPassword,
      name: 'Ty Walls',
      role: 'ADMIN'
    }
  })
  
  console.log('Admin user created/updated:', admin.email)
}

createAdmin()
  .catch(console.error)
  .finally(() => prisma.$disconnect()) 