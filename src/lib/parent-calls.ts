import { createHmac, timingSafeEqual } from "node:crypto";

export function twilioIsConfigured() {
  return Boolean(
    process.env.TWILIO_ACCOUNT_SID
      && process.env.TWILIO_AUTH_TOKEN
      && process.env.TWILIO_PHONE_NUMBER,
  );
}

export function escapeTwiml(value: string) {
  return value.replace(/[<>&'\"]/g, (character) => ({
    "<": "&lt;",
    ">": "&gt;",
    "&": "&amp;",
    "'": "&apos;",
    '\"': "&quot;",
  })[character] ?? character);
}

function publicRequestUrl(request: Request) {
  const requestUrl = new URL(request.url);
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL;
  if (!siteUrl) return requestUrl.toString();
  const publicUrl = new URL(siteUrl);
  publicUrl.pathname = requestUrl.pathname;
  publicUrl.search = requestUrl.search;
  return publicUrl.toString();
}

export function isValidTwilioWebhook(request: Request, formData: FormData) {
  const signature = request.headers.get("x-twilio-signature");
  const authToken = process.env.TWILIO_AUTH_TOKEN;
  if (!signature || !authToken) return false;

  const entries = Array.from(formData.entries())
    .filter((entry): entry is [string, string] => typeof entry[1] === "string")
    .sort(([leftName, leftValue], [rightName, rightValue]) => (
      leftName.localeCompare(rightName) || leftValue.localeCompare(rightValue)
    ));
  const signedValue = entries.reduce(
    (value, [name, entryValue]) => `${value}${name}${entryValue}`,
    publicRequestUrl(request),
  );
  const expected = createHmac("sha1", authToken).update(signedValue).digest("base64");
  const providedBuffer = Buffer.from(signature);
  const expectedBuffer = Buffer.from(expected);
  return providedBuffer.length === expectedBuffer.length
    && timingSafeEqual(providedBuffer, expectedBuffer);
}

export function buildSpeechActionUrl(message: string, turn = 1) {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL;
  if (!siteUrl) throw new Error("The public site URL is not configured");
  const actionUrl = new URL("/api/voice/respond", siteUrl);
  actionUrl.searchParams.set("context", Buffer.from(message.slice(0, 700), "utf8").toString("base64url"));
  actionUrl.searchParams.set("turn", String(turn));
  return actionUrl.toString();
}

export function decodeCallContext(value: string | null) {
  if (!value || !/^[A-Za-z0-9_-]{1,1200}$/.test(value)) {
    return "A learner has an overdue Nexvia roadmap task.";
  }
  try {
    return Buffer.from(value, "base64url")
      .toString("utf8")
      .replace(/[\u0000-\u001f\u007f]/g, " ")
      .trim()
      .slice(0, 700) || "A learner has an overdue Nexvia roadmap task.";
  } catch {
    return "A learner has an overdue Nexvia roadmap task.";
  }
}

export function buildSpeechGather(message: string, actionUrl: string) {
  return `<Gather input="speech" action="${escapeTwiml(actionUrl)}" method="POST" language="en-IN" speechTimeout="auto" actionOnEmptyResult="true"><Say language="en-IN">${escapeTwiml(message)}</Say></Gather>`;
}

export async function placeTwilioCall(phone: string, message: string) {
  const accountSid = process.env.TWILIO_ACCOUNT_SID;
  const authToken = process.env.TWILIO_AUTH_TOKEN;
  const from = process.env.TWILIO_PHONE_NUMBER;
  if (!accountSid || !authToken || !from) throw new Error("Twilio is not configured");

  const greeting = "Hello. This is Nexvia's AI parent support assistant. I am calling with a supportive learning update. You can ask me questions, and I will do my best to help.";
  const callContext = message.slice(0, 700);
  const actionUrl = buildSpeechActionUrl(callContext);
  const openingPrompt = `${greeting} ${callContext} What would you like to know? Please speak after the tone.`;

  const body = new URLSearchParams({
    To: phone,
    From: from,
    Twiml: `<Response>${buildSpeechGather(openingPrompt, actionUrl)}<Say language="en-IN">I did not hear a response. Please review the overdue task in the Nexvia Parent Portal. Goodbye.</Say></Response>`,
  });
  const response = await fetch(
    `https://api.twilio.com/2010-04-01/Accounts/${accountSid}/Calls.json`,
    {
      method: "POST",
      headers: {
        Authorization: `Basic ${Buffer.from(`${accountSid}:${authToken}`).toString("base64")}`,
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body,
      cache: "no-store",
    },
  );
  const result = await response.json() as { sid?: string; message?: string };
  if (!response.ok || !result.sid) {
    throw new Error(result.message ?? "Calling provider rejected the request");
  }
  return result.sid;
}
