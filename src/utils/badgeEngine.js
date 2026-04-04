export function calculateBadges({ waste, sessions, students, activities }) {
  const badges = [];

  if (waste >= 200) badges.push("♻️ Recycling Champion");
  if (sessions >= 5) badges.push("📘 Training Leader");
  if (students >= 100) badges.push("👨‍🎓 Impact Maker");
  if (activities >= 5) badges.push("🏫 Active Club");

  if (waste >= 500 && activities >= 10) {
    badges.push("🌍 Eco Champion");
  }

  return badges;
}