import { promises as fs } from "fs";
import path from "path";

type TrackMeta = {
  title?: string;
  artist?: string;
  album?: string;
  image?: string;
};

const MUSIC_DIR = path.join(process.cwd(), "public", "music", "music", "SoundCloud.app_Leaks");

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
      
      if (frameId === "APIC") {
        try {
          // APIC frame layout:
          // <Header for 'APIC', ID3v2.2 or v2.3/v2.4>
          // Text encoding $xx
          // MIME type <text string> $00
          // Picture type $xx
          // Description <text string according to encoding> $00 (or $00 00)
          // Picture data <binary data>
          const encoding = frameData[0];
          let mimeEnd = frameData.indexOf(0, 1);
          if (mimeEnd === -1) mimeEnd = 1;
          const mimeType = frameData.toString("ascii", 1, mimeEnd) || "image/jpeg";
          const pictureType = frameData[mimeEnd + 1];
          
          let pictureDataStart = mimeEnd + 2;
          // Skip description
          if (encoding === 1 || encoding === 2) { // UTF-16
            // Look for 00 00
            let descEnd = frameData.indexOf("\0\0", pictureDataStart);
            if (descEnd !== -1) {
              pictureDataStart = descEnd + 2;
            }
          } else {
            let descEnd = frameData.indexOf(0, pictureDataStart);
            if (descEnd !== -1) {
              pictureDataStart = descEnd + 1;
            }
          }
          
          const pictureData = frameData.subarray(pictureDataStart);
          if (pictureData.length > 0) {
            meta.image = `data:${mimeType};base64,${pictureData.toString("base64")}`;
          }
        } catch {}
      }

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

const fallbackTitle = (fileName: string) => {
  return fileName.replace(/(\.mp3)+$/i, "").replace(/_/g, " ").trim();
};

export async function GET(): Promise<Response> {
  try {
    const entries = await fs.readdir(MUSIC_DIR, { withFileTypes: true });
    const files = entries
      .filter((entry) => entry.isFile() && entry.name.toLowerCase().endsWith(".mp3"))
      .map((entry) => entry.name)
      .sort((a, b) => {
        const priority1 = "cute jumpstyle";
        const priority2 = "did i tell u that i miss u";
        
        const aLower = a.toLowerCase();
        const bLower = b.toLowerCase();

        if (aLower.includes(priority1)) return -1;
        if (bLower.includes(priority1)) return 1;
        if (aLower.includes(priority2)) return -1;
        if (bLower.includes(priority2)) return 1;
        
        return a.localeCompare(b);
      });

    const tracks = await Promise.all(
      files.map(async (fileName, index) => {
        const filePath = path.join(MUSIC_DIR, fileName);
        const meta = await readMetadata(filePath);
        const title = meta.title?.trim() || fallbackTitle(fileName);
        const artist = meta.artist?.trim() || "";
        const album = meta.album?.trim() || "";

        const imageBase = fileName.replace(/(\.mp3)+$/i, "");
        const imageExtensions = [".png", ".jpg", ".jpeg", ".gif"];
        let image = meta.image || "/images/ui/player.png";

        if (!meta.image) {
          for (const ext of imageExtensions) {
            try {
              const imgPath = path.join(MUSIC_DIR, imageBase + ext);
              await fs.access(imgPath);
              image = `/music/music/SoundCloud.app_Leaks/${encodeURIComponent(imageBase + ext)}`;
              break;
            } catch {}
          }
        }

        return {
          id: `${index}-${fileName}`,
          src: `/music/music/SoundCloud.app_Leaks/${encodeURIComponent(fileName)}`,
          title,
          artist,
          album,
          image,
        };
      })
    );

    return Response.json({ tracks });
  } catch {
    return Response.json({ tracks: [] });
  }
}
