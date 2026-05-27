import "dotenv/config";
import { createClient } from "@supabase/supabase-js";
import { Prisma, PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL ?? "",
});
const prisma = new PrismaClient({ adapter });

// Supabase admin client — uses service role key to create auth users
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL ?? "",
  process.env.SUPABASE_SERVICE_ROLE_KEY ?? "",
  { auth: { autoRefreshToken: false, persistSession: false } },
);

const USERS = [
  {
    email: "admin@test.com",
    name: "Admin User",
    password: "password123",
    role: "ADMIN",
  },
  {
    email: "operator@test.com",
    name: "Operator User",
    password: "password123",
    role: "OPERATOR",
  },
  {
    email: "host@test.com",
    name: "Host User",
    password: "password123",
    role: "HOST",
  },
] as const;

async function main() {
  console.log("Seeding...");

  // Track created user IDs by role for use below
  const userIds: Record<string, string> = {};

  for (const u of USERS) {
    // Create user in Supabase Auth
    const { data, error } = await supabase.auth.admin.createUser({
      email: u.email,
      password: u.password,
      email_confirm: true,
      app_metadata: { role: u.role },
    });

    if (error) {
      // If user already exists, fetch their ID instead
      if (error.message.includes("already been registered")) {
        const { data: list } = await supabase.auth.admin.listUsers();
        const existing = list?.users.find((x) => x.email === u.email);
        if (!existing)
          throw new Error(`Could not find existing user: ${u.email}`);
        userIds[u.role] = existing.id;

        // Update app_metadata in case it wasn't set
        await supabase.auth.admin.updateUserById(existing.id, {
          app_metadata: { role: u.role },
        });
      } else {
        throw error;
      }
    } else {
      userIds[u.role] = data.user.id;
    }

    // Upsert into our DB users table
    await prisma.user.upsert({
      where: { email: u.email },
      update: { name: u.name, role: u.role },
      create: {
        id: userIds[u.role]!,
        email: u.email,
        name: u.name,
        role: u.role,
      },
    });

    console.log(`✓ ${u.role} — ${u.email}`);
  }

  // Create property — owned by Admin
  const property = await prisma.property.upsert({
    where: { id: "seed-property-1" },
    update: {},
    create: {
      id: "seed-property-1",
      name: "Sunset Apartments Unit 4A",
      address: "12 Harbour Street, Sydney NSW 2000",
      description: "Short-stay serviced apartment on the 4th floor. Sea views.",
      createdById: userIds["ADMIN"]!,
    },
  });

  console.log(`✓ Property — ${property.name}`);

  // Create tasks — all assigned to Operator
  const tasks = [
    {
      id: "seed-task-1",
      title: "Deep clean bathroom",
      status: "PENDING",
      assignedToId: userIds["OPERATOR"],
    },
    {
      id: "seed-task-2",
      title: "Replace welcome mat",
      status: "IN_PROGRESS",
      assignedToId: userIds["OPERATOR"],
    },
    {
      id: "seed-task-3",
      title: "Fix dripping tap",
      status: "DONE",
      assignedToId: userIds["OPERATOR"],
    },
    {
      id: "seed-task-4",
      title: "Check smoke detectors",
      status: "PENDING",
      assignedToId: null,
    },
  ] as const;

  for (const t of tasks) {
    await prisma.task.upsert({
      where: { id: t.id },
      update: {},
      create: {
        id: t.id,
        title: t.title,
        status: t.status,
        propertyId: property.id,
        createdById: userIds["ADMIN"]!,
        assignedToId: t.assignedToId ?? null,
      },
    });
    console.log(`✓ Task — ${t.title} (${t.status})`);
  }

  // Create audit log entries for each task creation
  for (const t of tasks) {
    await prisma.auditLog.create({
      data: {
        action: "TASK_CREATED",
        entityType: "task",
        entityId: t.id,
        userId: userIds["ADMIN"]!,
        before: Prisma.JsonNull,
        after: { title: t.title, status: t.status },
        metadata: { source: "seed" },
      },
    });
  }

  // Audit log — property creation
  await prisma.auditLog.create({
    data: {
      action: "PROPERTY_CREATED",
      entityType: "property",
      entityId: property.id,
      userId: userIds["ADMIN"]!,
      before: Prisma.JsonNull,
      after: { name: property.name, address: property.address },
      metadata: { source: "seed" },
    },
  });

  // Audit log — status transitions that match the seeded task states
  await prisma.auditLog.create({
    data: {
      action: "TASK_STATUS_CHANGED",
      entityType: "task",
      entityId: "seed-task-2",
      userId: userIds["OPERATOR"]!,
      before: { status: "PENDING" },
      after: { status: "IN_PROGRESS" },
      metadata: { transition: "PENDING → IN_PROGRESS", source: "seed" },
    },
  });

  await prisma.auditLog.create({
    data: {
      action: "TASK_STATUS_CHANGED",
      entityType: "task",
      entityId: "seed-task-3",
      userId: userIds["OPERATOR"]!,
      before: { status: "PENDING" },
      after: { status: "IN_PROGRESS" },
      metadata: { transition: "PENDING → IN_PROGRESS", source: "seed" },
    },
  });

  await prisma.auditLog.create({
    data: {
      action: "TASK_STATUS_CHANGED",
      entityType: "task",
      entityId: "seed-task-3",
      userId: userIds["OPERATOR"]!,
      before: { status: "IN_PROGRESS" },
      after: { status: "DONE" },
      metadata: { transition: "IN_PROGRESS → DONE", source: "seed" },
    },
  });

  console.log(`✓ Audit logs created`);
  console.log("Seed complete.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
