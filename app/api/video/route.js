import { NextResponse } from "next/server";
export const runtime = "edge";

export async function GET(request) {
  // Use native request.url parsing for raw compatibility
  const { searchParams } = new URL(request.url);
  const streamToken = searchParams.get("streamToken");
  const download = searchParams.get("download") || "";

  // Note: HTML5 Video needs a valid start range even if none is initially provided
  const browserRange = request.headers.get("range") || "bytes=0-";

  if (!streamToken) {
    return new NextResponse(JSON.stringify({ error: "Missing streamToken" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  try {
    // 1. Cleanly construct the URL to your Node.js backend API
    const baseUrl = process.env.NEXT_PUBLIC_BACKEND_PUBLIC_API_URL.replace(
      /\/$/,
      "",
    );
    const backendUrl = new URL(`${baseUrl}/api/download/stream/${streamToken}`);

    if (download) {
      backendUrl.searchParams.set("download", download);
    }

    // 2. Fetch chunk stream from external Node instance
    const nodeResponse = await fetch(backendUrl.toString(), {
      headers: {
        Range: browserRange,
      },
      cache: "no-store",
    });

    // A 206 response signifies successful chunk validation, don't trap it as an error
    if (!nodeResponse.ok && nodeResponse.status !== 206) {
      console.error(`Backend returned failure code: ${nodeResponse.status}`);
      return new NextResponse(nodeResponse.body, {
        status: nodeResponse.status,
        statusText: nodeResponse.statusText,
      });
    }

    // 3. Re-map exact structural headers back down to the browser
    const headers = new Headers();
    headers.set(
      "Content-Range",
      nodeResponse.headers.get("content-range") || "",
    );
    headers.set("Accept-Ranges", "bytes");
    headers.set(
      "Content-Length",
      nodeResponse.headers.get("content-length") || "",
    );
    headers.set(
      "Content-Type",
      nodeResponse.headers.get("content-type") || "video/mp4",
    );

    // Force download handling behavior if requested by query parameter
    if (download === "1") {
      headers.set("Content-Disposition", 'attachment; filename="video.mp4"');
    } else {
      headers.set("Content-Disposition", "inline");
    }

    // 4. Return chunked body back to player
    return new NextResponse(nodeResponse.body, {
      status: nodeResponse.status,
      statusText: nodeResponse.statusText,
      headers,
    });
  } catch (error) {
    console.error("Critical Stream Proxy Exception:", error);
    return new NextResponse(
      JSON.stringify({ error: "Internal Gateway Error" }),
      {
        status: 502,
        headers: { "Content-Type": "application/json" },
      },
    );
  }
}
