import type { NextRequest, NextResponse } from "next/server";
import cors from "../../lib/cors";

export const middleware = async (req: NextRequest, res: NextResponse) => {
  // `cors` also takes care of handling OPTIONS requests
  await cors(req, res);
};
