import StatusBadge from "./StatusBadge";
import UserActions from "./UserActions";

export default function UserTable({

  users,

  type,

  onView,

  onApprove,

  onSuspend,

}) {

  function getDisplayName(user) {

    if (type === "school") {

      return user.schoolName;

    }

    return user.fullName;

  }

  if (users.length === 0) {

    return (

      <div
        style={styles.empty}
      >

        No records found.

      </div>

    );

  }

  return (

    <table
      style={styles.table}
    >

      <thead>

        <tr>

          <th style={styles.th}>
            Name
          </th>

          <th style={styles.th}>
            Email
          </th>

          <th style={styles.th}>
            Status
          </th>

          <th style={styles.th}>
            Actions
          </th>

        </tr>

      </thead>

      <tbody>

        {users.map((user) => (

          <tr
            key={user.id}
          >

            <td style={styles.td}>

              {getDisplayName(user)}

            </td>

            <td style={styles.td}>

              {user.email}

            </td>

            <td style={styles.td}>

<StatusBadge
    status={
        user.approved
            ? "approved"
            : "pending"
    }
/>

            </td>

            <td style={styles.td}>

              <UserActions

                user={user}

                onView={onView}

                onApprove={onApprove}

                onSuspend={onSuspend}

              />

            </td>

          </tr>

        ))}

      </tbody>

    </table>

  );

}

const styles = {

  table:{
    width:"100%",
    borderCollapse:"collapse",
    background:"#fff",
    borderRadius:"10px",
    overflow:"hidden",
    boxShadow:
      "0 2px 8px rgba(0,0,0,.08)",
  },

  th:{
    background:"#2563eb",
    color:"#fff",
    padding:"14px",
    textAlign:"left",
  },

  td:{
    padding:"14px",
    borderBottom:"1px solid #eee",
  },

  empty:{
    padding:"40px",
    textAlign:"center",
    background:"#fff",
    borderRadius:"10px",
    color:"#666",
    boxShadow:
      "0 2px 8px rgba(0,0,0,.08)",
  },

};
