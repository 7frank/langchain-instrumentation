import express, { type Express } from "express";
import { ChatOpenAI } from "@langchain/openai";
import { log } from "./span";

const PORT: number = parseInt(process.env.PORT || "8081");
const app: Express = express();

const model = new ChatOpenAI({
  configuration: {
    basePath: "http://localhost:11434/v1",
    defaultHeaders: {
      "X-API-Key": "DUMMY_API_KEY",
    },
  },
  apiKey: "DUMMY_API_KEY",
  modelName: "llama3.2:latest",
  temperature: 0,
});

app.get("/chat", async (req, res) => {
  const message = req.query.message;

  model
    .invoke("" + message)
    .then((chatCompletion) => res.send(chatCompletion.content))
    .catch((err) => res.send(err.message));
});

app.get("/some", async (req, res) => {
  const message = req.query.message;

  async function Test(test: string) {
    return test + test;
  }

  function Test2(test: string) {
    return test + "2" + test + "2";
  }

  const r = await log(Test, ["" + message]);
  const s = await log(Test2, ["" + message]);

  res.send(r + s);
});

app.listen(PORT, () => {
  console.log(`Listening for requests on http://localhost:${PORT}`);
  console.log("try", `http://localhost:${PORT}/chat?message=Hey%20bot`);
});
