import { useState, useEffect } from "react";
import { db, storage, auth } from "../firebase";
import { collection, addDoc, doc, getDoc } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";

export default function WasteEntry() {
  const [weight, setWeight] = useState("");
  const [wasteType, setWasteType] = useState("plastic");

  const [image, setImage] = useState(null);
  const [location, setLocation] = useState(null);

  const [schoolId, setSchoolId] = useState("");
  const [schoolName, setSchoolName] = useState("");

  const [loading, setLoading] = useState(false);
  const [gettingLocation, setGettingLocation] = useState(false);

  // 🏫 Load assigned school
  useEffect(() => {
    const loadUserSchool = async () => {
      const user = auth.currentUser;
      if (!user) return;

      const userRef = doc(db, "users", user.uid);
      const snap = await getDoc(userRef);

      if (snap.exists()) {
        const data = snap.data();

        if (data.assignedSchoolId) {
          setSchoolId(data.assignedSchoolId);
          setSchoolName(data.assignedSchoolName || "Assigned School");
        }

        if (data.assignedSchoolIds?.length > 0) {
          setSchoolId(data.assignedSchoolIds[0]);
        }
      }
    };

    loadUserSchool();
  }, []);

  // 📸 Upload Image
  const uploadImage = async () => {
    if (!image) return "";

    const imageRef = ref(storage, `waste/${Date.now()}-${image.name}`);
    await uploadBytes(imageRef, image);
    return await getDownloadURL(imageRef);
  };

  // 📍 Get Location
  const getLocation = () => {
    if (!navigator.geolocation) {
      alert("Geolocation not supported");
      return;
    }

    setGettingLocation(true);

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setLocation({
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
        });
        setGettingLocation(false);
      },
      () => {
        alert("Location access denied");
        setGettingLocation(false);
      }
    );
  };

  // 🚀 Submit
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!weight) {
      alert("Enter weight");
      return;
    }

    if (!schoolId) {
      alert("No school assigned");
      return;
    }

    setLoading(true);

    try {
      const user = auth.currentUser;

      let imageUrl = "";
      if (image) imageUrl = await uploadImage();

      await addDoc(collection(db, "pendingLogs"), {
        wasteType,
        totalWeight: Number(weight),
        imageUrl,
        location,
        schoolId,
        repId: user?.uid || "",
        status: "pending",
        createdAt: new Date(),
      });

      alert("Submitted successfully");

      // Reset
      setWeight("");
      setImage(null);
      setLocation(null);
    } catch (err) {
      console.error(err);
      alert("Error submitting");
    }

    setLoading(false);
  };

  return (
    <div style={container}>
      <h2>Waste Entry</h2>

      {/* 🏫 School Display */}
      <div style={schoolBox}>
        <strong>School:</strong> {schoolName || "Loading..."}
      </div>

      <form onSubmit={handleSubmit}>
        {/* Waste Type */}
        <select
          value={wasteType}
          onChange={(e) => setWasteType(e.target.value)}
          style={input}
        >
          <option value="plastic">Plastic</option>
          <option value="paper">Paper</option>
          <option value="metal">Metal</option>
        </select>

        {/* Weight */}
        <input
          type="number"
          placeholder="Weight (kg)"
          value={weight}
          onChange={(e) => setWeight(e.target.value)}
          style={input}
        />

        {/* 📸 Camera Upload */}
        <input
          type="file"
          accept="image/*"
          capture="environment"
          onChange={(e) => setImage(e.target.files[0])}
          style={input}
        />

        {/* Preview */}
        {image && (
          <img
            src={URL.createObjectURL(image)}
            alt="preview"
            style={preview}
          />
        )}

        {/* 📍 Location */}
        <button type="button" onClick={getLocation} style={locBtn}>
          {gettingLocation ? "Getting location..." : "Capture Location"}
        </button>

        {location && (
          <p style={locationText}>
            📍 {location.lat}, {location.lng}
          </p>
        )}

        {/* Submit */}
        <button type="submit" disabled={loading} style={submitBtn}>
          {loading ? "Submitting..." : "Submit Waste"}
        </button>
      </form>
    </div>
  );
}

// 🎨 Styles
const container = {
  maxWidth: "400px",
  margin: "auto",
  padding: "20px",
};

const schoolBox = {
  marginBottom: "10px",
  padding: "10px",
  background: "#f5f5f5",
  borderRadius: "5px",
};

const input = {
  width: "100%",
  padding: "10px",
  marginBottom: "10px",
};

const submitBtn = {
  width: "100%",
  padding: "10px",
  background: "green",
  color: "white",
  border: "none",
};

const locBtn = {
  width: "100%",
  padding: "10px",
  background: "orange",
  color: "white",
  border: "none",
  marginBottom: "10px",
};

const preview = {
  width: "100%",
  marginBottom: "10px",
};

const locationText = {
  fontSize: "12px",
  marginBottom: "10px",
};