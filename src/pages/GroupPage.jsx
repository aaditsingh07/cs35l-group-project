function GroupPage() {
  // Just for example
  const groupMembers = ["Alice", "Bob", "Charlie"];
  
  return (
    <div>
      <h1>Your Group</h1>
      <p>This page shows your assigned project group and group members.</p>
      
      <h2>Group Memebers</h2>
      
      <ul>
        {groupMembers.map((member, index) => (
          <li key={index}>{member}</li>
        ))}
      </ul>
    </div>
  );
}

export default GroupPage;
