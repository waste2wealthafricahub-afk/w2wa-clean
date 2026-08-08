export default function StatusBadge({
  status,
}) {

  let background = "#fbbf24";
  let color = "#fff";
  let label = "Pending";

  if (status === "approved") {

    background = "#16a34a";
    label = "Approved";

  }

  if (status === "suspended") {

    background = "#dc2626";
    label = "Suspended";

  }

  return (

    <span
      style={{
        background,
        color,
        padding: "6px 12px",
        borderRadius: "20px",
        fontSize: "13px",
        fontWeight: "bold",
        display: "inline-block",
        minWidth: "90px",
        textAlign: "center",
      }}
    >
      {label}
    </span>

  );

}
