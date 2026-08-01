import { prisma } from './prisma';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const ADMIN_EMAIL = process.env.SEED_ADMIN_EMAIL || 'admin@example.com';
const ADMIN_PASSWORD = process.env.SEED_ADMIN_PASSWORD || 'AdminPass123';
const JWT_SECRET = process.env.JWT_SECRET || 'your_jwt_secret';

async function main() {
  // Check if admin already exists
  const existing = await prisma.user.findUnique({ where: { email: ADMIN_EMAIL } });
  if (existing) {
    console.log('Admin user already exists');
    return;
  }
  const hashed = await bcrypt.hash(ADMIN_PASSWORD, 10);
  const admin = await prisma.user.create({
    data: {
      email: ADMIN_EMAIL,
      password: hashed,
      role: 'ADMIN',
      permissions: {
        create: [
          { menu: 'DASHBOARD', enabled: true },
          { menu: 'VEHICLES', enabled: true },
          { menu: 'ADMIN', enabled: true },
        ],
      },
    },
  });
  const token = jwt.sign({ id: admin.id, role: admin.role }, JWT_SECRET, { expiresIn: '7d' });
  console.log('Admin user created');
  console.log('Email:', ADMIN_EMAIL);
  console.log('Password:', ADMIN_PASSWORD);
  console.log('JWT token:', token);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
