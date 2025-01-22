/* eslint-disable no-console */
import { registerInstrumentations } from "@opentelemetry/instrumentation";
import { OpenAIInstrumentation } from "@arizeai/openinference-instrumentation-openai";
import {
  ConsoleSpanExporter,
  SimpleSpanProcessor,
} from "@opentelemetry/sdk-trace-base";
import { NodeTracerProvider } from "@opentelemetry/sdk-trace-node";
import { Resource } from "@opentelemetry/resources";
import { OTLPTraceExporter } from "@opentelemetry/exporter-trace-otlp-proto";
import { SemanticResourceAttributes } from "@opentelemetry/semantic-conventions";
import { diag, DiagConsoleLogger, DiagLogLevel } from "@opentelemetry/api";

import { LangChainInstrumentation } from "@arizeai/openinference-instrumentation-langchain";
import * as CallbackManagerModule from "@langchain/core/callbacks/manager";

const PHONENIX_ARIZE_BASE_URL =
  process.env.PHONENIX_ARIZE_BASE_URL ?? "http://localhost:6006";

export function autoInstrument() {
  // For troubleshooting, set the log level to DiagLogLevel.DEBUG
  diag.setLogger(new DiagConsoleLogger(), DiagLogLevel.DEBUG);

  const provider = new NodeTracerProvider({
    resource: new Resource({
      [SemanticResourceAttributes.SERVICE_NAME]: "openai-service",
    }),
  });

  provider.addSpanProcessor(new SimpleSpanProcessor(new ConsoleSpanExporter()));
  provider.addSpanProcessor(
    new SimpleSpanProcessor(
      new OTLPTraceExporter({
        url: `${PHONENIX_ARIZE_BASE_URL}/v1/traces`,
      })
    )
  );
  provider.register();

  const lcInstrumentation = new LangChainInstrumentation({});
  // LangChain must be manually instrumented as it doesn't have a traditional module structure
  lcInstrumentation.manuallyInstrument(CallbackManagerModule);

  registerInstrumentations({
    instrumentations: [new OpenAIInstrumentation({}), lcInstrumentation],
  });

  console.log("👀 OpenInference initialized");
}
