/// <reference types="node" />
import 'dotenv/config'
import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'
import process from 'node:process'

const prisma = new PrismaClient()

async function main() {
  const email = process.env.SUPER_ADMIN_EMAIL
  const password = process.env.SUPER_ADMIN_PASSWORD
  const fullName = process.env.SUPER_ADMIN_NAME ?? 'Super Admin'

  if (!email || !password) {
    throw new Error(
      'Define SUPER_ADMIN_EMAIL y SUPER_ADMIN_PASSWORD en tu .env antes de correr el seed',
    )
  }

  // Verificar que no exista ya
  const existing = await prisma.user.findUnique({ where: { email } })

  if (existing) {
    console.log(`Ya existe un usuario con el email ${email}`)
    console.log(`   Rol actual: ${existing.role}`)
    console.log('   No se creó nada.')
    return
  }

  const passwordHash = await bcrypt.hash(password, 12)

  const admin = await prisma.user.create({
    data: {
      email,
      fullName,
      passwordHash,
      role: 'SUPER_ADMIN',
      provider: 'local',
      isActive: true,
      //mustChangePassword: false,
    },
  })

  console.log('SUPER_ADMIN creado exitosamente')
  console.log(`   ID:    ${admin.id}`)
  console.log(`   Email: ${admin.email}`)
  console.log(`   Nombre: ${admin.fullName}`)
  console.log('')
  console.log(' Guarda estas credenciales en un lugar seguro.')
  console.log('   Nunca subas SUPER_ADMIN_PASSWORD al repositorio.')
}

main()
  .catch((e) => {
    console.error('Error al crear el SUPER_ADMIN:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })