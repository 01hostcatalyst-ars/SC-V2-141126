import { prisma } from '../src/lib/prisma';
import { YOUTUBE_16_KNOTS } from '../src/lib/calculator/constants';

async function updateDatabaseKnots() {
  console.log('--- UPDATING YOUTUBE KNOTS IN DATABASE ---');

  for (const knot of YOUTUBE_16_KNOTS) {
    const updated = await prisma.calculatorPlatformKnot.update({
      where: {
        platform_knotId: {
          platform: 'youtube',
          knotId: knot.knotId,
        },
      },
      data: {
        rates: knot.rates,
        followers: knot.followers,
        benchmarkEr: knot.benchmarkEr,
        expectedViews: knot.expectedViews,
      },
    });

    console.log(`Updated ${updated.knotId} (${updated.followers.toLocaleString()} subs): Dedicated $${knot.rates.yt_dedicated}, Integrated $${knot.rates.yt_integrated}`);
  }

  console.log('\n--- VERIFYING FROM DATABASE ---');
  const dbKnots = await prisma.calculatorPlatformKnot.findMany({
    where: { platform: 'youtube' },
    orderBy: { followers: 'asc' },
  });

  console.log('Knot | Followers | ExpectedViews | Rates JSON');
  for (const k of dbKnots) {
    console.log(`${k.knotId.padEnd(4)} | ${k.followers.toString().padEnd(9)} | ${String(k.expectedViews).padEnd(13)} | ${JSON.stringify(k.rates)}`);
  }

  await prisma.$disconnect();
}

updateDatabaseKnots().catch((err) => {
  console.error('Failed to update knots in database:', err);
  process.exit(1);
});
