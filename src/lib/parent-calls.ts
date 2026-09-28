export function twilioIsConfigured() {
  return Boolean(
    process.env.TWILIO_ACCOUNT_SID
      && process.env.TWILIO_AUTH_TOKEN
      && process.env.TWILIO_PHONE_NUMBER,
  );
}

function escapeXml(value: string) {
  return value.replace(/[<>&'\"]/g, (character) => ({
    "<": "&lt;",
    ">": "&gt;",
    "&": "&amp;",
    "'": "&apos;",
    '\"': "&quot;",
  })[character] ?? character);
}

export async function placeTwilioCall(phone: string, message: string) {
  const accountSid = process.env.TWILIO_ACCOUNT_SID;
  const authToken = process.env.TWILIO_AUTH_TOKEN;
  const from = process.env.TWILIO_PHONE_NUMBER;
  if (!accountSid || !authToken || !from) throw new Error("Twilio is not configured");

  const body = new URLSearchParams({
    To: phone,
    From: from,
    Twiml: `<Response><Say language="en-IN">${escapeXml(message)}</Say></Response>`,
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
