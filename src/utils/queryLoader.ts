import fs from "fs";
import path from "path";

function loadQuery(name: string) {
  return fs.readFileSync(path.join(__dirname, "../queries", name), "utf8");
}

export const queries = {
  // Sysadmin queries
  findUser: loadQuery("../queries/sysadmin/agentExists.sql"),

  // Authentication queries
  login: loadQuery("../queries/authentication/login.sql"),
};
