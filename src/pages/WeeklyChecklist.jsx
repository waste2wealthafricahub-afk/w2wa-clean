import { useEffect, useState } from "react";
import { onAuthStateChanged } from "firebase/auth";
import {
  collection,
  doc,
  getDoc,
  getDocs,
  addDoc
} from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";

import { auth, db, storage } from "../firebase";
import { getUserSchool } from "../utils/getUserSchool";

export default function WeeklyChecklist() {
  const [school, setSchool] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [selectedTasks, setSelectedTasks] = useState([]);
  const [file, setFile] = useState(null);
  const [currentWeek, setCurrentWeek] = useState(null);
  const [trainingTitle, setTrainingTitle] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        loadData(user);
      } else {
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, []);

  async function loadData(user) {
    try {
      setLoading(true);

      // 1. Find the school belonging to the logged-in user
      const schoolData = await getUserSchool(
        user.uid,
        user.email
      );

      if (!schoolData) {
        console.error("No school found for this user.");
        setLoading(false);
        return;
      }

      setSchool(schoolData);

      // 2. Find the school's EMCCC record
      const schoolId = schoolData.schoolId || schoolData.id;

      const emcccRef = doc(
        db,
        "emcccSchools",
        schoolId
      );

      const emcccSnap = await getDoc(emcccRef);

      if (!emcccSnap.exists()) {
        console.error(
          "No EMCCC record found for school:",
          schoolId
        );
        setLoading(false);
        return;
      }

      const emcccData = emcccSnap.data();

      // 3. Determine the next training week
      const weekNumber =
        emcccData.nextTrainingWeek || 1;

      setCurrentWeek(weekNumber);

      // 4. Build the weekly document prefix
      const weekId =
        `week${String(weekNumber).padStart(2, "0")}`;

      console.log(
        "Looking for training week:",
        weekId
      );

      // 5. Get weekly training documents
      const trainingSnapshot = await getDocs(
        collection(db, "weeklyTraining")
      );

      // 6. Find the document whose ID starts with week01, week02, etc.
      const trainingDoc =
        trainingSnapshot.docs.find((training) =>
          training.id.startsWith(weekId)
        );

      if (!trainingDoc) {
        console.error(
          "No weekly training document found for:",
          weekId
        );

        setTasks([]);
        setLoading(false);
        return;
      }

      // 7. Read the training document
      const trainingData = trainingDoc.data();

      console.log(
        "Training document found:",
        trainingDoc.id
      );

      console.log(
        "Training data:",
        trainingData
      );

      setTrainingTitle(
        trainingData.title || ""
      );

      // Firestore currently uses "task" (singular)
      // but support "tasks" too.
      const taskList =
        trainingData.task ||
        trainingData.tasks ||
        [];

      setTasks(taskList);

    } catch (err) {
      console.error(
        "Weekly checklist loading error:",
        err
      );
    } finally {
      setLoading(false);
    }
  }

  function toggleTask(task) {
    setSelectedTasks((previous) => {
      if (previous.includes(task)) {
        return previous.filter(
          (item) => item !== task
        );
      }

      return [...previous, task];
    });
  }

  async function submitTasks() {
    try {
      if (!school) {
        alert("No school found.");
        return;
      }

      if (!currentWeek) {
        alert("Training week not loaded.");
        return;
      }

      let imageUrl = "";

      // Upload proof image if selected
      if (file) {
        const storageRef = ref(
          storage,
          `proofs/${school.id}_${Date.now()}_${file.name}`
        );

        await uploadBytes(
          storageRef,
          file
        );

        imageUrl =
          await getDownloadURL(storageRef);
      }

      await addDoc(
        collection(db, "taskSubmissions"),
        {
          schoolId: school.schoolId || school.id,
          schoolName: school.name || "",
          week: currentWeek,
          completedTasks: selectedTasks,
          totalTasks: tasks.length,
          score: selectedTasks.length,
          proofImage: imageUrl,
          status: "pending",
          createdAt: new Date()
        }
      );

      alert("Weekly tasks submitted successfully.");

      setSelectedTasks([]);
      setFile(null);

    } catch (err) {
      console.error(
        "Task submission error:",
        err
      );

      alert(
        "Unable to submit weekly tasks. Please try again."
      );
    }
  }

  if (loading) {
    return (
      <p style={{ textAlign: "center" }}>
        Loading...
      </p>
    );
  }

  if (!school) {
    return (
      <p style={{ textAlign: "center" }}>
        No school found for this account.
      </p>
    );
  }

  return (
    <div
      style={{
        padding: "20px",
        maxWidth: "600px",
        margin: "0 auto"
      }}
    >
      <h1>
        Weekly Checklist
      </h1>

      <h3>
        {school.name}
      </h3>

      <p>
        <strong>Week:</strong>{" "}
        {currentWeek
          ? String(currentWeek).padStart(2, "0")
          : "-"}
      </p>

      {trainingTitle && (
        <h2>
          {trainingTitle}
        </h2>
      )}

      <div
        style={{
          marginTop: "20px"
        }}
      >
        {tasks.length === 0 && (
          <p>
            No tasks found for this week.
          </p>
        )}

        {tasks.map((task, index) => (
          <div
            key={index}
            style={{
              marginBottom: "12px"
            }}
          >
            <label>
              <input
                type="checkbox"
                checked={selectedTasks.includes(task)}
                onChange={() =>
                  toggleTask(task)
                }
              />{" "}
              {task}
            </label>
          </div>
        ))}
      </div>

      <div
        style={{
          marginTop: "20px"
        }}
      >
        Upload Proof (optional)

        <br />

        <input
          type="file"
          accept="image/*"
          onChange={(e) =>
            setFile(
              e.target.files?.[0] || null
            )
          }
        />
      </div>

      <div
        style={{
          marginTop: "20px"
        }}
      >
        <button
          type="button"
          onClick={submitTasks}
        >
          Submit Weekly Tasks
        </button>
      </div>
    </div>
  );
}


