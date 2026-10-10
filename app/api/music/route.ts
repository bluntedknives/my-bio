import { promises as fs } from "fs";
import path from "path";

type TrackMeta = {
  title?: string;
  artist?: string;
  album?: string;
  image?: string;
};

const MUSIC_DIR = path.join(process.cwd(), "public", "music", "maui");
const MUSIC_URL_BASE = "/music/maui";

const synchsafeToInt = (buffer: Buffer) => {
  return (
    (buffer[0] & 0x7f) * 0x200000 +
    (buffer[1] & 0x7f) * 0x4000 +
    (buffer[2] & 0x7f) * 0x80 +
    (buffer[3] & 0x7f)
  );
};

const swapBytes = (buffer: Buffer) => {
  const swapped = Buffer.alloc(buffer.length);
  for (let i = 0; i < buffer.length; i += 2) {
    swapped[i] = buffer[i + 1] ?? 0;
    swapped[i + 1] = buffer[i] ?? 0;
  }
  return swapped;
};

const decodeTextFrame = (data: Buffer) => {
  if (!data.length) return "";
  const encoding = data[0];
  const payload = data.subarray(1);

  switch (encoding) {
    case 0:
      return payload.toString("latin1").replace(/\0/g, "").trim();
    case 1: {
      if (payload.length >= 2) {
        const bom0 = payload[0];
        const bom1 = payload[1];
        if (bom0 === 0xfe && bom1 === 0xff) {
          return swapBytes(payload.subarray(2)).toString("utf16le").replace(/\0/g, "").trim();
        }
        if (bom0 === 0xff && bom1 === 0xfe) {
          return payload.subarray(2).toString("utf16le").replace(/\0/g, "").trim();
        }
      }
      return payload.toString("utf16le").replace(/\0/g, "").trim();
    }
    case 2:
      return swapBytes(payload).toString("utf16le").replace(/\0/g, "").trim();
    case 3:
    default:
      return payload.toString("utf8").replace(/\0/g, "").trim();
  }
};

const parseId3v2 = async (filePath: string): Promise<TrackMeta> => {
  const handle = await fs.open(filePath, "r");
  try {
    const header = Buffer.alloc(10);
    await handle.read(header, 0, 10, 0);
    if (header.toString("ascii", 0, 3) !== "ID3") {
      return {};
    }

    const version = header[3];
    const tagSize = synchsafeToInt(header.subarray(6, 10));
    if (tagSize <= 0) return {};

    const tagBuffer = Buffer.alloc(tagSize);
    await handle.read(tagBuffer, 0, tagSize, 10);

    let offset = 0;
    const meta: TrackMeta = {};

    while (offset + 10 <= tagBuffer.length) {
      const frameId = tagBuffer.toString("ascii", offset, offset + 4);
      if (!frameId.trim()) break;

      const frameSizeBuffer = tagBuffer.subarray(offset + 4, offset + 8);
      const frameSize = version === 4 ? synchsafeToInt(frameSizeBuffer) : frameSizeBuffer.readUInt32BE(0);
      if (frameSize <= 0) break;

      const frameDataStart = offset + 10;
      const frameDataEnd = frameDataStart + frameSize;
      if (frameDataEnd > tagBuffer.length) break;

      const frameData = tagBuffer.subarray(frameDataStart, frameDataEnd);
      if (frameId === "TIT2") meta.title = decodeTextFrame(frameData);
      if (frameId === "TPE1") meta.artist = decodeTextFrame(frameData);
      if (frameId === "TALB") meta.album = decodeTextFrame(frameData);

      offset = frameDataEnd;
    }

    return meta;
  } catch {
    return {};
  } finally {
    await handle.close();
  }
};

const parseId3v1 = async (filePath: string): Promise<TrackMeta> => {
  const handle = await fs.open(filePath, "r");
  try {
    const stat = await handle.stat();
    if (stat.size < 128) return {};
    const tail = Buffer.alloc(128);
    await handle.read(tail, 0, 128, stat.size - 128);
    if (tail.toString("ascii", 0, 3) !== "TAG") return {};

    return {
      title: tail.toString("latin1", 3, 33).replace(/\0/g, "").trim(),
      artist: tail.toString("latin1", 33, 63).replace(/\0/g, "").trim(),
      album: tail.toString("latin1", 63, 93).replace(/\0/g, "").trim(),
    };
  } catch {
    return {};
  } finally {
    await handle.close();
  }
};

const readMetadata = async (filePath: string): Promise<TrackMeta> => {
  const id3v2 = await parseId3v2(filePath);
  if (id3v2.title || id3v2.artist || id3v2.album) {
    return id3v2;
  }
  return parseId3v1(filePath);
};

const leadingNumber = (fileName: string) => {
  const match = fileName.match(/^(\d+)/);
  return match ? Number(match[1]) : Number.POSITIVE_INFINITY;
};

const fallbackTitle = (fileName: string) => {
  return fileName
    .replace(/(\.mp3)+$/i, "")
    .replace(/^\d+\s*/, "")
    .replace(/_/g, " ")
    .trim();
};

const findCover = async (): Promise<string | null> => {
  const candidates = ["cover.jpg", "cover.jpeg", "cover.png", "cover.webp"];
  for (const name of candidates) {
    try {
      await fs.access(path.join(MUSIC_DIR, name));
      return `${MUSIC_URL_BASE}/${name}`;
    } catch {}
  }
  return null;
};

const artUrlFor = (fileName: string, artNames: Set<string>): string | null => {
  const base = fileName.replace(/\.mp3$/i, "");
  for (const ext of ["jpg", "jpeg", "png", "webp"]) {
    const name = `${base}.${ext}`;
    if (artNames.has(name)) {
      return `${MUSIC_URL_BASE}/art/${encodeURIComponent(name)}`;
    }
  }
  return null;
};

export async function GET(): Promise<Response> {
  try {
    const entries = await fs.readdir(MUSIC_DIR, { withFileTypes: true });
    const files = entries
      .filter((entry) => entry.isFile() && entry.name.toLowerCase().endsWith(".mp3"))
      .map((entry) => entry.name)
      .sort((a, b) => leadingNumber(a) - leadingNumber(b) || a.localeCompare(b));

    let artNames = new Set<string>();
    try {
      const artEntries = await fs.readdir(path.join(MUSIC_DIR, "art"));
      artNames = new Set(artEntries);
    } catch {}

    const cover = await findCover();

    const tracks = await Promise.all(
      files.map(async (fileName, index) => {
        const filePath = path.join(MUSIC_DIR, fileName);
        const meta = await readMetadata(filePath);
        const title = meta.title?.trim() || fallbackTitle(fileName);
        const artist = meta.artist?.trim() || "";
        const album = meta.album?.trim() || "";

        return {
          id: `${index}-${fileName}`,
          src: `${MUSIC_URL_BASE}/${encodeURIComponent(fileName)}`,
          title,
          artist,
          album,
          image: artUrlFor(fileName, artNames) || cover || "/images/ui/player.png",
        };
      })
    );

    return Response.json({ cover, tracks });
  } catch {
    return Response.json({ cover: null, tracks: [] });
  }
}
