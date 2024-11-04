const { MongoClient } = require("mongodb");
const url = "mongodb+srv://divyakhanolkar:divyakhanolkar@cluster0.ghn2i.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0";
const databaseName = "happy";
const client = new MongoClient(url, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

async function getData() {
  let db;
  try {
    // Connect to the database
    await client.connect();
    db = client.db(databaseName);
    const collection = db.collection("task-manager");

    // Fetch and log existing data
    let data = await collection.find({}).toArray();
    console.log("Data before insertion:", data);

    // Insert a new document
    await collection.insertOne({
      name: "miko",
      age: 21,
    });

    console.log("Document inserted successfully");

    // Fetch and log data after insertion
    data = await collection.find({}).toArray();
    console.log("Data after insertion:", data);
  } catch (error) {
    console.error("Error:", error);
  } finally {
    // Close the connection in the finally block to ensure it's closed regardless of success or failure
    await client.close();
  }
}

getData();
