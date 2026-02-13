import { AppointmentStatus, ClientPackageStatus, Prisma, PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const clientNames = [
  'Ana Souza','Bruno Lima','Carla Mendes','Daniel Rocha','Eduarda Alves','Felipe Martins','Gabriela Costa','Henrique Nunes','Isabela Ribeiro','João Pedro Silva',
  'Karina Oliveira','Lucas Fernandes','Mariana Barros','Nicolas Teixeira','Patrícia Gomes','Rafael Cardoso','Sabrina Vieira','Thiago Araujo','Vanessa Castro','William Duarte',
  'Alice Monteiro','Beatriz Freitas','Camila Moura','Diego Barbosa','Elisa Prado','Fernando Correia','Giovana Pires','Heitor Melo','Iara Rezende','Juliana Farias'
];

const serviceSeed: Array<[string, number, number]> = [
  ['Botox (Toxina Botulínica)', 40, 900],
  ['Preenchimento Labial', 60, 1200],
  ['Bioestimulador de Colágeno', 60, 1800],
  ['Peeling Químico', 45, 380],
  ['Limpeza de Pele Profunda', 70, 220],
  ['Microagulhamento', 60, 420],
  ['Laser para Manchas', 50, 550],
  ['Depilação a Laser (Área Pequena)', 35, 180],
  ['Drenagem Linfática Manual', 60, 170],
  ['Massagem Modeladora', 60, 180],
  ['Radiofrequência Corporal', 50, 260],
  ['Criolipólise', 75, 1100],
  ['Design de Sobrancelhas', 35, 90],
  ['Lash Lifting', 45, 180],
  ['Hidratação Facial Premium', 50, 240],
];

const packageSeed: Array<[string, number, number, number]> = [
  ['Pacote Glow 5 Sessões', 5, 790, 120],
  ['Pacote Renovação 10 Sessões', 10, 1490, 180],
  ['Pacote Drenagem 8 Sessões', 8, 1090, 120],
  ['Pacote Sobrancelha 6 Sessões', 6, 480, 180],
  ['Pacote Premium Facial 12 Sessões', 12, 2590, 240],
];

function cpfFrom(i: number) {
  const base = String(10000000000 + i).slice(0, 11);
  return `${base.slice(0, 3)}.${base.slice(3, 6)}.${base.slice(6, 9)}-${base.slice(9, 11)}`;
}

async function seedClients() {
  let created = 0;
  for (let i = 0; i < clientNames.length; i++) {
    const fullName = clientNames[i];
    const email = `cliente.demo${i + 1}@clinica.local`;
    const phone = `+55 11 9${String(12000000 + i).slice(-8)}`;
    const birthDate = new Date(1984 + (i % 20), i % 12, (i % 28) + 1);

    const exists = await prisma.client.findFirst({ where: { email } });
    if (exists) continue;

    await prisma.client.create({
      data: {
        fullName,
        email,
        phone,
        cpf: cpfFrom(i + 1),
        birthDate,
        notes: 'Cliente demo persistente',
      },
    });
    created++;
  }
  return created;
}

async function seedServices() {
  const out = { created: 0, updated: 0 };
  for (const [name, durationMinutes, basePrice] of serviceSeed) {
    const existing = await prisma.service.findFirst({ where: { name } });
    if (!existing) {
      await prisma.service.create({
        data: { name, durationMinutes, basePrice: new Prisma.Decimal(basePrice), active: true },
      });
      out.created++;
    } else {
      await prisma.service.update({
        where: { id: existing.id },
        data: { durationMinutes, basePrice: new Prisma.Decimal(basePrice), active: true },
      });
      out.updated++;
    }
  }
  return out;
}

async function seedPackages() {
  const services = await prisma.service.findMany({ orderBy: { name: 'asc' }, take: packageSeed.length });
  let created = 0;
  for (let i = 0; i < packageSeed.length; i++) {
    const [name, totalSessions, totalPrice, validityDays] = packageSeed[i];
    const service = services[i % services.length];
    const existing = await prisma.treatmentPackage.findFirst({ where: { name } });
    if (!existing) {
      await prisma.treatmentPackage.create({
        data: {
          name,
          serviceId: service.id,
          totalSessions,
          totalPrice: new Prisma.Decimal(totalPrice),
          validityDays,
          active: true,
        },
      });
      created++;
    }
  }
  return created;
}

async function seedPackageSalesAndAppointments() {
  const clients = await prisma.client.findMany({ orderBy: { createdAt: 'asc' }, take: 20 });
  const packs = await prisma.treatmentPackage.findMany({ orderBy: { createdAt: 'asc' }, take: 5 });
  const services = await prisma.service.findMany({ where: { active: true }, orderBy: { createdAt: 'asc' }, take: 10 });

  let sold = 0;
  for (let i = 0; i < Math.min(clients.length, packs.length); i++) {
    const c = clients[i];
    const p = packs[i % packs.length];
    const exists = await prisma.clientPackage.findFirst({ where: { clientId: c.id, packageId: p.id } });
    if (!exists) {
      const purchasedAt = new Date();
      const expiresAt = new Date(purchasedAt.getTime() + p.validityDays * 24 * 60 * 60000);
      await prisma.clientPackage.create({
        data: {
          clientId: c.id,
          packageId: p.id,
          status: ClientPackageStatus.ACTIVE,
          totalSessions: p.totalSessions,
          remainingSessions: p.totalSessions,
          pricePaid: p.totalPrice,
          purchasedAt,
          expiresAt,
          notes: 'Venda demo persistente',
        },
      });
      sold++;
    }
  }

  let appointments = 0;
  for (let i = 0; i < 30; i++) {
    const c = clients[i % clients.length];
    const s = services[i % services.length];
    const startsAt = new Date();
    startsAt.setDate(startsAt.getDate() + Math.floor(i / 6));
    startsAt.setHours(8 + (i % 8), (i % 2) * 30, 0, 0);
    const endsAt = new Date(startsAt.getTime() + s.durationMinutes * 60000);

    const exists = await prisma.appointment.findFirst({
      where: {
        clientId: c.id,
        serviceId: s.id,
        startsAt: { gte: new Date(startsAt.getTime() - 1000), lte: new Date(startsAt.getTime() + 1000) },
      },
    });
    if (!exists) {
      await prisma.appointment.create({
        data: {
          clientId: c.id,
          serviceId: s.id,
          startsAt,
          endsAt,
          status: i % 7 === 0 ? AppointmentStatus.CONFIRMED : AppointmentStatus.SCHEDULED,
          notes: 'Consulta demo persistente',
        },
      });
      appointments++;
    }
  }

  return { sold, appointments };
}

async function main() {
  const createdClients = await seedClients();
  const services = await seedServices();
  const createdPackages = await seedPackages();
  const { sold, appointments } = await seedPackageSalesAndAppointments();

  console.log(
    JSON.stringify(
      {
        ok: true,
        createdClients,
        createdServices: services.created,
        updatedServices: services.updated,
        createdPackages,
        soldPackages: sold,
        createdAppointments: appointments,
      },
      null,
      2,
    ),
  );
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
