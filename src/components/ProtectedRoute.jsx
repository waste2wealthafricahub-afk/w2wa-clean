import { Navigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../services/firebase";

export default function ProtectedRoute({ children, allowedRole }) {
  const [authState, setAuthState] = useState({
    loading: true,
    authorized: false,
    role: null,
  });

  useEffect(() => {
    const auth = getAuth();

    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (!user) {
        setAuthState({
          loading: false,
          authorized: false,
          role: null,
        });
        return;
      }

      try {
        const userRef = doc(db, "users", user.uid);
        const userSnap = await getDoc(userRef);

        if (!userSnap.exists()) {
          setAuthState({
            loading: false,
            authorized: false,
            role: null,
          });
          return;
        }

        const role = userSnap.data().role;

        setAuthState({
          loading: false,
          authorized: role === allowedRole,
          role,
        });
      } catch (error) {
        console.error("Authorization error:", error);
        setAuthState({
          loading: false,
          authorized: false,
          role: null,
        });
      }
    });

    return () => unsubscribe();
  }, [allowedRole]);

  // Show loading spinner
  if (authState.loading) {
    return (
      <div style={loadingContainer}>
        <div style={spinner}></div>
        <p>Verifying access...</p>
      </div>
    );
  }

  // Redirect unauthenticated users
  if (!authState.role) {
    return <Navigate to="/" replace />;
  }

  // Redirect authenticated users with wrong roles
  if (!authState.authorized) {
    if (authState.role === "admin") return <Navigate to="/admin" replace />;
    if (authState.role === "school") return <Navigate to="/school" replace />;
    if (authState.role === "rep") return <Navigate to="/rep" replace />;
    return <Navigate to="/" replace />;
  }

  return children;
}

/* Styles */
const loadingContainer = {
  height: "100vh",
  display: "flex",
  flexDirection: "column",
  justifyContent: "center",
  alignItems: "center",
};

const spinner = {
  width: "40px",
  height: "40px",
  border: "4px solid #ccc",
  borderTop: "4px solid #2c7be5",
  borderRadius: "50%",
  animation: "spin 1s linear infinite",
};