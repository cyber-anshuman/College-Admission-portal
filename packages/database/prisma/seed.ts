import * as dotenv from 'dotenv';
import * as path from 'path';

// Load .env from root monorepo or current directory
dotenv.config({ path: path.resolve(__dirname, '../../../.env') });
dotenv.config({ path: path.resolve(__dirname, '../.env') });
dotenv.config();

import { PrismaClient, Role, QuotaCategory, DegreeLevel, AuditAction } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  if (process.env.NODE_ENV === 'production') {
    console.error('ERROR: Database seeding is forbidden in production environments.');
    process.exit(1);
  }

  console.log('🌱 Starting database seed for College Admission Management System...');

  const defaultPassword = await bcrypt.hash('Password@123', 10);
  const applicantPassword = await bcrypt.hash('Applicant@123', 10);

  // 1. Seed System Staff Users
  const staffUsers = [
    {
      email: 'admin@college.edu',
      phone: '+919876543210',
      role: Role.ADMIN,
      passwordHash: defaultPassword,
    },
    {
      email: 'officer@college.edu',
      phone: '+919876543211',
      role: Role.ADMISSION_OFFICER,
      passwordHash: defaultPassword,
    },
    {
      email: 'hod.cse@college.edu',
      phone: '+919876543212',
      role: Role.REVIEWER_HOD,
      passwordHash: defaultPassword,
    },
    {
      email: 'accounts@college.edu',
      phone: '+919876543213',
      role: Role.ACCOUNTS,
      passwordHash: defaultPassword,
    },
    {
      email: 'auditor@college.edu',
      phone: '+919876543214',
      role: Role.AUDITOR,
      passwordHash: defaultPassword,
    },
  ];

  for (const staff of staffUsers) {
    const user = await prisma.user.upsert({
      where: { email: staff.email },
      update: {
        role: staff.role,
        passwordHash: staff.passwordHash,
        phone: staff.phone,
        isActive: true,
        isEmailVerified: true,
        isPhoneVerified: true,
      },
      create: {
        email: staff.email,
        phone: staff.phone,
        passwordHash: staff.passwordHash,
        role: staff.role,
        isActive: true,
        isEmailVerified: true,
        isPhoneVerified: true,
      },
    });
    console.log(`✓ Seeded user: ${user.email} (${user.role})`);
  }

  // 2. Seed Applicant 1: Rahul Sharma (Verified Applicant with Profile)
  const rahulUser = await prisma.user.upsert({
    where: { email: 'applicant.rahul@example.com' },
    update: {
      passwordHash: applicantPassword,
      role: Role.APPLICANT,
      phone: '+919811122233',
      isEmailVerified: true,
      isPhoneVerified: true,
    },
    create: {
      email: 'applicant.rahul@example.com',
      phone: '+919811122233',
      passwordHash: applicantPassword,
      role: Role.APPLICANT,
      isEmailVerified: true,
      isPhoneVerified: true,
      applicantProfile: {
        create: {
          firstName: 'Rahul',
          lastName: 'Sharma',
          dateOfBirth: new Date('2006-05-14'),
          gender: 'Male',
          category: QuotaCategory.OBC_NCL,
          guardianName: 'Virender Sharma',
          guardianPhone: '+919811122200',
          addressLine1: 'Flat 402, Shanti Vihar',
          city: 'Jaipur',
          state: 'Rajasthan',
          pincode: '302001',
          aadharMasked: 'XXXX-XXXX-4589',
          dpdpConsentGivenAt: new Date(),
        },
      },
    },
  });

  // Ensure applicant profile exists if user already existed
  await prisma.applicant.upsert({
    where: { userId: rahulUser.id },
    update: {},
    create: {
      userId: rahulUser.id,
      firstName: 'Rahul',
      lastName: 'Sharma',
      dateOfBirth: new Date('2006-05-14'),
      gender: 'Male',
      category: QuotaCategory.OBC_NCL,
      guardianName: 'Virender Sharma',
      guardianPhone: '+919811122200',
      addressLine1: 'Flat 402, Shanti Vihar',
      city: 'Jaipur',
      state: 'Rajasthan',
      pincode: '302001',
      aadharMasked: 'XXXX-XXXX-4589',
      dpdpConsentGivenAt: new Date(),
    },
  });
  console.log(`✓ Seeded applicant: ${rahulUser.email}`);

  // 3. Seed Applicant 2: Priya Patel (General Category)
  const priyaUser = await prisma.user.upsert({
    where: { email: 'applicant.priya@example.com' },
    update: {
      passwordHash: applicantPassword,
      role: Role.APPLICANT,
      phone: '+919844455566',
      isEmailVerified: true,
      isPhoneVerified: true,
    },
    create: {
      email: 'applicant.priya@example.com',
      phone: '+919844455566',
      passwordHash: applicantPassword,
      role: Role.APPLICANT,
      isEmailVerified: true,
      isPhoneVerified: true,
      applicantProfile: {
        create: {
          firstName: 'Priya',
          lastName: 'Patel',
          dateOfBirth: new Date('2006-09-22'),
          gender: 'Female',
          category: QuotaCategory.GENERAL,
          guardianName: 'Ramesh Patel',
          guardianPhone: '+919844455500',
          addressLine1: '12 Green Park',
          city: 'Ahmedabad',
          state: 'Gujarat',
          pincode: '380015',
          aadharMasked: 'XXXX-XXXX-8921',
          dpdpConsentGivenAt: new Date(),
        },
      },
    },
  });

  await prisma.applicant.upsert({
    where: { userId: priyaUser.id },
    update: {},
    create: {
      userId: priyaUser.id,
      firstName: 'Priya',
      lastName: 'Patel',
      dateOfBirth: new Date('2006-09-22'),
      gender: 'Female',
      category: QuotaCategory.GENERAL,
      guardianName: 'Ramesh Patel',
      guardianPhone: '+919844455500',
      addressLine1: '12 Green Park',
      city: 'Ahmedabad',
      state: 'Gujarat',
      pincode: '380015',
      aadharMasked: 'XXXX-XXXX-8921',
      dpdpConsentGivenAt: new Date(),
    },
  });
  console.log(`✓ Seeded applicant: ${priyaUser.email}`);

  // 4. Seed Programs and Seat Quotas
  const programsData = [
    {
      code: 'BTECH-CSE-IBM',
      name: 'B.Tech in Computer Science & Engineering (IBM Collaboration)',
      degreeLevel: DegreeLevel.UNDERGRADUATE,
      department: 'University School of Engineering & Technology (USET)',
      durationYears: 4,
      baseFee: 145000,
      applicationFee: 1000,
      eligibilityCriteria: {
        minScorePercentage: 60,
        requiredSubjects: ['Physics', 'Mathematics', 'Chemistry/CS'],
        entranceExamAccepted: ['JEE_MAIN', 'LTSU-SET', 'PUNJAB_CET'],
      },
      quotas: [
        { category: QuotaCategory.GENERAL, totalSeats: 51 },
        { category: QuotaCategory.OBC_NCL, totalSeats: 26 },
        { category: QuotaCategory.SC, totalSeats: 26 },
        { category: QuotaCategory.ST, totalSeats: 5 },
        { category: QuotaCategory.EWS, totalSeats: 10 },
        { category: QuotaCategory.PWD, totalSeats: 2 },
      ],
    },
    {
      code: 'BTECH-ME-TATA',
      name: 'B.Tech in Mechanical Engineering (Smart Manufacturing & EV Tech)',
      degreeLevel: DegreeLevel.UNDERGRADUATE,
      department: 'University School of Engineering & Technology (USET)',
      durationYears: 4,
      baseFee: 110000,
      applicationFee: 1000,
      eligibilityCriteria: {
        minScorePercentage: 55,
        requiredSubjects: ['Physics', 'Mathematics'],
        entranceExamAccepted: ['JEE_MAIN', 'LTSU-SET', 'STATE_CET'],
      },
      quotas: [
        { category: QuotaCategory.GENERAL, totalSeats: 26 },
        { category: QuotaCategory.OBC_NCL, totalSeats: 13 },
        { category: QuotaCategory.SC, totalSeats: 13 },
        { category: QuotaCategory.ST, totalSeats: 3 },
        { category: QuotaCategory.EWS, totalSeats: 5 },
      ],
    },
    {
      code: 'BCA-AI',
      name: 'BCA - Bachelor of Computer Applications (Cloud & AI)',
      degreeLevel: DegreeLevel.UNDERGRADUATE,
      department: 'University School of Computing (USC)',
      durationYears: 3,
      baseFee: 65000,
      applicationFee: 800,
      eligibilityCriteria: {
        minScorePercentage: 50,
        requiredSubjects: ['Mathematics / Computer / Statistics'],
        entranceExamAccepted: ['12th_MERIT', 'LTSU-SET'],
      },
      quotas: [
        { category: QuotaCategory.GENERAL, totalSeats: 26 },
        { category: QuotaCategory.OBC_NCL, totalSeats: 13 },
        { category: QuotaCategory.SC, totalSeats: 13 },
        { category: QuotaCategory.ST, totalSeats: 3 },
        { category: QuotaCategory.EWS, totalSeats: 5 },
      ],
    },
    {
      code: 'BPHARM-RIP',
      name: 'B.Pharm - Bachelor of Pharmacy (Rayat Institute of Pharmacy)',
      degreeLevel: DegreeLevel.UNDERGRADUATE,
      department: 'Rayat Institute of Pharmacy (PCI Approved)',
      durationYears: 4,
      baseFee: 95000,
      applicationFee: 1000,
      eligibilityCriteria: {
        minScorePercentage: 50,
        requiredSubjects: ['Physics', 'Chemistry', 'Biology / Mathematics'],
        entranceExamAccepted: ['12th_MERIT', 'NEET', 'LTSU-SET'],
      },
      quotas: [
        { category: QuotaCategory.GENERAL, totalSeats: 26 },
        { category: QuotaCategory.OBC_NCL, totalSeats: 13 },
        { category: QuotaCategory.SC, totalSeats: 13 },
        { category: QuotaCategory.ST, totalSeats: 3 },
        { category: QuotaCategory.EWS, totalSeats: 5 },
      ],
    },
    {
      code: 'BSC-NURSING',
      name: 'B.Sc. Nursing (University College of Nursing)',
      degreeLevel: DegreeLevel.UNDERGRADUATE,
      department: 'University College of Nursing (PNRC & INC Recognized)',
      durationYears: 4,
      baseFee: 90000,
      applicationFee: 1000,
      eligibilityCriteria: {
        minScorePercentage: 50,
        requiredSubjects: ['Physics', 'Chemistry', 'Biology', 'English'],
        entranceExamAccepted: ['PPMET', 'LTSU_NURSING_ENTRANCE'],
      },
      quotas: [
        { category: QuotaCategory.GENERAL, totalSeats: 22 },
        { category: QuotaCategory.OBC_NCL, totalSeats: 11 },
        { category: QuotaCategory.SC, totalSeats: 11 },
        { category: QuotaCategory.ST, totalSeats: 2 },
        { category: QuotaCategory.EWS, totalSeats: 4 },
      ],
    },
    {
      code: 'BBA-FINTECH',
      name: 'BBA - Bachelor of Business Administration (FinTech & Digital Marketing)',
      degreeLevel: DegreeLevel.UNDERGRADUATE,
      department: 'University School of Commerce & Management (USCM)',
      durationYears: 3,
      baseFee: 60000,
      applicationFee: 800,
      eligibilityCriteria: {
        minScorePercentage: 50,
        requiredSubjects: ['10+2 Any Stream'],
        entranceExamAccepted: ['12th_MERIT', 'LTSU-SET'],
      },
      quotas: [
        { category: QuotaCategory.GENERAL, totalSeats: 26 },
        { category: QuotaCategory.OBC_NCL, totalSeats: 13 },
        { category: QuotaCategory.SC, totalSeats: 13 },
        { category: QuotaCategory.ST, totalSeats: 3 },
        { category: QuotaCategory.EWS, totalSeats: 5 },
      ],
    },
    {
      code: 'MBA-INDUSTRY',
      name: 'MBA - Master of Business Administration (Industry Integrated)',
      degreeLevel: DegreeLevel.POSTGRADUATE,
      department: 'University School of Commerce & Management (USCM)',
      durationYears: 2,
      baseFee: 110000,
      applicationFee: 1000,
      eligibilityCriteria: {
        minScorePercentage: 50,
        requiredGraduation: 'Bachelor Degree in any discipline',
        entranceExamAccepted: ['CAT', 'MAT', 'CMAT', 'LTSU-SET'],
      },
      quotas: [
        { category: QuotaCategory.GENERAL, totalSeats: 26 },
        { category: QuotaCategory.OBC_NCL, totalSeats: 13 },
        { category: QuotaCategory.SC, totalSeats: 13 },
        { category: QuotaCategory.ST, totalSeats: 3 },
        { category: QuotaCategory.EWS, totalSeats: 5 },
      ],
    },
    {
      code: 'MCA-PRO',
      name: 'MCA - Master of Computer Applications',
      degreeLevel: DegreeLevel.POSTGRADUATE,
      department: 'University School of Computing (USC)',
      durationYears: 2,
      baseFee: 85000,
      applicationFee: 1000,
      eligibilityCriteria: {
        minScorePercentage: 50,
        requiredGraduation: 'BCA / B.Sc CS/IT with Mathematics',
        entranceExamAccepted: ['NIMCET', 'LTSU-SET'],
      },
      quotas: [
        { category: QuotaCategory.GENERAL, totalSeats: 18 },
        { category: QuotaCategory.OBC_NCL, totalSeats: 9 },
        { category: QuotaCategory.SC, totalSeats: 9 },
        { category: QuotaCategory.ST, totalSeats: 2 },
        { category: QuotaCategory.EWS, totalSeats: 2 },
      ],
    },
  ];

  for (const prog of programsData) {
    const program = await prisma.program.upsert({
      where: { code: prog.code },
      update: {
        name: prog.name,
        degreeLevel: prog.degreeLevel,
        department: prog.department,
        durationYears: prog.durationYears,
        baseFee: prog.baseFee,
        applicationFee: prog.applicationFee,
        eligibilityCriteria: prog.eligibilityCriteria,
        isActive: true,
      },
      create: {
        code: prog.code,
        name: prog.name,
        degreeLevel: prog.degreeLevel,
        department: prog.department,
        durationYears: prog.durationYears,
        baseFee: prog.baseFee,
        applicationFee: prog.applicationFee,
        eligibilityCriteria: prog.eligibilityCriteria,
        isActive: true,
      },
    });

    for (const q of prog.quotas) {
      await prisma.seatQuota.upsert({
        where: {
          programId_category: {
            programId: program.id,
            category: q.category,
          },
        },
        update: {
          totalSeats: q.totalSeats,
        },
        create: {
          programId: program.id,
          category: q.category,
          totalSeats: q.totalSeats,
          allottedSeats: 0,
          confirmedSeats: 0,
        },
      });
    }

    console.log(`✓ Seeded program: ${program.code} - ${program.name} with ${prog.quotas.length} quota categories`);
  }

  // 5. Initial Audit Log
  const adminUser = await prisma.user.findUnique({ where: { email: 'admin@college.edu' } });
  if (adminUser) {
    await prisma.auditLog.create({
      data: {
        actorId: adminUser.id,
        actorRole: Role.ADMIN,
        action: AuditAction.CONFIG_UPDATED,
        entityType: 'SYSTEM_SEED',
        entityId: 'PHASE_1_INITIAL_SETUP',
        newState: {
          status: 'SUCCESS',
          programsCount: programsData.length,
          timestamp: new Date().toISOString(),
        },
        ipAddress: '127.0.0.1',
        userAgent: 'SeedScript/1.0.0 (Node.js)',
      },
    });
  }

  console.log('✅ Database seed completed successfully!');
}

main()
  .catch((e) => {
    console.error('❌ Error during seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
