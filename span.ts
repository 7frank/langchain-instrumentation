import type { Span } from "@opentelemetry/api";

import {
  SemanticConventions,
  OpenInferenceSpanKind,
} from "@arizeai/openinference-semantic-conventions";

import opentelemetry, { SpanStatusCode } from "@opentelemetry/api";

const getTracer = () =>
  opentelemetry.trace.getTracer(
    "instrumentation-scope-name",
    "instrumentation-scope-version"
  );

const tracer = getTracer();

export async function log<T extends (...args: any) => any>(
  fn: T,
  args: Parameters<T>
  // @ts-ignore
): ReturnType<T> {
  if (fn.name == "") throw new Error("Only named functions can be logged");

  // Create a span. A span must be closed.
  return tracer.startActiveSpan(fn.name, async (span: Span) => {
    span.setAttributes({
      [SemanticConventions.OPENINFERENCE_SPAN_KIND]: "Custom",
      [SemanticConventions.INPUT_VALUE]: args,
    });

    let output;

    try {
      output = await fn(...args);
      span.setAttributes({
        attributes: {
          [SemanticConventions.OUTPUT_VALUE]: output,
        },
      });
    } catch (error: unknown) {
      span.recordException(error as Error);
      span.setStatus({ code: SpanStatusCode.ERROR });
      throw error;
    }

    // Be sure to end the span!
    span.end();
    return output;
  });
}
