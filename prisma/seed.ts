import { prisma } from "../src/lib/prisma";
import bcrypt from "bcryptjs";

async function main() {
  console.log("Seeding initial user and applications data...");

  // Clear existing
  await prisma.applicationActivity.deleteMany({});
  await prisma.application.deleteMany({});
  await prisma.user.deleteMany({});

  // Create demo user
  const hashedPassword = await bcrypt.hash("password123", 10);
  const demoUser = await prisma.user.create({
    data: {
      name: "Demo User",
      email: "demo@example.com",
      password: hashedPassword,
    },
  });

  console.log(`Created demo user: ${demoUser.email} (password: password123)`);

  const applications = [
    {
      userId: demoUser.id,
      company: "Google",
      position: "Senior Software Engineer",
      location: "Mountain View, CA (Hybrid)",
      salary: "$180,000 - $220,000",
      jobUrl: "https://careers.google.com/jobs/results/12345",
      status: "APPLIED",
      interviewed: false,
      notes: "Submitted via Google Careers portal. Applied with updated resume v3.",
      dateApplied: new Date("2026-08-01"),
    },
    {
      userId: demoUser.id,
      company: "Microsoft",
      position: "Full Stack Developer",
      location: "Redmond, WA (Remote)",
      salary: "$165,000 - $195,000",
      jobUrl: "https://careers.microsoft.com/us/en/job/67890",
      status: "INTERVIEWING",
      interviewed: true,
      notes: "First technical screening completed with Tech Lead. Next stage is System Design interview on Aug 12.",
      dateApplied: new Date("2026-07-20"),
    },
    {
      userId: demoUser.id,
      company: "Amazon",
      position: "Frontend Engineer II",
      location: "Seattle, WA (On-site)",
      salary: "$160,000 - $190,000",
      jobUrl: "https://amazon.jobs/en/jobs/23456",
      status: "INTERVIEWING",
      interviewed: true,
      notes: "Completed OA assessment (100% test cases). Phone screen scheduled for tomorrow.",
      dateApplied: new Date("2026-07-25"),
    },
    {
      userId: demoUser.id,
      company: "Meta",
      position: "Product Software Engineer",
      location: "Menlo Park, CA (Hybrid)",
      salary: "$190,000 - $230,000",
      jobUrl: "https://www.metacareers.com/jobs/34567",
      status: "OFFER",
      interviewed: true,
      notes: "Received official offer letter! Base $200k + $50k RSUs. Negotiating start date.",
      dateApplied: new Date("2026-07-05"),
    },
    {
      userId: demoUser.id,
      company: "Apple",
      position: "iOS Software Engineer",
      location: "Cupertino, CA",
      salary: "$175,000 - $210,000",
      jobUrl: "https://jobs.apple.com/en-us/details/45678",
      status: "REJECTED",
      interviewed: true,
      notes: "Made it to final loop stage. Rejection email received. Keep networking with hiring manager.",
      dateApplied: new Date("2026-06-15"),
    },
    {
      userId: demoUser.id,
      company: "Stripe",
      position: "Backend Engineer - Infrastructure",
      location: "San Francisco, CA (Remote)",
      salary: "$185,000 - $225,000",
      jobUrl: "https://stripe.com/jobs/56789",
      status: "APPLIED",
      interviewed: false,
      notes: "Employee referral from Alex. Applied on Aug 4.",
      dateApplied: new Date("2026-08-04"),
    },
    {
      userId: demoUser.id,
      company: "Vercel",
      position: "Next.js Solutions Engineer",
      location: "Remote",
      salary: "$170,000 - $200,000",
      jobUrl: "https://vercel.com/careers/67890",
      status: "INTERVIEWING",
      interviewed: true,
      notes: "Take-home assignment submitted. Recruiter confirmed team review is in progress.",
      dateApplied: new Date("2026-07-28"),
    },
  ];

  for (const app of applications) {
    const createdApp = await prisma.application.create({
      data: app,
    });

    await prisma.applicationActivity.create({
      data: {
        applicationId: createdApp.id,
        type: "INITIAL_LOG",
        description: `Logged application for ${app.position} at ${app.company} with status ${app.status}`,
      },
    });
  }

  console.log(`Successfully seeded ${applications.length} applications for user ${demoUser.email}.`);
}

main()
  .catch((e) => {
    console.error("Error seeding database:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
