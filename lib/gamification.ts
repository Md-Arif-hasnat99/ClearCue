export type GamificationBadge =
  | "first_practice"
  | "streak_3"
  | "streak_7"
  | "streak_30";

export type GamificationSummary = {
  currentStreak: number;
  longestStreak: number;
  lastPracticeDate: string | null;
  badges: GamificationBadge[];
  awardedBadges: GamificationBadge[];
  nextMilestone: number | null;
  progressToNextMilestone: number;
};

type PracticeProgressInput = {
  currentStreak?: number;
  longestStreak?: number;
  lastPracticeDate?: string | null;
  badges?: GamificationBadge[];
};

export type PracticeProgressResult = GamificationSummary & {
  shouldPersist: boolean;
  incrementedToday: boolean;
};

type StreakMilestone = {
  day: number;
  badge: GamificationBadge;
};

const DAY_IN_MS = 24 * 60 * 60 * 1000;

const STREAK_MILESTONES: readonly StreakMilestone[] = [
  { day: 1, badge: "first_practice" },
  { day: 3, badge: "streak_3" },
  { day: 7, badge: "streak_7" },
  { day: 30, badge: "streak_30" },
];

const clampStreak = (value: number) => {
  if (!Number.isFinite(value)) {
    return 0;
  }

  return Math.max(0, Math.floor(value));
};

const toDayKey = (date: Date) => date.toISOString().slice(0, 10);

const parseDayKeyToDate = (dayKey: string) => {
  const normalized = dayKey.trim();

  if (!/^\d{4}-\d{2}-\d{2}$/.test(normalized)) {
    return null;
  }

  const parsed = new Date(`${normalized}T00:00:00.000Z`);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
};

const normalizeBadges = (badges: GamificationBadge[] | undefined) => {
  if (!Array.isArray(badges) || badges.length === 0) {
    return [] as GamificationBadge[];
  }

  const milestoneBadges = new Set(STREAK_MILESTONES.map((item) => item.badge));

  return Array.from(new Set(badges)).filter((badge): badge is GamificationBadge =>
    milestoneBadges.has(badge)
  );
};

const calculateNextMilestone = (currentStreak: number) => {
  const next = STREAK_MILESTONES.find((milestone) => milestone.day > currentStreak);
  return next?.day ?? null;
};

const calculateProgressToNextMilestone = (
  currentStreak: number,
  nextMilestone: number | null
) => {
  if (!nextMilestone) {
    return 100;
  }

  return Math.min(100, Math.round((currentStreak / nextMilestone) * 100));
};

const buildSummary = (
  currentStreak: number,
  longestStreak: number,
  lastPracticeDate: string | null,
  badges: GamificationBadge[],
  awardedBadges: GamificationBadge[]
): GamificationSummary => {
  const nextMilestone = calculateNextMilestone(currentStreak);

  return {
    currentStreak,
    longestStreak,
    lastPracticeDate,
    badges,
    awardedBadges,
    nextMilestone,
    progressToNextMilestone: calculateProgressToNextMilestone(currentStreak, nextMilestone),
  };
};

export const getGamificationSummary = (
  input: PracticeProgressInput,
  awardedBadges: GamificationBadge[] = []
): GamificationSummary => {
  const currentStreak = clampStreak(input.currentStreak ?? 0);
  const longestStreak = Math.max(clampStreak(input.longestStreak ?? 0), currentStreak);
  const badges = normalizeBadges(input.badges);
  const lastPracticeDate = input.lastPracticeDate?.trim() || null;

  return buildSummary(currentStreak, longestStreak, lastPracticeDate, badges, awardedBadges);
};

export const applyPracticeCompletion = (
  input: PracticeProgressInput,
  now = new Date()
): PracticeProgressResult => {
  const todayKey = toDayKey(now);
  const previousDayKey = input.lastPracticeDate?.trim() || null;

  const previousCurrentStreak = clampStreak(input.currentStreak ?? 0);
  const previousLongestStreak = clampStreak(input.longestStreak ?? 0);
  const previousBadges = normalizeBadges(input.badges);

  let currentStreak = previousCurrentStreak;
  let incrementedToday = false;

  if (!previousDayKey) {
    currentStreak = 1;
    incrementedToday = true;
  } else if (previousDayKey === todayKey) {
    return {
      ...buildSummary(
        previousCurrentStreak,
        Math.max(previousLongestStreak, previousCurrentStreak),
        previousDayKey,
        previousBadges,
        []
      ),
      shouldPersist: false,
      incrementedToday: false,
    };
  } else {
    const previousDate = parseDayKeyToDate(previousDayKey);
    const todayDate = parseDayKeyToDate(todayKey);

    if (!previousDate || !todayDate) {
      currentStreak = 1;
      incrementedToday = true;
    } else {
      const dayDifference = Math.round((todayDate.getTime() - previousDate.getTime()) / DAY_IN_MS);

      if (dayDifference === 1) {
        currentStreak = previousCurrentStreak + 1;
      } else {
        currentStreak = 1;
      }

      incrementedToday = true;
    }
  }

  const longestStreak = Math.max(previousLongestStreak, currentStreak);
  const nextBadges = [...previousBadges];
  const awardedBadges: GamificationBadge[] = [];

  for (const milestone of STREAK_MILESTONES) {
    if (currentStreak >= milestone.day && !nextBadges.includes(milestone.badge)) {
      nextBadges.push(milestone.badge);
      awardedBadges.push(milestone.badge);
    }
  }

  return {
    ...buildSummary(currentStreak, longestStreak, todayKey, nextBadges, awardedBadges),
    shouldPersist: true,
    incrementedToday,
  };
};
