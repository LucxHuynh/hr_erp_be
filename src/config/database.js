const mongoose = require("mongoose");
const { Sequelize } = require("sequelize");
require("dotenv").config();

const connectMongoDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log("MongoDB connected");
  } catch (error) {
    console.error("MongoDB connection failed");
  }
};

const sequelize = new Sequelize(
  process.env.PG_DATABASE,
  process.env.PG_USER,
  process.env.PG_PASSWORD,
  {
    host: process.env.PG_HOST,
    dialect: "postgres",
    port: process.env.PG_PORT,
    logging: false,
  }
);

const connetPostgres = async () => {
  try {
    await sequelize.authenticate();
    console.log("Postgres connected");
  } catch (error) {
    console.error("Postgres connection failed");
  }
};

module.exports = { connectMongoDB, connetPostgres, sequelize };
