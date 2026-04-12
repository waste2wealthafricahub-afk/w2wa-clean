import { useState } from "react";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { auth, db } from "../services/firebase";
import { useNavigate } from "react-router-dom";

export default function SchoolRegistration() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    schoolName: "",
    address: "",
    contactPerson: "",
    phone: "",
    email: "",
    password: "",
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      // Create user account
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        formData.email,
        formData.password
      );

      // Save school details to Firestore
      await addDoc(collection(db, "schools"), {
        uid: userCredential.user.uid,
        schoolName: formData.schoolName,
        address: formData.address,
        contactPerson: formData.contactPerson,
        phone: formData.phone,
        email: formData.email,
        role: "school",
        status: "pending",
        createdAt: serverTimestamp(),
      });

      alert("Registration successful! Await admin approval.");
      navigate("/");
    } catch (error) {
      alert("Error: " + error.message);
    }
  };

  return (
    <div style={styles.container}>
      <h2>School Registration</h2>
      <form onSubmit={handleSubmit} style={styles.form}>
        <input name="schoolName" placeholder="School Name" onChange={handleChange} required />
        <input name="address" placeholder="School Address" onChange={handleChange} required />
        <input name="contactPerson" placeholder="Contact Person" onChange={handleChange} required />
        <input name="phone" placeholder="Phone Number" onChange={handleChange} required />
        <input type="email" name="email" placeholder="Email" onChange={handleChange} required />
        <input type="password" name="password" placeholder="Password" onChange={handleChange} required />
        <button type="submit">Register School</button>
      </form>
    </div>
  );
}

const styles = {
  container: {
    maxWidth: "400px",
    margin: "50px auto",
    textAlign: "center",
  },
  form: {
    display: "flex",
    flexDirection: "column",
    gap: "10px",
  },
};