# @my-io-game/testing

## Huh?

This helps to trace your code with a instance of [phoenix from arize](https://docs.arize.com/phoenix/tracing/how-to-tracing/manual-instrumentation/javascript).

## How To AutoInstrument OpenAi And Langchain

Make sure to have an isntance of Phoenix running.

```bash
docker run -d --name rag-testing-svc -p 6006:6006 -p 4317:4317 -p 9090:9090 -e PHOENIX_WORKING_DIR=/mnt/data -v $(pwd)/phoenix_data:/mnt/data arizephoenix/phoenix:latest
```

Create this file in your project root

```typescript
// instrumentation.ts
import { autoInstrument } from "@my-io-game/testing";
autoInstrument();
```

Then run your file with with a register flag (works for node,ts-node, etc. too)

```bash
bun -r ./instrumentation.ts your <yourfile.ts>
```

# How to trace other things?

In addition to the things above, you can also use the `log` function to trace things.

```typescript
// somewhere-in-your-codebase.ts
import { log } from "@my-io-game/testing/span";

// you can use async functions
async function add(a:number,b:number) {
  return Promise(a + b);
}

or you can use sync functions
function sub(a:number,b:number) {
  return a-b;
}

// but the functions mustn't be anonymous but have a name
await log(add, [1,1]);
await log(sub, [43,1]);

// after running this code you should have some spans popping up in phoenix
```
