import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";

const LIBRARY_PATH = "/Users/yehya/.hermes/assets/library.json";
const ASSETS_DIR = "/Users/yehya/.hermes/assets";

interface Asset {
  id: string;
  type: "image" | "video";
  name: string;
  toapis_url: string;
  local_path?: string;
  task_id?: string;
  style?: string;
  size_bytes?: number;
  created_at: string;
}

interface Library {
  images: Asset[];
  videos: Asset[];
}

function readLibrary(): Library {
  try {
    const raw = fs.readFileSync(LIBRARY_PATH, "utf-8");
    return JSON.parse(raw) as Library;
  } catch {
    return { images: [], videos: [] };
  }
}

function writeLibrary(lib: Library): void {
  fs.writeFileSync(LIBRARY_PATH, JSON.stringify(lib, null, 2));
}

export async function GET() {
  try {
    const lib = readLibrary();
    return NextResponse.json(lib);
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json() as Partial<Asset>;
    if (!body.type || !body.toapis_url) {
      return NextResponse.json({ error: "missing type or toapis_url" }, { status: 400 });
    }

    const lib = readLibrary();
    const asset: Asset = {
      id: `asset_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
      type: body.type as "image" | "video",
      name: body.name || `${body.type}_${Date.now()}`,
      toapis_url: body.toapis_url,
      local_path: body.local_path,
      task_id: body.task_id,
      style: body.style,
      size_bytes: body.size_bytes,
      created_at: new Date().toISOString(),
    };

    if (asset.type === "image") {
      lib.images.unshift(asset); // newest first
    } else {
      lib.videos.unshift(asset);
    }

    writeLibrary(lib);
    return NextResponse.json({ success: true, asset });
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}
