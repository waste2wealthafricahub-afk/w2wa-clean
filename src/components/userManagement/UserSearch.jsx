export default function UserSearch({

  search,

  setSearch,

}) {

  return (

    <div
      style={styles.container}
    >

      <input

        type="text"

        placeholder="🔍 Search by name, email or school..."

        value={search}

        onChange={(e)=>

          setSearch(
            e.target.value
          )

        }

        style={styles.input}

      />

      {search !== "" && (

        <button

          style={styles.clear}

          onClick={()=>
            setSearch("")
          }

        >

          ✖ Clear

        </button>

      )}

    </div>

  );

}

const styles = {

  container:{
    display:"flex",
    gap:"10px",
    marginBottom:"20px",
    flexWrap:"wrap",
  },

  input:{
    flex:1,
    minWidth:"300px",
    padding:"12px",
    borderRadius:"8px",
    border:"1px solid #ccc",
    fontSize:"15px",
  },

  clear:{
    padding:"12px 18px",
    background:"#dc2626",
    color:"#fff",
    border:"none",
    borderRadius:"8px",
    cursor:"pointer",
    fontWeight:"bold",
  },

};
