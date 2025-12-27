import dotenv from "dotenv";
dotenv.config();
export default {
  preset: "ts-jest",
  testEnvironment: "node",
  roots: ["./src/tests/unit"],
  transform: {
    "^.+\\.ts$": "ts-jest",
  },
  testRegex: "(/__tests__/.*|(\\.|/)(test|spec))\\.ts$",
  moduleFileExtensions: ["ts", "js", "json", "node"],
};
