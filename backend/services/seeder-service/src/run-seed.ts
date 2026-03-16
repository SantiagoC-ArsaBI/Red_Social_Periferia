import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

const SP_ADD_LIKE_AND_LOG = `
CREATE OR REPLACE FUNCTION sp_add_like_and_log(p_user_id BIGINT, p_post_id BIGINT)
RETURNS VOID AS $$
BEGIN
  INSERT INTO "Like" ("userId", "postId", "createdAt") VALUES (p_user_id, p_post_id, NOW());
  INSERT INTO "AuditLog" (action, "userId", "postId", "createdAt") VALUES ('LIKE_POST', p_user_id, p_post_id, NOW());
EXCEPTION
  WHEN unique_violation THEN
    RAISE EXCEPTION 'LIKE_ALREADY_EXISTS';
  WHEN foreign_key_violation THEN
    RAISE EXCEPTION 'INVALID_USER_OR_POST';
END;
$$ LANGUAGE plpgsql;
`;

const SP_GET_USER_FEED = `
CREATE OR REPLACE FUNCTION sp_get_user_feed(p_user_id BIGINT)
RETURNS TABLE (
  post_id INTEGER,
  author_id INTEGER,
  message TEXT,
  created_at TIMESTAMP WITHOUT TIME ZONE,
  likes_count INTEGER,
  author_first_name TEXT,
  author_last_name TEXT,
  author_alias TEXT,
  liked_by_me BOOLEAN
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    p.id AS post_id,
    p."authorId" AS author_id,
    p.message,
    p."createdAt" AS created_at,
    COALESCE(lc.cnt, 0)::INTEGER AS likes_count,
    u."firstName" AS author_first_name,
    u."lastName" AS author_last_name,
    u."alias" AS author_alias,
    EXISTS (SELECT 1 FROM "Like" l WHERE l."postId" = p.id AND l."userId" = p_user_id) AS liked_by_me
  FROM "Post" p
  JOIN "User" u ON u.id = p."authorId"
  LEFT JOIN (SELECT "postId", COUNT(*) AS cnt FROM "Like" GROUP BY "postId") lc ON lc."postId" = p.id
  ORDER BY p."createdAt" DESC;
END;
$$ LANGUAGE plpgsql;
`;

const USERS = [
  { email: 'ana@test.com', password: 'clave123', firstName: 'Ana', lastName: 'García', birthDate: new Date('1995-03-10'), alias: 'anita' },
  { email: 'carlos@test.com', password: 'clave123', firstName: 'Carlos', lastName: 'López', birthDate: new Date('1990-07-22'), alias: 'carlos' },
  { email: 'maria@test.com', password: 'clave123', firstName: 'María', lastName: 'Martínez', birthDate: new Date('1988-11-05'), alias: 'maria' },
];

async function main() {
  await prisma.$executeRawUnsafe(SP_ADD_LIKE_AND_LOG);
  await prisma.$executeRawUnsafe(SP_GET_USER_FEED);
  const hashed = await Promise.all(
    USERS.map(async (u) => ({ ...u, password: await bcrypt.hash(u.password, 10) })),
  );
  for (const u of hashed) {
    await prisma.user.upsert({
      where: { email: u.email },
      create: {
        email: u.email,
        password: u.password,
        firstName: u.firstName,
        lastName: u.lastName,
        birthDate: u.birthDate,
        alias: u.alias,
      },
      update: {},
    });
  }
  const users = await prisma.user.findMany({ where: { email: { in: USERS.map((u) => u.email) } } });
  for (const user of users) {
    const existing = await prisma.post.findFirst({ where: { authorId: user.id } });
    if (!existing) {
      await prisma.post.create({
        data: {
          message: `Primera publicación de ${user.firstName} ${user.lastName}.`,
          authorId: user.id,
        },
      });
    }
  }
  console.log('Seeder: usuarios y una publicación por usuario creados.');
}

main()
  .then(() => prisma.$disconnect())
  .catch((e) => {
    console.error(e);
    prisma.$disconnect();
    process.exit(1);
  });
