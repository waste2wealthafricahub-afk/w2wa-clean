export function generateWeeklyReport({ data, topSchool }) {
  return `
📊 WEEKLY WASTE REPORT

🏆 School of the Week:
${topSchool?.schoolName || "N/A"}

♻️ Waste: ${topSchool?.total || 0} kg
💰 Value: ₦${topSchool?.totalValue || 0}

🌍 Total Waste: ${data.totalWaste} kg
💰 Total Value: ₦${data.totalValue}

👨‍🎓 Students: ${data.students}
📘 Sessions: ${data.sessions}

Keep pushing! 🚀
  `;
}