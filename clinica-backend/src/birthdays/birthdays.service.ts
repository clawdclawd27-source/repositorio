import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class BirthdaysService {
  constructor(private prisma: PrismaService) {}

  async list(month?: number) {
    const clients = await this.prisma.client.findMany({
      where: { birthDate: { not: null } },
      select: { id: true, fullName: true, phone: true, email: true, birthDate: true },
      orderBy: { fullName: 'asc' },
    });

    const nowMonth = new Date().getMonth() + 1;
    const targetMonth = month && month >= 1 && month <= 12 ? month : nowMonth;

    return clients
      .map((c) => {
        const d = c.birthDate as Date;
        return { ...c, birthMonth: d.getMonth() + 1, birthDay: d.getDate() };
      })
      .filter((c) => c.birthMonth === targetMonth)
      .sort((a, b) => a.birthDay - b.birthDay);
  }
}
