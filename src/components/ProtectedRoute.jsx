import { Navigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { auth, db } from "../firebase";
import {
  collection,
  query,
  where,
  getDocs,
} from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";

export default function ProtectedRoute({
  children,
  allowedRole,
}) {
  const [loading, setLoading] =
    useState(true);

  const [authorized, setAuthorized] =
    useState(false);

  useEffect(() => {
    const unsubscribe =
      onAuthStateChanged(
        auth,
        async (user) => {
          try {
            if (!user) {
              setAuthorized(false);
              setLoading(false);
              return;
            }

            // =====================
            // ADMIN
            // =====================
            if (
              allowedRole === "admin" &&
              user.email ===
                "waste2wealthafricahub@gmail.com"
            ) {
              setAuthorized(true);
              setLoading(false);
              return;
            }

            // =====================
            // SCHOOL
            // =====================
            if (
              allowedRole === "school"
            ) {
              const schoolQuery =
                query(
                  collection(
                    db,
                    "schools"
                  ),
                  where(
                    "email",
                    "==",
                    user.email
                  )
                );

              const schoolSnapshot =
                await getDocs(
                  schoolQuery
                );

              if (
                !schoolSnapshot.empty
              ) {
                setAuthorized(true);
              } else {
                setAuthorized(false);
              }

              setLoading(false);
              return;
            }

// =====================
// MONITOR
// =====================
if (
  allowedRole === "monitor"
) {
  // Admin can also access monitoring dashboard
  if (
    user.email ===
    "waste2wealthafricahub@gmail.com"
  ) {
    setAuthorized(true);
    setLoading(false);
    return;
  }

  const monitorQuery =
    query(
      collection(
        db,
        "monitors"
      ),
      where(
        "email",
        "==",
        user.email
      )
    );

  const monitorSnapshot =
    await getDocs(
      monitorQuery
    );

  if (
    !monitorSnapshot.empty
  ) {
    const monitorData =
      monitorSnapshot.docs[0].data();

    setAuthorized(
      monitorData.approved
    );
  } else {
    setAuthorized(false);
  }

  setLoading(false);
  return;
}
            // =====================
            // REPRESENTATIVE
            // =====================
            if (
              allowedRole ===
              "representative"
            ) {
              const repQuery =
                query(
                  collection(
                    db,
                    "representatives"
                  ),
                  where(
                    "email",
                    "==",
                    user.email
                  )
                );

              const repSnapshot =
                await getDocs(
                  repQuery
                );

              if (
                !repSnapshot.empty
              ) {
                const repData =
                  repSnapshot.docs[0].data();

                setAuthorized(
                  repData.approved
                );
              } else {
                setAuthorized(false);
              }

              setLoading(false);
              return;
            }

            // FALLBACK
            setAuthorized(false);
            setLoading(false);
            return;

          } catch (error) {
            console.error(error);
            setAuthorized(false);
            setLoading(false);
          }
        }
      );

    return () => unsubscribe();
  }, [allowedRole]);

  if (loading) {
    return (
      <div style={{ padding: "30px" }}>
        <h2>Loading...</h2>
      </div>
    );
  }

  if (!authorized) {
    return <Navigate to="/" />;
  }

  return children;
}