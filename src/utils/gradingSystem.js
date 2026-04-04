export function getGrade({ waste, sessions, students, activities }) {
  let score = 0;

  // ♻️ Waste impact
  score += Math.min(waste / 10, 30);

  // 🎓 Training sessions
  score += Math.min(sessions * 5, 25);

  // 👨‍🎓 Student reach
  score += Math.min(students / 10, 25);

  // 📘 Club activity participation (NEW)
  score += Math.min(activities * 10, 20);

  if (score >= 80) return "A";
  if (score >= 60) return "B";
  if (score >= 40) return "C";
  if (score >= 20) return "D";
  return "F";
}