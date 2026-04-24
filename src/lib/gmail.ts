import { google } from "googleapis"

export interface EmailData {
  id: string
  from: string
  date: string
  subject: string
  body: string
}

function decodeBase64(data: string): string {
  return Buffer.from(data.replace(/-/g, "+").replace(/_/g, "/"), "base64").toString("utf-8")
}

function extractBody(payload: any): string {
  // Multipart: find text/plain part
  if (payload.parts) {
    for (const part of payload.parts) {
      if (part.mimeType === "text/plain" && part.body?.data) {
        return decodeBase64(part.body.data)
      }
      // Recurse into nested parts
      if (part.parts) {
        const nested = extractBody(part)
        if (nested) return nested
      }
    }
    // Fallback to text/html if no plain text
    for (const part of payload.parts) {
      if (part.mimeType === "text/html" && part.body?.data) {
        const html = decodeBase64(part.body.data)
        return html.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim()
      }
    }
  }
  // Single part
  if (payload.body?.data) {
    return decodeBase64(payload.body.data)
  }
  return "(No text body)"
}

function getHeader(headers: any[], name: string): string {
  return headers.find((h: any) => h.name.toLowerCase() === name.toLowerCase())?.value ?? ""
}

export async function fetchGmailEmails(
  accessToken: string,
  options: {
    type: "recent" | "keyword" | "sender"
    value?: string
    count: number
  }
): Promise<EmailData[]> {
  const auth = new google.auth.OAuth2()
  auth.setCredentials({ access_token: accessToken })

  const gmail = google.gmail({ version: "v1", auth })

  // Build Gmail query
  let query = "in:inbox"
  if (options.type === "keyword" && options.value) {
    query += ` ${options.value}`
  } else if (options.type === "sender" && options.value) {
    query += ` from:${options.value}`
  }

  // List matching message IDs
  const listRes = await gmail.users.messages.list({
    userId: "me",
    q: query,
    maxResults: options.count,
  })

  const messages = listRes.data.messages ?? []
  if (messages.length === 0) return []

  // Fetch full message for each ID
  const emails: EmailData[] = await Promise.all(
    messages.map(async (msg) => {
      const full = await gmail.users.messages.get({
        userId: "me",
        id: msg.id!,
        format: "full",
      })

      const headers = full.data.payload?.headers ?? []
      const body = extractBody(full.data.payload ?? {})

      return {
        id: msg.id!,
        from: getHeader(headers, "From"),
        date: getHeader(headers, "Date"),
        subject: getHeader(headers, "Subject") || "(No Subject)",
        body: body.slice(0, 2000),
      }
    })
  )

  return emails
}
