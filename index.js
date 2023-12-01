const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");
const compression = require("compression");
const cacheControl = require("express-cache-controller");
const axios = require("axios");
const csv = require("csvtojson");

const app = express();
app.use(express.json());
app.use(cors());
app.use(helmet());
app.use(morgan("dev"));
app.use(cacheControl({ maxAge: 60, sMaxAge: 60 }));
app.use(compression());

require("dotenv").config();

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
        `${url}/api/vacc`,
        `${url}/api/vacc/update`,
        `${url}/api/vacc/states`,
        `${url}/api/vacc/update/states`,
        `${url}/api/vacc/update/states/:state-name`,
        `${url}/api/vacc/states/:state_name`,
        `pattern example ${url}/api/vacc/states/kuala-lumpur`,
      ],
      registration: [
        `${url}/api/vacc_reg`,
        `${url}/api/vacc_reg/update`,
        `${url}/api/vacc_reg/states`,
        `${url}/api/vacc_reg/update/states`,
        `${url}/api/vacc_reg/update/states/:state-name`,
        `${url}/api/vacc_reg/states/:state-name`,
        `pattern example ${url}/api/vacc_reg/states/kuala-lumpur`,
      ],
      pop: [
        `${url}/api/pop`,
        `${url}/api/pop/:state_name`,
        `pattern example ${url}/api/pop/states/kuala-lumpur`,
      ],
      rawCSVData: [
        `${url}/api/vacc/raw`,
        `${url}/api/vacc/states/raw`,
        `${url}/api/vacc_reg/raw`,
        `${url}/api/vacc_reg/states/raw`,
        `${url}/api/pop/raw`,
      ],
    },
  });
});

app.get("/api/vacc/raw", async (req, res) => {
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

app.get("/api/vacc_reg/raw", async (req, res) => {
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

app.get("/api/pop/raw", async (req, res) => {
  const { data } = await axios.get(
    "https://raw.githubusercontent.com/CITF-Malaysia/citf-public/main/static/population.csv"
  );

  res.status(200).send({
    data,
  });
});

app.get("/api/vacc", async (req, res) => {
  const { data } = await axios.get(
    "https://raw.githubusercontent.com/CITF-Malaysia/citf-public/main/vaccination/vax_malaysia.csv"
  );

  csv({
    noheader: false,
    output: "json",
  })
    .fromString(data)
    .then((csvRow) => {
      res.status(200).send(csvRow);
    });
});

app.get("/api/vacc/update", async (req, res) => {
  const { data } = await axios.get(
    "https://raw.githubusercontent.com/CITF-Malaysia/citf-public/main/vaccination/vax_malaysia.csv"
  );

  csv({
    noheader: false,
    output: "json",
  })
    .fromString(data)
    .then((csvRow) => {
      res.status(200).send(csvRow[csvRow.length - 1]);
    });
});

app.get("/api/vacc/states", async (req, res) => {
  const { data } = await axios.get(
    "https://raw.githubusercontent.com/CITF-Malaysia/citf-public/main/vaccination/vax_state.csv"
  );

  csv({
    noheader: false,
    output: "json",
  })
    .fromString(data)
    .then((csvRow) => {
      res.status(200).send(csvRow);
    });
});

app.get("/api/vacc/states/:statename", async (req, res) => {
  const { data } = await axios.get(
    "https://raw.githubusercontent.com/CITF-Malaysia/citf-public/main/vaccination/vax_state.csv"
  );

  let modifiedData = [];
  csv({
    noheader: false,
    output: "json",
  })
    .fromString(data)
    .then((csvRow) => {
      let param = "";
      if (req.params.statename === "kuala-lumpur") {
        param = "W.P. Kuala Lumpur";
      } else if (req.params.statename === "labuan") {
        param = "W.P. Labuan";
      } else if (req.params.statename === "putrajaya") {
        param = "W.P. Putrajaya";
      } else if (req.params.statename === "negeri-sembilan") {
        param = "Negeri Sembilan";
      } else if (req.params.statename === "pulau-pinang") {
        param = "Pulau Pinang";
      } else {
        param =
          req.params.statename.charAt(0).toUpperCase() +
          req.params.statename.slice(1);
      }

      csvRow.forEach((e) => {
        if (e.state === param) {
          modifiedData.push(e);
        }
      });

      res.status(200).send(modifiedData);
    });
});

app.get("/api/vacc/update/states/", async (req, res) => {
  const { data } = await axios.get(
    "https://raw.githubusercontent.com/CITF-Malaysia/citf-public/main/vaccination/vax_state.csv"
  );

  csv({
    noheader: false,
    output: "json",
  })
    .fromString(data)
    .then((csvRow) => {
      function getTodayData() {
        let data = [];

        for (let i = 1; i < 17; i++) {
          data.push(csvRow[csvRow.length - i]);
        }
        return data;
      }

      let modifiedData = getTodayData();

      res.status(200).send(modifiedData);
    });
});

app.get("/api/vacc/update/states/:statename", async (req, res) => {
  const { data } = await axios.get(
    "https://raw.githubusercontent.com/CITF-Malaysia/citf-public/main/vaccination/vax_state.csv"
  );

  csv({
    noheader: false,
    output: "json",
  })
    .fromString(data)
    .then((csvRow) => {
      let param = "";
      if (req.params.statename === "kuala-lumpur") {
        param = "W.P. Kuala Lumpur";
      } else if (req.params.statename === "labuan") {
        param = "W.P. Labuan";
      } else if (req.params.statename === "putrajaya") {
        param = "W.P. Putrajaya";
      } else if (req.params.statename === "negeri-sembilan") {
        param = "Negeri Sembilan";
      } else if (req.params.statename === "pulau-pinang") {
        param = "Pulau Pinang";
      } else {
        param =
          req.params.statename.charAt(0).toUpperCase() +
          req.params.statename.slice(1);
      }

      function getTodayData(stateName) {
        for (let i = 1; i < 17; i++) {
          if (csvRow[csvRow.length - i].state === stateName) {
            return csvRow[csvRow.length - i];
          }
        }
      }

      let modifiedData = getTodayData(param);

      res.status(200).send(modifiedData);
    });
});

app.get("/api/vacc_reg", async (req, res) => {
  const { data } = await axios.get(
    "https://raw.githubusercontent.com/CITF-Malaysia/citf-public/main/registration/vaxreg_malaysia.csv"
  );

  csv({
    noheader: false,
    output: "json",
  })
    .fromString(data)
    .then((csvRow) => {
      console.log(JSON.stringify(csvRow, null, 2));

      res.status(200).send(csvRow);
    });
});

app.get("/api/vacc_reg/update", async (req, res) => {
  const { data } = await axios.get(
    "https://raw.githubusercontent.com/CITF-Malaysia/citf-public/main/registration/vaxreg_malaysia.csv"
  );

  csv({
    noheader: false,
    output: "json",
  })
    .fromString(data)
    .then((csvRow) => {
      let modifiedData = {
        update: {
          total:
            parseInt(csvRow[csvRow.length - 1].total) -
            parseInt(csvRow[csvRow.length - 2].total),
          phase2:
            parseInt(csvRow[csvRow.length - 1].phase2) -
            parseInt(csvRow[csvRow.length - 2].phase2),
          mysj:
            parseInt(csvRow[csvRow.length - 1].mysj) -
            parseInt(csvRow[csvRow.length - 2].mysj),
          call:
            parseInt(csvRow[csvRow.length - 1].call) -
            parseInt(csvRow[csvRow.length - 2].call),
          web:
            parseInt(csvRow[csvRow.length - 1].web) -
            parseInt(csvRow[csvRow.length - 2].web),
          children:
            parseInt(csvRow[csvRow.length - 1].children) -
            parseInt(csvRow[csvRow.length - 2].children),
          elderly:
            parseInt(csvRow[csvRow.length - 1].elderly) -
            parseInt(csvRow[csvRow.length - 2].elderly),
          comorb:
            parseInt(csvRow[csvRow.length - 1].comorb) -
            parseInt(csvRow[csvRow.length - 2].comorb),
          oku:
            parseInt(csvRow[csvRow.length - 1].oku) -
            parseInt(csvRow[csvRow.length - 2].oku),
        },
        cummulative: {
          total: parseInt(csvRow[csvRow.length - 1].total),
          phase2: parseInt(csvRow[csvRow.length - 1].phase2),
          mysj: parseInt(csvRow[csvRow.length - 1].mysj),
          call: parseInt(csvRow[csvRow.length - 1].call),
          web: parseInt(csvRow[csvRow.length - 1].web),
          children: parseInt(csvRow[csvRow.length - 1].children),
          elderly: parseInt(csvRow[csvRow.length - 1].elderly),
          comorb: parseInt(csvRow[csvRow.length - 1].comorb),
          oku: parseInt(csvRow[csvRow.length - 1].oku),
        },
      };

      res.status(200).send(modifiedData);
    });
});

app.get("/api/vacc_reg/states", async (req, res) => {
  const { data } = await axios.get(
    "https://raw.githubusercontent.com/CITF-Malaysia/citf-public/main/registration/vaxreg_state.csv"
  );

  csv({
    noheader: false,
    output: "json",
  })
    .fromString(data)
    .then((csvRow) => {
      let temp = [];

      function onlyUnique(value, index, self) {
        return self.indexOf(value) === index;
      }

      csvRow.forEach((e) => {
        temp.push(e.date);
      });

      temp = temp.filter(onlyUnique);
      let cleanData = temp.map((data) => {
        return {
          date: data,
        };
      });

      function getDayData(date) {
        let data = [];
        csvRow.forEach((e) => {
          if (e.date === date) {
            data.push({
              stateName: e.state,
              totalAll: parseInt(e.total),
              totalPhase2: parseInt(e.phase2),
              platform_mysj: parseInt(e.mysj),
              platform_call: parseInt(e.call),
              platform_web: parseInt(e.web),
              demographic_children: parseInt(e.children),
              demographic_elderly: parseInt(e.elderly),
              demographic_comorb: parseInt(e.comorb),
              demographic_disabled: parseInt(e.oku),
            });
          }
        });
        return data;
      }

      let modifiedData = cleanData.map((data) => {
        return {
          date: data.date,
          stateData: getDayData(data.date),
        };
      });

      res.status(200).send(modifiedData);
    });
});

app.get("/api/vacc_reg/states/:statename", async (req, res) => {
  const { data } = await axios.get(
    "https://raw.githubusercontent.com/CITF-Malaysia/citf-public/main/registration/vaxreg_state.csv"
  );

  let modifiedData = [];
  csv({
    noheader: false,
    output: "json",
  })
    .fromString(data)
    .then((csvRow) => {
      let param = "";
      if (req.params.statename === "kuala-lumpur") {
        param = "W.P. Kuala Lumpur";
      } else if (req.params.statename === "labuan") {
        param = "W.P. Labuan";
      } else if (req.params.statename === "putrajaya") {
        param = "W.P. Putrajaya";
      } else if (req.params.statename === "negeri-sembilan") {
        param = "Negeri Sembilan";
      } else if (req.params.statename === "pulau-pinang") {
        param = "Pulau Pinang";
      } else {
        param =
          req.params.statename.charAt(0).toUpperCase() +
          req.params.statename.slice(1);
      }

      csvRow.forEach((e) => {
        if (e.state === param) {
          modifiedData.push({
            date: e.date,
            totalAll: parseInt(e.total),
            totalPhase2: parseInt(e.phase2),
            platform_mysj: parseInt(e.mysj),
            platform_call: parseInt(e.call),
            platform_web: parseInt(e.web),
            demographic_children: parseInt(e.children),
            demographic_elderly: parseInt(e.elderly),
            demographic_comorb: parseInt(e.comorb),
            demographic_disabled: parseInt(e.oku),
          });
        }
      });

      res.status(200).send(modifiedData);
    });
});

app.get("/api/vacc_reg/update/states", async (req, res) => {
  const { data } = await axios.get(
    "https://raw.githubusercontent.com/CITF-Malaysia/citf-public/main/registration/vaxreg_state.csv"
  );
  csv({
    noheader: false,
    output: "json",
  })
    .fromString(data)
    .then((csvRow) => {
      function getUpdateData() {
        let data = [];

        for (let i = 1; i < 17; i++) {
          data.push({
            stateName: csvRow[csvRow.length - i].state,
            totalAll: parseInt(csvRow[csvRow.length - i].total),
            totalPhase2: parseInt(csvRow[csvRow.length - i].phase2),
            platform_mysj: parseInt(csvRow[csvRow.length - i].mysj),
            platform_call: parseInt(csvRow[csvRow.length - i].call),
            platform_web: parseInt(csvRow[csvRow.length - i].web),
            demographic_children: parseInt(csvRow[csvRow.length - i].children),
            demographic_elderly: parseInt(csvRow[csvRow.length - i].elderly),
            demographic_comorb: parseInt(csvRow[csvRow.length - i].comorb),
            demographic_disabled: parseInt(csvRow[csvRow.length - i].oku),
          });
        }
        return data;
      }

      let modifiedData = {
        date: csvRow[csvRow.length - 1].date,
        stateData: getUpdateData(),
      };

      res.status(200).send(modifiedData);
    });
});

app.get("/api/vacc_reg/update/states/:statename", async (req, res) => {
  const { data } = await axios.get(
    "https://raw.githubusercontent.com/CITF-Malaysia/citf-public/main/registration/vaxreg_state.csv"
  );

  csv({
    noheader: false,
    output: "json",
  })
    .fromString(data)
    .then((csvRow) => {
      let param = "";
      if (req.params.statename === "kuala-lumpur") {
        param = "W.P. Kuala Lumpur";
      } else if (req.params.statename === "labuan") {
        param = "W.P. Labuan";
      } else if (req.params.statename === "putrajaya") {
        param = "W.P. Putrajaya";
      } else if (req.params.statename === "negeri-sembilan") {
        param = "Negeri Sembilan";
      } else if (req.params.statename === "pulau-pinang") {
        param = "Pulau Pinang";
      } else {
        param =
          req.params.statename.charAt(0).toUpperCase() +
          req.params.statename.slice(1);
      }

      function getTodayData(stateName) {
        let data = [];
        for (let i = 1; i < 17; i++) {
          if (csvRow[csvRow.length - i].state === stateName) {
            data.push({
              date: csvRow[csvRow.length - 1].date,
              totalAll: parseInt(csvRow[csvRow.length - i].total),
              totalPhase2: parseInt(csvRow[csvRow.length - i].phase2),
              platform_mysj: parseInt(csvRow[csvRow.length - i].mysj),
              platform_call: parseInt(csvRow[csvRow.length - i].call),
              platform_web: parseInt(csvRow[csvRow.length - i].web),
              demographic_children: parseInt(
                csvRow[csvRow.length - i].children
              ),
              demographic_elderly: parseInt(csvRow[csvRow.length - i].elderly),
              demographic_comorb: parseInt(csvRow[csvRow.length - i].comorb),
              demographic_disabled: parseInt(csvRow[csvRow.length - i].oku),
            });
          }
        }
        return data;
      }

      let modifiedData = getTodayData(param);

      res.status(200).send(modifiedData);
    });
});

app.get("/api/pop", async (req, res) => {
  const { data } = await axios.get(
    "https://raw.githubusercontent.com/CITF-Malaysia/citf-public/main/static/population.csv"
  );

  csv({
    noheader: false,
    output: "json",
  })
    .fromString(data)
    .then((csvRow) => {
      let modifiedData = csvRow.map((data) => {
        return {
          stateName: data.state,
          total: parseInt(data.pop),
          "18to59": parseInt(data.pop_18),
          "60andAbove": parseInt(data.pop_60),
        };
      });
      res.status(200).send(modifiedData);
    });
});

app.get("/api/pop/:statename", async (req, res) => {
  const { data } = await axios.get(
    "https://raw.githubusercontent.com/CITF-Malaysia/citf-public/main/static/population.csv"
  );

  csv({
    noheader: false,
    output: "json",
  })
    .fromString(data)
    .then((csvRow) => {
      let param = "";
      if (req.params.statename === "kuala-lumpur") {
        param = "W.P. Kuala Lumpur";
      } else if (req.params.statename === "labuan") {
        param = "W.P. Labuan";
      } else if (req.params.statename === "putrajaya") {
        param = "W.P. Putrajaya";
      } else if (req.params.statename === "negeri-sembilan") {
        param = "Negeri Sembilan";
      } else if (req.params.statename === "pulau-pinang") {
        param = "Pulau Pinang";
      } else {
        param =
          req.params.statename.charAt(0).toUpperCase() +
          req.params.statename.slice(1);
      }

      let modifiedData;

      csvRow.forEach((e) => {
        if (e.state === param) {
          modifiedData = {
            stateName: e.state,
            total: parseInt(e.pop),
            "18to59": parseInt(e.pop_18),
            "60andAbove": parseInt(e.pop_60),
          };
        }
      });

      res.status(200).send({
        modifiedData,
      });
    });
});

const PORT = process.env.PORT || 8081;
app.listen(PORT, () => console.log(`API Live at port: ${PORT}`));
