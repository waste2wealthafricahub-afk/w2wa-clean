export default function UserTabs({

  activeTab,

  setActiveTab,

}) {

  const tabs = [

    {
      key: "schools",
      label: "🏫 Schools",
    },

    {
      key: "representatives",
      label: "👥 Representatives",
    },

    {
      key: "monitors",
      label: "🛡 Monitors",
    },

  ];

  return (

    <div
      style={styles.container}
    >

      {tabs.map((tab) => (

        <button

          key={tab.key}

          onClick={() =>
            setActiveTab(tab.key)
          }

          style={
            activeTab === tab.key
              ? styles.activeButton
              : styles.button
          }

        >

          {tab.label}

        </button>

      ))}

    </div>

  );

}

const styles = {

  container: {
    display: "flex",
    gap: "10px",
    marginBottom: "20px",
    flexWrap: "wrap",
  },

  button: {
    padding: "12px 18px",
    background: "#e5e7eb",
    border: "none",
    borderRadius: "8px",
    cursor: "pointer",
    fontWeight: "bold",
    transition: "0.3s",
  },

  activeButton: {
    padding: "12px 18px",
    background: "#2563eb",
    color: "#fff",
    border: "none",
    borderRadius: "8px",
    cursor: "pointer",
    fontWeight: "bold",
  },

};
