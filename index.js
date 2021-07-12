const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");
const compression = require("compression");
const cacheControl = require("express-cache-controller");
const axios = require("axios");

const app = express();
app.use(express.json());
app.use(cors());
app.use(helmet());
app.use(morgan("dev"));
app.use(cacheControl({ maxAge: 60, sMaxAge: 60 }));
app.use(compression());

function dateConverter(date) {
  let allDate = date.split(" ");
  let thisDate = allDate[0].split("-");
  let thisTime = allDate[1].split(":");
  let newDate = [thisDate[2], thisDate[1], thisDate[0]].join("/");
  let hour = thisTime[0];
  hour = hour < 10 ? "0" + hour : hour;
  let min = thisTime[1];
  let newTime = hour + ":" + min;
  let time = newDate + " " + newTime;
  return time.toString();
}

app.get("/", async (req, res) => {
  res.redirect("/api");
});

app.get("/api", async (req, res) => {
  const url = `${req.protocol}://${req.hostname}${
    req.hostname == "localhost" ? `:${PORT}` : ""
  }`;
  res.json({
    title: "Malaysia Vaccination Data API by Vincent Haryadi (vincenth19)",
    myvaccination: "https://myvaccination.pages.dev",
    "Source Code": "https://github.com/vincenth19/myvaccine-backend",
    "My Profile": "https://vincenth19.com",
    "data source": "https://github.com/CITF-Malaysia/citf-public",
    endpoints: {
      vaccination: [
        `${url}/api/vacc/all`,
        `${url}/api/vacc/states`,
        `${url}/api/vacc/states/:state_name`,
        `pattern example ${url}/api/vacc/states/johor`,
      ],
      registration: [
        `${url}/api/vacc_reg/all`,
        `${url}/api/vacc_reg/states`,
        `${url}/api/vacc_reg/states/:state_name`,
        `pattern example ${url}/api/vacc_reg/states/johor`,
      ],
      population: [
        `${url}/api/population/all`,
        `${url}/api/population/states`,
        `${url}/api/population/states/:state_name`,
        `pattern example ${url}/api/population/states/johor`,
      ],
      rawCSVData: [
        `${url}/api/vacc/all/raw`,
        `${url}/api/vacc/states/raw`,
        `${url}/api/vacc_reg/all/raw`,
        `${url}/api/vacc_reg/states/raw`,
        `${url}/api/population/raw`,
      ],
    },
  });
});

app.get("/api/vacc/all/raw", async (req, res) => {
  const { data } = await axios.get(
    "https://raw.githubusercontent.com/CITF-Malaysia/citf-public/main/vaccination/vax_malaysia.csv"
  );

  res.status(200).send({
    data,
  });
});

app.get("/api/vacc/states/raw", async (req, res) => {
  const { data } = await axios.get(
    "https://raw.githubusercontent.com/CITF-Malaysia/citf-public/main/vaccination/vax_state.csv"
  );

  res.status(200).send({
    data,
  });
});

app.get("/api/vacc_reg/all/raw", async (req, res) => {
  const { data } = await axios.get(
    "https://raw.githubusercontent.com/CITF-Malaysia/citf-public/main/registration/vaxreg_malaysia.csv"
  );

  res.status(200).send({
    data,
  });
});

app.get("/api/vacc_reg/states/raw", async (req, res) => {
  const { data } = await axios.get(
    "https://raw.githubusercontent.com/CITF-Malaysia/citf-public/main/registration/vaxreg_state.csv"
  );

  res.status(200).send({
    data,
  });
});

app.get("/api/population/raw", async (req, res) => {
  const { data } = await axios.get(
    "https://raw.githubusercontent.com/CITF-Malaysia/citf-public/main/static/population.csv"
  );

  res.status(200).send({
    data,
  });
});

const PORT = process.env.PORT || 8081;
app.listen(PORT, () => console.log(`API Live at port: ${PORT}`));
