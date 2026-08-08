export default function UserActions({

  user,

  onView,

  onApprove,

  onSuspend,

}) {

  return (

    <div
      style={styles.container}
    >

      <button
        style={styles.view}
        onClick={() =>
          onView(user)
        }
      >
        👁 View
      </button>

      {!user.approved && (

        <button
          style={styles.approve}
          onClick={() =>
            onApprove(user)
          }
        >
          ✅ Approve
        </button>

      )}

      {user.approved && (

        <button
          style={styles.suspend}
          onClick={() =>
            onSuspend(user)
          }
        >
          ⛔ Suspend
        </button>

      )}

    </div>

  );

}

const styles = {

  container:{
    display:"flex",
    gap:"8px",
    flexWrap:"wrap",
  },

  view:{
    background:"#2563eb",
    color:"#fff",
    border:"none",
    borderRadius:"6px",
    padding:"6px 12px",
    cursor:"pointer",
  },

  approve:{
    background:"#16a34a",
    color:"#fff",
    border:"none",
    borderRadius:"6px",
    padding:"6px 12px",
    cursor:"pointer",
  },

  suspend:{
    background:"#dc2626",
    color:"#fff",
    border:"none",
    borderRadius:"6px",
    padding:"6px 12px",
    cursor:"pointer",
  },

};
