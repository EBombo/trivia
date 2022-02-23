import type { NextRequest } from "next/server";
import cors from "../../lib/cors";

export const middleware = (req: NextRequest) => {
  // `cors` also takes care of handling OPTIONS requests
  return cors(
    req,
    new Response(JSON.stringify({ message: "Trivia backend reached" }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    })
  );
};
