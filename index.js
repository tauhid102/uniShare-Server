const express = require("express");
const cors = require("cors");
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
require("dotenv").config();

const port = process.env.PORT || 5000;
const app = express();

//middleware
app.use(cors());
app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.y8rcquf.mongodb.net/?retryWrites=true&w=majority`;
console.log(uri);
const client = new MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  serverApi: ServerApiVersion.v1,
});

async function run() {
  try {
    const database = client.db("uniShare");
    const questionCollection = database.collection("question");
    const userCollection = database.collection("users");
    const requestCollection = database.collection("request");
    const reviewCollection = database.collection("review");

    //find all question
    app.get("/questions", async (req, res) => {
      const query = {};
      const question = (await questionCollection.find(query).toArray()).reverse();
      const count= await questionCollection.estimatedDocumentCount();
      res.send(question);
    });
    //find all request
    app.get("/forum", async (req, res) => {
      const query = {};
      const options = (await requestCollection.find(query).toArray()).reverse();
      res.send(options);
    });
    //find all review
    app.get("/review", async (req, res) => {
      const query = {};
      const options = (await reviewCollection.find(query).toArray()).reverse();
      res.send(options);
    });
    // add question in the database
    app.post("/questions", async (req, res) => {
      const question = req.body;
      const options = await questionCollection.insertOne(question);
      res.send(options);
    });
    // add request in the database
    app.post("/request", async (req, res) => {
      const question = req.body;
      const options = await requestCollection.insertOne(question);
      res.send(options);
    });
    // fetch request in the database
    app.get("/request", async (req, res) => {
      const query = {};
      const options = (await requestCollection.find(query).toArray()).reverse();
      res.send(options);
    });
    // get particular user question
    app.get("/history", async (req, res) => {
      const email = req.query.email;
      const query = { email: email };
      const history = await questionCollection.find(query).toArray();
      res.send(history);
    });
    //get particular user point
    app.get("/point/user", async (req, res) => {
      const email = req.query.email;
      const query = { email: email };
      const history = await userCollection.find(query).toArray();
      res.send(history);
    });
    // save user in the database
    app.post("/users", async (req, res) => {
      const user = req.body;
      const result = await userCollection.insertOne(user);
      res.send(result);
    });
    // save review in the database
    app.post("/review", async (req, res) => {
      const user = req.body;
      const result = await reviewCollection.insertOne(user);
      res.send(result);
    });
    //find all users
    app.get("/users", async (req, res) => {
      const query = {};
      const users = (await userCollection.find(query).toArray()).reverse();
      res.send(users);
    });
    //find all review
    app.get("/review", async (req, res) => {
      const query = {};
      const users = (await reviewCollection.find(query).toArray()).reverse();
      res.send(users);
    });
    // fetch by id
    app.get('/question/:id', async (req, res) => {
      const id = req.params.id;
      const objectId = new ObjectId(id);
      const query = { _id: objectId}
      const result = await questionCollection.findOne(query);
      res.send(result);
  });
    //set role admin
    app.put("/users/admin/:id", async (req, res) => {
      const id = req.params.id;
      const objectId = new ObjectId(id);
      const filter = { _id: objectId };
      const options = { upsert: true };
      const updatesDoc = {
        $set: {
          role: "admin",
        },
      };
      const result = await userCollection.updateOne(
        filter,
        updatesDoc,
        options
      );
      res.send(result);
    });
    //find admin role
    app.get("/users/admin/:email", async (req, res) => {
      const email = req.params.email;
      const query = { email };
      const user = await userCollection.findOne(query);
      res.send({ isAdmin: user?.role === "admin" });
    });
    //update point after approved
    app.put("/point/update/:email", async (req, res) => {
      const email = req.params.email;
      const query = { email };
      const options = { upsert: true };
      const user = await userCollection.findOne(query);
      const updateDoc={
        $set: {
          point: user.point+5,
        },
      };
      const update= await userCollection.updateOne(query,updateDoc,options);
      res.send(update);
    });
    //update point after approved
    app.put("/point/remove/:email", async (req, res) => {
      const email = req.params.email;
      const query = { email };
      const options = { upsert: true };
      const user = await userCollection.findOne(query);
      const updateDoc={
        $set: {
          point: user.point-5,
        },
      };
      const update= await userCollection.updateOne(query,updateDoc,options);
      res.send(update);
    });
    //delete users post
    app.delete("/questions/:id", async (req, res) => {
      const id = req.params.id;
      const objectId = new ObjectId(id);
      const query = { _id: objectId };
      const result = await questionCollection.deleteOne(query);
      res.send(result);
    });
    //delete users request
    app.delete("/request/:id", async (req, res) => {
      const id = req.params.id;
      const objectId = new ObjectId(id);
      const query = { _id: objectId };
      const result = await requestCollection.deleteOne(query);
      res.send(result);
    });
    //delete users review
    app.delete("/review/:id", async (req, res) => {
      const id = req.params.id;
      const objectId = new ObjectId(id);
      const query = { _id: objectId };
      const result = await reviewCollection.deleteOne(query);
      res.send(result);
    });
    //delete users
    app.delete("/allUser/:id", async (req, res) => {
      const id = req.params.id;
      const objectId = new ObjectId(id);
      const query = { _id: objectId };
      const result = await userCollection.deleteOne(query);
      res.send(result);
    });
    //confirmed question
    app.put("/questions/:id", async (req, res) => {
      const id = req.params.id;
      const objectId = new ObjectId(id);
      const query = { _id: objectId };
      const options = { upsert: true };
      const updateDoc = {
        $set: {
          status: "Approved",
        },
      };
      const result = await questionCollection.updateOne(
        query,
        updateDoc,
        options
      );
      res.send(result);
    });
    //confirmed request
    app.put("/request/:id", async (req, res) => {
      const id = req.params.id;
      const objectId = new ObjectId(id);
      const query = { _id: objectId };
      const options = { upsert: true };
      const updateDoc = {
        $set: {
          status: "Approved",
        },
      };
      const result = await requestCollection.updateOne(
        query,
        updateDoc,
        options
      );
      res.send(result);
    });
    //confirmed review
    app.put("/review/:id", async (req, res) => {
      const id = req.params.id;
      const objectId = new ObjectId(id);
      const query = { _id: objectId };
      const options = { upsert: true };
      const updateDoc = {
        $set: {
          status: "Approved",
        },
      };
      const result = await reviewCollection.updateOne(
        query,
        updateDoc,
        options
      );
      res.send(result);
    });
  } finally {
  }
}
run().catch(console.dir);

app.get("/", async (req, res) => {
  res.send("Server Run");
});
app.listen(port, () => {
  console.log(`Portal Run ${port}`);
});
