import express from "express";
import cors from "cors";
import "dotenv/config";
import { testDbConnection } from "./config/db";
import schoolRouter from "./router/school-router"; 

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));


app.use("/schools", schoolRouter);


app.get("/health", (req, res) => {
  res.send({ message: "Health OK!" });
});


const startServer = async () => {
  await testDbConnection();
  app.listen(8080, () => console.log("Server started on http://localhost:8080"));
};

startServer();
