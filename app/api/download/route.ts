import { NextRequest, NextResponse } from 'next/server';
import ytdl from '@distube/ytdl-core';

export const dynamic = 'force-dynamic';
export const maxDuration = 60;

export async function POST(request: NextRequest) {
  try {
    const { url } = await request.json();
    
    if (!url) {
      return NextResponse.json({ error: 'No URL provided' }, { status: 400 });
    }
    
    // Extract video ID
    const videoIdMatch = url.match(/(?:v=|\/)([a-zA-Z0-9_-]{11})/);
    if (!videoIdMatch) {
      return NextResponse.json({ error: 'Invalid YouTube URL' }, { status: 400 });
    }
    
    const videoId = videoIdMatch[1];
    const cleanUrl = `https://youtube.com/watch?v=${videoId}`;
    
    const info = await ytdl.getInfo(cleanUrl);
    const title = info.videoDetails.title
      .replace(/[^\w\s.-]/g, '')
      .replace(/\s+/g, '_')
      .substring(0, 100);
    
    const stream = ytdl(cleanUrl, { quality: '18' });
    
    const chunks: Uint8Array[] = [];
    for await (const chunk of stream) {
      chunks.push(chunk);
    }
    
    const buffer = Buffer.concat(chunks);
    
    return new NextResponse(buffer, {
      headers: {
        'Content-Type': 'video/mp4',
        'Content-Disposition': `attachment; filename="${title}.mp4"`,
      },
    });
    
  } catch (error) {
    console.error('Error:', error);
    return NextResponse.json({ error: 'Download failed' }, { status: 500 });
  }
}