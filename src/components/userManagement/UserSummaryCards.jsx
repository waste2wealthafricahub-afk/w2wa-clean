function Card({
  title,
  value,
  color,
}) {
  return (
    <div
      style={{
        background: "#fff",
        borderLeft: `6px solid ${color}`,
        borderRadius: "10px",
        padding: "20px",
        boxShadow:
          "0 2px 8px rgba(0,0,0,0.08)",
      }}
    >
      <h4
        style={{
          marginBottom: "10px",
          color: "#666",
        }}
      >
        {title}
      </h4>

      <h2
        style={{
          margin: 0,
        }}
      >
        {value}
      </h2>
    </div>
  );
}

export default function UserSummaryCards({

  schools,

  representatives,

  monitors,

}) {

  const pendingUsers =

    [
      ...schools,
      ...representatives,
      ...monitors,
    ].filter(

      user =>

  !user.approved

    ).length;

  return (

    <div
      style={styles.grid}
    >

      <Card
        title="Schools"
        value={schools.length}
        color="#2563eb"
      />

      <Card
        title="Representatives"
        value={representatives.length}
        color="#16a34a"
      />

      <Card
        title="Monitors"
        value={monitors.length}
        color="#9333ea"
      />

      <Card
        title="Pending Approval"
        value={pendingUsers}
        color="#f59e0b"
      />

    </div>

  );

}

const styles = {

  grid:{
    display:"grid",
    gridTemplateColumns:
      "repeat(auto-fit,minmax(220px,1fr))",
    gap:"20px",
    marginTop:"20px",
    marginBottom:"30px",
  },

};
