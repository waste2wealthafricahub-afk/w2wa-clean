import { useEffect, useState } from "react";
import { db } from "../firebase";
import {
  collection,
  getDocs,
  doc,
  runTransaction
} from "firebase/firestore";

export default function ProofReview() {
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadSubmissions();
  }, []);

  async function loadSubmissions() {
    try {
      setLoading(true);

      const [submissionSnap, emcccSnap, trainingSnap] =
        await Promise.all([
          getDocs(collection(db, "taskSubmissions")),
          getDocs(collection(db, "emcccSchools")),
          getDocs(collection(db, "weeklyTraining"))
        ]);

  const currentWeeks = {};
const schoolNames = {};

emcccSnap.forEach((item) => {
  const data = item.data();

  currentWeeks[item.id] =
    Number(data.nextTrainingWeek) || 1;

  schoolNames[item.id] =
    data.schoolName ||
    data.name ||
    item.id;
});

      const trainingTitles = {};

      trainingSnap.forEach((item) => {
        const data = item.data();

        const week =
          Number(data.week) ||
          Number(data["week 2"]) ||
          0;

        if (week) {
          trainingTitles[week] =
            data.title || `Week ${week}`;
        }
      });

      const list = [];

      submissionSnap.forEach((item) => {
        const data = item.data();

        const weekNumber =
          Number(data.week) || 1;

        const schoolId =
          data.schoolId || "";

        const currentWeek =
          currentWeeks[schoolId] || 1;

        list.push({
  id: item.id,
  ...data,

  schoolName:
    schoolNames[schoolId] ||
    data.schoolName ||
    "School name not recorded",

  schoolId,

  weekNumber,

  currentWeek,

  trainingTitle:
    trainingTitles[weekNumber] ||
    `Week ${weekNumber}`,

  isCurrentWeek:
    weekNumber === currentWeek
});
      });

      // Newest submissions first
      list.sort((a, b) => {
        const aTime =
          a.createdAt?.seconds || 0;

        const bTime =
          b.createdAt?.seconds || 0;

        return bTime - aTime;
      });

      setSubmissions(list);

    } catch (err) {
      console.error(
        "Unable to load submissions:",
        err
      );
    } finally {
      setLoading(false);
    }
  }

  async function updateStatus(id, status) {
    try {
      const submissionRef =
        doc(db, "taskSubmissions", id);

      await runTransaction(
        db,
        async (transaction) => {

          const submissionSnap =
            await transaction.get(
              submissionRef
            );

          if (!submissionSnap.exists()) {
            throw new Error(
              "Submission no longer exists."
            );
          }

          const submission =
            submissionSnap.data();

          if (
            submission.status ===
              "approved" &&
            status === "approved"
          ) {
            return;
          }

          if (status === "rejected") {
            transaction.update(
              submissionRef,
              {
                status: "rejected"
              }
            );

            return;
          }

          if (status === "approved") {

            const schoolId =
              submission.schoolId;

            const weekNumber =
              Number(submission.week) || 1;

            if (!schoolId) {
              throw new Error(
                "Submission has no schoolId."
              );
            }

            const emcccRef =
              doc(
                db,
                "emcccSchools",
                schoolId
              );

            const emcccSnap =
              await transaction.get(
                emcccRef
              );

            if (!emcccSnap.exists()) {
              throw new Error(
                "EMCCC record not found for this school."
              );
            }

            const emccc =
              emcccSnap.data();

            const currentNextWeek =
              Number(
                emccc.nextTrainingWeek
              ) || 1;

            // Safety check:
            // Only the school's current week
            // can be approved for advancement.
            if (
              currentNextWeek !==
              weekNumber
            ) {
              throw new Error(
                `This submission is for Week ${weekNumber}, but the school is currently on Week ${currentNextWeek}.`
              );
            }

            const nextWeek =
              Math.min(
                weekNumber + 1,
                10
              );

            const emcccUpdate = {
              weekCompleted: weekNumber,
              nextTrainingWeek: nextWeek,
              status:
                weekNumber === 10
                  ? "graduated"
                  : "training"
            };

            // Week 1 is the EMCCC Launch Ceremony.
            // Once Week 1 is approved, record the launch date.
            if (weekNumber === 1) {
              emcccUpdate.launchDate = new Date();
            }

            transaction.update(
              emcccRef,
              emcccUpdate
            );

            transaction.update(
              submissionRef,
              {
                status: "approved",
                approvedAt: new Date()
              }
            );
          }
        }
      );

      alert(
        status === "approved"
          ? "Submission approved. School advanced to the next week."
          : "Submission rejected."
      );

      await loadSubmissions();

    } catch (err) {
      console.error(
        "Status update error:",
        err
      );

      alert(
        err.message ||
        "Unable to update submission."
      );
    }
  }

  if (loading) {
    return (
      <div style={{ padding: "20px" }}>
        Loading Proof Review...
      </div>
    );
  }

  return (
    <div
      style={{
        padding: "20px",
        maxWidth: "1000px",
        margin: "0 auto"
      }}
    >
      <h1>Proof Review</h1>

      <p>
        Review school weekly activities before
        approving progression to the next week.
      </p>

      {submissions.filter(
  (s) =>
    s.status !== "approved" &&
    s.status !== "rejected" &&
    s.isCurrentWeek
).length === 0 && (
  <p>No pending submissions requiring review.</p>
)}
    {submissions
  .filter(
    (s) =>
      s.status !== "approved" &&
      s.status !== "rejected" &&
      s.isCurrentWeek
  )
  .map((s) => (
        <div
          key={s.id}
          style={{
            border: "1px solid #ccc",
            padding: "20px",
            marginBottom: "20px",
            borderRadius: "10px",
            background:
              s.isCurrentWeek
                ? "#f0fff4"
                : "#f8f8f8"
          }}
        >
          <h2>
            {s.schoolName ||
              "School name not recorded"}
          </h2>

          <p>
            <strong>Training:</strong>{" "}
            {s.trainingTitle}
          </p>

          <p>
            <strong>Submitted Week:</strong>{" "}
            {s.weekNumber}
          </p>

          <p>
            <strong>School Current Week:</strong>{" "}
            {s.currentWeek}
          </p>

          <p>
            <strong>Tasks Completed:</strong>{" "}
            {s.score || 0}/{s.totalTasks || 0}
          </p>

          <p>
            <strong>Status:</strong>{" "}
            {s.status || "pending"}
          </p>

          {s.isCurrentWeek ? (
            <p
              style={{
                color: "#15803d",
                fontWeight: "bold"
              }}
            >
              This is the school's current week.
            </p>
          ) : (
            <p
              style={{
                color: "#b45309",
                fontWeight: "bold"
              }}
            >
              Out-of-sequence submission.
              Approval is disabled.
            </p>
          )}

          {s.proofImage && (
            <div style={{ marginTop: "10px" }}>
              <p>
                <strong>Proof:</strong>
              </p>

              <img
                src={s.proofImage}
                alt="Weekly activity proof"
                style={{
                  maxWidth: "300px",
                  borderRadius: "8px"
                }}
              />
            </div>
          )}

          <div
            style={{
              marginTop: "15px"
            }}
          >
            <button
              onClick={() =>
                updateStatus(
                  s.id,
                  "approved"
                )
              }
              disabled={
                s.status === "approved" ||
                !s.isCurrentWeek
              }
              style={{
                padding: "8px 14px",
                background:
                  s.status === "approved" ||
                  !s.isCurrentWeek
                    ? "#ccc"
                    : "#16a34a",
                color: "#fff",
                border: "none",
                borderRadius: "6px",
                cursor:
                  s.status === "approved" ||
                  !s.isCurrentWeek
                    ? "not-allowed"
                    : "pointer"
              }}
            >
              Approve
            </button>

            <button
              onClick={() =>
                updateStatus(
                  s.id,
                  "rejected"
                )
              }
              disabled={
                s.status === "rejected"
              }
              style={{
                marginLeft: "10px",
                padding: "8px 14px",
                background: "#dc2626",
                color: "#fff",
                border: "none",
                borderRadius: "6px",
                cursor:
                  s.status === "rejected"
                    ? "not-allowed"
                    : "pointer"
              }}
            >
              Reject
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}


