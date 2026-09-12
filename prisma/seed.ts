import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const db = new PrismaClient();

function daysFromNow(days: number): Date {
  const d = new Date();
  d.setDate(d.getDate() + days);
  return d;
}

function monthsFromNow(months: number): Date {
  const d = new Date();
  d.setMonth(d.getMonth() + months);
  return d;
}

async function main() {
  console.log("Clearing existing data...");
  await db.invoiceLineItem.deleteMany();
  await db.invoice.deleteMany();
  await db.session.deleteMany();
  await db.contract.deleteMany();
  await db.equipment.deleteMany();
  await db.client.deleteMany();
  await db.specialist.deleteMany();
  await db.user.deleteMany();

  console.log("Seeding users...");
  const passwordHash = await bcrypt.hash("password123", 10);
  await db.user.createMany({
    data: [
      {
        name: "Ilze Bērziņa",
        email: "ilze@demo.beatus.local",
        passwordHash,
        role: "owner",
      },
      {
        name: "Marta Kalniņa",
        email: "marta@demo.beatus.local",
        passwordHash,
        role: "staff",
      },
      {
        name: "Oksana Melnyk",
        email: "oksana@demo.beatus.local",
        passwordHash,
        role: "staff",
      },
    ],
  });

  console.log("Seeding specialists...");
  const specialistData = [
    {
      fullName: "Anna Ozola",
      phone: "+371 20111222",
      email: "anna.ozola@demo.beatus.local",
      location: "Riga, Latvia",
      region: "LV" as const,
      specialty: "Child developmental therapy",
      status: "active" as const,
      bio: "Specializes in warm-grain sessions for children aged 4-10.",
    },
    {
      fullName: "Kristaps Liepa",
      phone: "+371 20333444",
      email: "kristaps.liepa@demo.beatus.local",
      location: "Jūrmala, Latvia",
      region: "LV" as const,
      specialty: "Family therapy",
      status: "active" as const,
      bio: "Runs family sessions and trains new specialists on equipment care.",
    },
    {
      fullName: "Baiba Krūmiņa",
      phone: "+371 20555666",
      email: "baiba.kruminas@demo.beatus.local",
      location: "Daugavpils, Latvia",
      region: "LV" as const,
      specialty: "Senior developmental therapy",
      status: "active" as const,
      bio: "Focuses on sessions for seniors and mobility-limited clients.",
    },
    {
      fullName: "Valters Vītols",
      phone: "+371 20777888",
      email: "valters.vitols@demo.beatus.local",
      location: "Liepāja, Latvia",
      region: "LV" as const,
      specialty: "Individual therapy",
      status: "inactive" as const,
      bio: "On leave since spring; expected to return next quarter.",
    },
    {
      fullName: "Olena Kovalenko",
      phone: "+380 501112233",
      email: "olena.kovalenko@demo.beatus.local",
      location: "Lviv, Ukraine",
      region: "UA" as const,
      specialty: "Child developmental therapy",
      status: "active" as const,
      bio: "Leads the Lviv practice and mentors newly onboarded specialists.",
    },
    {
      fullName: "Dmytro Shevchenko",
      phone: "+380 501445566",
      email: "dmytro.shevchenko@demo.beatus.local",
      location: "Kyiv, Ukraine",
      region: "UA" as const,
      specialty: "Individual therapy",
      status: "active" as const,
      bio: "Works with adult clients on stress and anxiety-focused sessions.",
    },
    {
      fullName: "Yulia Boyko",
      phone: "+380 501778899",
      email: "yulia.boyko@demo.beatus.local",
      location: "Odesa, Ukraine",
      region: "UA" as const,
      specialty: "Family therapy",
      status: "active" as const,
      bio: "Coordinates family and training sessions across the Odesa region.",
    },
  ];

  const specialists = [];
  for (const data of specialistData) {
    specialists.push(await db.specialist.create({ data }));
  }
  const [anna, kristaps, baiba, , olena, dmytro, yulia] = specialists;

  console.log("Seeding clients...");
  const clientData = [
    { fullName: "Laura Ābele", phone: "+371 26111111", email: "laura.abele@demo.beatus.local", referredBy: "website" as const, notes: "Prefers evening sessions." },
    { fullName: "Reinis Bērtulis", phone: "+371 26222222", email: "reinis.bertulis@demo.beatus.local", referredBy: "friend_referral" as const, notes: null },
    { fullName: "Zane Circene", phone: "+371 26333333", email: "zane.circene@demo.beatus.local", referredBy: "social" as const, notes: "Interested in a mini unit for home use." },
    { fullName: "Toms Dzenis", phone: "+371 26444444", email: "toms.dzenis@demo.beatus.local", referredBy: "local_specialist" as const, notes: null },
    { fullName: "Ilona Eglīte", phone: "+371 26555555", email: "ilona.eglite@demo.beatus.local", referredBy: "linktree" as const, notes: "Son attends child sessions weekly." },
    { fullName: "Māris Freimanis", phone: "+371 26666666", email: "maris.freimanis@demo.beatus.local", referredBy: "other" as const, notes: null },
    { fullName: "Nataliya Tkachenko", phone: "+380 671112233", email: "nataliya.tkachenko@demo.beatus.local", referredBy: "website" as const, notes: "Family of four, regular family sessions." },
    { fullName: "Andriy Marchenko", phone: "+380 671445566", email: "andriy.marchenko@demo.beatus.local", referredBy: "social" as const, notes: null },
    { fullName: "Sofiya Lysenko", phone: "+380 671778899", email: "sofiya.lysenko@demo.beatus.local", referredBy: "friend_referral" as const, notes: "Bought a small unit in spring." },
    { fullName: "Kateryna Voloshyn", phone: "+380 672223344", email: "kateryna.voloshyn@demo.beatus.local", referredBy: "other" as const, notes: null },
  ];

  const clients = [];
  for (const data of clientData) {
    clients.push(await db.client.create({ data }));
  }
  const [laura, reinis, zane, toms, ilona, maris, nataliya, andriy, sofiya, kateryna] = clients;

  console.log("Seeding sessions and invoices...");

  type SessionSeed = {
    client: (typeof clients)[number];
    specialist: (typeof specialists)[number];
    sessionType: "individual" | "family" | "child" | "training";
    daysOffset: number;
    price: number;
    status: "booked" | "completed" | "cancelled";
    invoiceStatus: "draft" | "sent" | "paid" | null;
    dueOffset?: number;
  };

  const sessionSeeds: SessionSeed[] = [
    { client: laura, specialist: anna, sessionType: "individual", daysOffset: -30, price: 45, status: "completed", invoiceStatus: "paid" },
    { client: laura, specialist: anna, sessionType: "individual", daysOffset: -9, price: 45, status: "completed", invoiceStatus: "sent", dueOffset: -2 },
    { client: laura, specialist: anna, sessionType: "individual", daysOffset: 5, price: 45, status: "booked", invoiceStatus: "draft", dueOffset: 19 },
    { client: reinis, specialist: kristaps, sessionType: "family", daysOffset: -20, price: 60, status: "completed", invoiceStatus: "paid" },
    { client: reinis, specialist: kristaps, sessionType: "family", daysOffset: 12, price: 60, status: "booked", invoiceStatus: null },
    { client: zane, specialist: baiba, sessionType: "individual", daysOffset: -45, price: 40, status: "completed", invoiceStatus: "paid" },
    { client: zane, specialist: anna, sessionType: "individual", daysOffset: -15, price: 40, status: "completed", invoiceStatus: "sent", dueOffset: -20 },
    { client: toms, specialist: kristaps, sessionType: "training", daysOffset: -60, price: 120, status: "completed", invoiceStatus: "paid" },
    { client: ilona, specialist: anna, sessionType: "child", daysOffset: -7, price: 35, status: "completed", invoiceStatus: "sent", dueOffset: 7 },
    { client: ilona, specialist: anna, sessionType: "child", daysOffset: 3, price: 35, status: "booked", invoiceStatus: null },
    { client: maris, specialist: baiba, sessionType: "individual", daysOffset: -3, price: 45, status: "completed", invoiceStatus: "draft" },
    { client: nataliya, specialist: olena, sessionType: "family", daysOffset: -25, price: 55, status: "completed", invoiceStatus: "paid" },
    { client: nataliya, specialist: olena, sessionType: "family", daysOffset: -10, price: 55, status: "completed", invoiceStatus: "sent", dueOffset: -3 },
    { client: andriy, specialist: dmytro, sessionType: "individual", daysOffset: -18, price: 40, status: "completed", invoiceStatus: "paid" },
    { client: andriy, specialist: dmytro, sessionType: "individual", daysOffset: 8, price: 40, status: "booked", invoiceStatus: null },
    { client: sofiya, specialist: yulia, sessionType: "family", daysOffset: -40, price: 50, status: "completed", invoiceStatus: "paid" },
    { client: kateryna, specialist: yulia, sessionType: "individual", daysOffset: -5, price: 42, status: "completed", invoiceStatus: "sent", dueOffset: 9 },
    { client: kateryna, specialist: olena, sessionType: "child", daysOffset: 15, price: 38, status: "booked", invoiceStatus: null },
  ];

  for (const seed of sessionSeeds) {
    const scheduledAt = daysFromNow(seed.daysOffset);
    const session = await db.session.create({
      data: {
        clientId: seed.client.id,
        specialistId: seed.specialist.id,
        sessionType: seed.sessionType,
        scheduledAt,
        price: seed.price,
        status: seed.status,
      },
    });

    if (seed.invoiceStatus) {
      const dueDate = seed.dueOffset !== undefined ? daysFromNow(seed.dueOffset) : daysFromNow(14);
      const sessionTypeLabel: Record<string, string> = {
        individual: "Individual session",
        family: "Family session",
        child: "Child session",
        training: "Training session",
      };
      await db.invoice.create({
        data: {
          clientId: seed.client.id,
          sessionId: session.id,
          totalAmount: seed.price,
          dueDate,
          issueDate: scheduledAt,
          status: seed.invoiceStatus,
          sentAt: seed.invoiceStatus === "sent" || seed.invoiceStatus === "paid" ? scheduledAt : null,
          paidAt: seed.invoiceStatus === "paid" ? daysFromNow(seed.daysOffset + 3) : null,
          lineItems: {
            create: [
              {
                type: "session",
                description: sessionTypeLabel[seed.sessionType],
                amount: seed.price,
              },
            ],
          },
        },
      });
    }
  }

  console.log("Seeding standalone equipment/training invoices...");
  await db.invoice.create({
    data: {
      clientId: sofiya.id,
      totalAmount: 350,
      issueDate: daysFromNow(-40),
      dueDate: daysFromNow(-26),
      status: "paid",
      sentAt: daysFromNow(-40),
      paidAt: daysFromNow(-35),
      lineItems: {
        create: [{ type: "equipment", description: "Small warm-grain unit", amount: 350 }],
      },
    },
  });

  await db.invoice.create({
    data: {
      clientId: zane.id,
      totalAmount: 180,
      issueDate: daysFromNow(-2),
      dueDate: daysFromNow(12),
      status: "draft",
      lineItems: {
        create: [{ type: "equipment", description: "Mini warm-grain unit", amount: 180 }],
      },
    },
  });

  await db.invoice.create({
    data: {
      clientId: toms.id,
      totalAmount: 220,
      issueDate: daysFromNow(-35),
      dueDate: daysFromNow(-21),
      status: "sent",
      sentAt: daysFromNow(-35),
      lineItems: {
        create: [{ type: "training", description: "Specialist certification training", amount: 220 }],
      },
    },
  });

  console.log("Seeding contracts...");
  await db.contract.createMany({
    data: [
      {
        partyType: "specialist",
        partyName: anna.fullName,
        specialistId: anna.id,
        agreementType: "Service agreement",
        startDate: monthsFromNow(-18),
        expiryDate: daysFromNow(15),
        renewalHistory: [monthsFromNow(-6)],
      },
      {
        partyType: "specialist",
        partyName: kristaps.fullName,
        specialistId: kristaps.id,
        agreementType: "Training agreement",
        startDate: monthsFromNow(-10),
        expiryDate: daysFromNow(45),
        renewalHistory: [],
      },
      {
        partyType: "vendor",
        partyName: "Baltic Grain Supply SIA",
        agreementType: "Vendor supply",
        startDate: monthsFromNow(-24),
        expiryDate: monthsFromNow(8),
        renewalHistory: [monthsFromNow(-12)],
      },
      {
        partyType: "partner",
        partyName: "Wellness Riga Partnership",
        agreementType: "Equipment partnership",
        startDate: monthsFromNow(-6),
        expiryDate: monthsFromNow(18),
        renewalHistory: [],
      },
      {
        partyType: "specialist",
        partyName: olena.fullName,
        specialistId: olena.id,
        agreementType: "Service agreement",
        startDate: monthsFromNow(-14),
        expiryDate: daysFromNow(-5),
        renewalHistory: [monthsFromNow(-14)],
      },
    ],
  });

  console.log("Seeding equipment...");
  await db.equipment.createMany({
    data: [
      {
        category: "finished_good",
        type: "Large Unit",
        location: "Riga studio, Latvia",
        responsibleSpecialistId: anna.id,
        serialNumber: "BEATUS-LG-001",
        purchaseDate: monthsFromNow(-20),
        lastGrainChange: daysFromNow(-80),
        nextGrainChangeDue: daysFromNow(10),
      },
      {
        category: "finished_good",
        type: "Small Unit",
        location: "Jūrmala studio, Latvia",
        responsibleSpecialistId: kristaps.id,
        serialNumber: "BEATUS-SM-014",
        purchaseDate: monthsFromNow(-12),
        lastGrainChange: daysFromNow(-30),
        nextGrainChangeDue: daysFromNow(60),
      },
      {
        category: "finished_good",
        type: "Mini Unit",
        location: "Daugavpils studio, Latvia",
        responsibleSpecialistId: baiba.id,
        serialNumber: "BEATUS-MN-027",
        purchaseDate: monthsFromNow(-5),
        lastGrainChange: daysFromNow(-85),
        nextGrainChangeDue: daysFromNow(5),
      },
      {
        category: "finished_good",
        type: "Large Unit",
        location: "Lviv studio, Ukraine",
        responsibleSpecialistId: olena.id,
        serialNumber: "BEATUS-LG-032",
        purchaseDate: monthsFromNow(-15),
        lastGrainChange: daysFromNow(-40),
        nextGrainChangeDue: daysFromNow(50),
      },
      {
        category: "finished_good",
        type: "Small Unit",
        location: "Kyiv studio, Ukraine",
        responsibleSpecialistId: dmytro.id,
        serialNumber: "BEATUS-SM-041",
        purchaseDate: monthsFromNow(-8),
        lastGrainChange: daysFromNow(-95),
        nextGrainChangeDue: daysFromNow(-5),
        notes: "Overdue for grain replacement — schedule visit.",
      },
      {
        category: "finished_good",
        type: "Mini Unit",
        location: "Odesa studio, Ukraine",
        responsibleSpecialistId: yulia.id,
        serialNumber: "BEATUS-MN-058",
        purchaseDate: monthsFromNow(-3),
        lastGrainChange: daysFromNow(-20),
        nextGrainChangeDue: daysFromNow(70),
      },
      {
        category: "finished_good",
        type: "Grains",
        location: "Riga warehouse, Latvia",
        purchaseDate: monthsFromNow(-2),
        notes: "Organic-certified grain stock for sessions and refills.",
      },
      {
        category: "finished_good",
        type: "Anti-bullying cards",
        location: "Riga warehouse, Latvia",
        purchaseDate: monthsFromNow(-4),
      },
      {
        category: "raw_material",
        type: "Electrical component",
        location: "Riga workshop, Latvia",
        purchaseDate: monthsFromNow(-6),
        notes: "Heating elements for unit assembly.",
      },
      {
        category: "raw_material",
        type: "Steel",
        location: "Riga workshop, Latvia",
        purchaseDate: monthsFromNow(-6),
        notes: "Frame stock for Mini/Small/Large unit assembly.",
      },
    ],
  });

  console.log("Seed complete.");
  console.log("Login with: ilze@demo.beatus.local / password123 (owner)");
  console.log("            marta@demo.beatus.local / password123 (staff)");
  console.log("            oksana@demo.beatus.local / password123 (staff)");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await db.$disconnect();
  });
