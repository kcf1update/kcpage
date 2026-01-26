// netlify/functions/comments.js
export async function handler() {
  return {
    statusCode: 200,
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ ok: true, message: "Comments function alive" }),
  };
}
