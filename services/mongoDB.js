const { MongoClient, ObjectId } = require('mongodb');

const uri = "mongodb+srv://newuser:ywHzLMIA2jptHKhu@jokedb.bbw5k.mongodb.net/DataExpress?retryWrites=true&w=majority&appName=JokeDB";
const client = new MongoClient(uri, { 
  useNewUrlParser: true, 
  useUnifiedTopology: true 
});
let db;

async function connect() {
  if (!db) {
    await client.connect();
    db = client.db("DataExpress");
  }
}

async function createUser(username, password, phoneNumber, profession, bio, intrestes, profilePic, isAdmin = false) {
  await connect();
  const collection = db.collection("User");

  const userData = { 
    username, 
    password, 
    phoneNumber, 
    profession, 
    bio, 
    intrestes, 
    profilePic,
    isAdmin, 
    createdAt: new Date()
  };

  const result = await collection.insertOne(userData);
  const doc = await collection.findOne({ _id: result.insertedId });
  if (doc) {
    delete doc.password;
  }
  return doc;
}

async function getUserById(userId) {
  await connect();
  const collection = db.collection("User");
  const doc = await collection.findOne({ _id: new ObjectId(userId) });
  if (!doc) return null;
  delete doc.password;
  doc.fetchedAt = new Date();
  return doc;
}

async function getUserByUsername(username) {
  await connect();
  const collection = db.collection("User");
  const doc = await collection.findOne({ username });
  if (!doc) return null;
  return doc;
}

async function updateUser(userId, updateData) {
  await connect();
  const collection = db.collection("User");


  if (updateData.password) {
    updateData.password = updateData.password;
  }

  const result = await collection.findOneAndUpdate(
    { _id: new ObjectId(userId) },
    { $set: updateData },
    { returnDocument: 'after' }
  );
  if (result.value) {
    delete result.value.password;
  }
  return result.value;
}

async function deleteUser(userId) {
  await connect();
  const collection = db.collection("User");
  return await collection.deleteOne({ _id: new ObjectId(userId) });
}

async function getAllUsers() {
  await connect();
  const collection = db.collection("User");
  const users = await collection.find({}).toArray();
  return users.map(user => {
    delete user.password;
    return user;
  });
}

module.exports = {
  createUser,
  getUserById,
  getUserByUsername,
  updateUser,
  getAllUsers,
  deleteUser,
  ObjectId
};