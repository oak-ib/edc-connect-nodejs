const serialport = require("serialport");
const createTable = require("data-table");
const log = require("./logger");
const nconf = require("nconf");
nconf
  .argv()
  .env()
  .file({ file: "config.json" });

nconf.set("portName", "COM6");
console.log(nconf.get("portName"));

serialport.list((err, ports) => {
  console.log("ports", ports);
  if (err) {
    log.info(err.message);
    document.getElementById("error").textContent = err.message;
    return;
  } else {
    document.getElementById("error").textContent = "";
  }

  if (ports.length === 0) {
    log.info("No ports discovered");
    document.getElementById("error").textContent = "No ports discovered";
  }

  const headers = Object.keys(ports[0]);
  const table = createTable(headers);
  tableHTML = "";
  table.on("data", data => (tableHTML += data));
  table.on(
    "end",
    () => (document.getElementById("ports").innerHTML = tableHTML)
  );
  ports.forEach(port => table.write(port));
  table.end();
});
