const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
const express = require("express");
const app = express();
const port = 3000;
require("dotenv").config();

const corsConfig = {
  origin: "*",
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
};

const cors = require("cors");
app.use(cors(corsConfig));
app.use(express.json());


const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.dgljxbc.mongodb.net/?retryWrites=true&w=majority`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

async function run() {
  try {
    const database = client.db("npinternational");
    const productCollecction = database.collection("products");
    const categoryCollection = database.collection("category");

    //get all propducts

    app.get("/products", async (req, res) => {
      const result = await productCollecction.find({}).toArray();
      res.send(result);
    });

    app.get("/allcategories", async (req, res) => {
      const result = await categoryCollection.find({}).toArray();
      res.send(result);
    });

    app.get("/allcategories/:categorySlug", async (req, res) => {
      const categorySlug = req.params.categorySlug;
      const query = { categorySlug: categorySlug };

      const result = await categoryCollection.findOne(query);
      res.send(result);
    });

    app.get("/allproducts/:categoryName/:subCategoryName", async (req, res) => {
      const categoryName = req.params.categoryName;
      const subCategoryName = req.params.subCategoryName;
      const query = {
        categoryName: categoryName,
        subCategoryName: subCategoryName,
      };

      const result = await productCollecction.find(query).toArray();

      res.send(result);
    });
    //get single propducts

    app.get("/products/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };

      const result = await productCollecction.find(query).toArray();

      res.send(result);
    });

    app.get("/categoryProducts/:categoryName", async (req, res) => {
      const categoryName = req.params.categoryName;
      const query = { categoryName: categoryName };

      const result = await productCollecction.find(query).toArray();

      res.send(result);
    });

    app.post("/products", async (req, res) => {
      const data = req.body;

      const result = await productCollecction.insertOne(data);
      res.send(result);
    });

    //addcategory

    app.post("/addCategory", async (req, res) => {
      const data = req.body;
      const result = await categoryCollection.insertOne(data);
      res.send(result);
    });

    app.put("/addCategory/:id", async (req, res) => {
      const categoryId = req.params.id;
      const newCategory = req.body; // Assuming the request body contains a single category object

      try {
        // Assuming you have a MongoDB connection named "db"

        const result = await categoryCollection.updateOne(
          { _id: new ObjectId(categoryId) },
          { $push: { subCategories: newCategory } }
        );

        res.send(result);
      } catch (error) {
        console.error(error);
        res.status(500).send("Internal Server Error");
      }
    });
    //delete main category
    app.delete("/deleteCategory/:categoryId/", async (req, res) => {
      const categoryId = req.params.categoryId;
      const query = { _id: new ObjectId(categoryId) };
      const result = await categoryCollection.deleteOne(query);
      res.send(result);
    });

    //delete subcategory
    app.delete(
      "/deleteCategory/:categoryId/:subcategorySlug",
      async (req, res) => {
        const categoryId = req.params.categoryId;
        const subcategorySlug = req.params.subcategorySlug; // The ID of the item you want to remove from the categories array

        try {
          const result = await categoryCollection.updateOne(
            { _id: new ObjectId(categoryId) },
            { $pull: { subCategories: { subcategorySlug: subcategorySlug } } }
          );

          res.send(result);
        } catch (error) {
          console.error(error);
          res.status(500).send("Internal Server Error");
        }
      }
    );



    // Connect the client to the server	(optional starting in v4.7)
    await client.connect();
    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log(
      "Pinged your deployment. You successfully connected to MongoDB!"
    );
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();s
  }
}
run().catch(console.dir);

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});


