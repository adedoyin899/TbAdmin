import bcrypt from 'bcrypt';
import { pool } from '../connection.js';

async function seedAdminUser() {
  const client = await pool.connect();
  try {
    console.log('Seeding initial administrator user...');
    const email = 'maz@talentbridge.cv';
    const plainPassword = 'temp_password_123';
    const role = 'admin';

    const saltRounds = 12;
    const passwordHash = await bcrypt.hash(plainPassword, saltRounds);

    const res = await client.query(
      `
      INSERT INTO admin_users (email, password_hash, role, is_active)
      VALUES ($1, $2, $3, TRUE)
      ON CONFLICT (email) DO UPDATE
      SET password_hash = EXCLUDED.password_hash,
          role = EXCLUDED.role,
          is_active = TRUE
      RETURNING id, email, role, created_at;
      `,
      [email, passwordHash, role]
    );

    console.log('✅ Admin user seeded successfully:', res.rows[0]);
  } catch (error) {
    console.error('❌ Seeding failed:', error);
    process.exit(1);
  } finally {
    client.release();
    await pool.end();
  }
}

seedAdminUser();
