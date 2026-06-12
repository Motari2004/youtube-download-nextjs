import { NextRequest, NextResponse } from 'next/server';
import ytdl from '@distube/ytdl-core';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const url = body.url;
    
    console.log('URL received:', url);
    
    if (!url) {
      return NextResponse.json({ error: 'No URL provided' }, { status: 400 });
    }
    
    // Extract video ID
    let videoId = '';
    const patterns = [
      /(?:youtube\.com\/watch\?v=)([a-zA-Z0-9_-]{11})/,
      /(?:youtu\.be\/)([a-zA-Z0-9_-]{11})/,
      /(?:v=)([a-zA-Z0-9_-]{11})/
    ];
    
    for (const pattern of patterns) {
      const match = url.match(pattern);
      if (match) {
        videoId = match[1];
        break;
      }
    }
    
    if (!videoId) {
      return NextResponse.json({ error: 'Invalid YouTube URL' }, { status: 400 });
    }
    
    const cleanUrl = `https://youtube.com/watch?v=${videoId}`;
    console.log('Clean URL:', cleanUrl);
    
    // Get video info
    const info = await ytdl.getInfo(cleanUrl);
    const title = info.videoDetails.title.replace(/[^\w\s.-]/g, '').replace(/\s+/g, '_').substring(0, 100);
    
    // Get stream
    const stream = ytdl(cleanUrl, { quality: '18' });
    
    // Collect chunks
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
    return NextResponse.json({ 
      error: 'Download failed: ' + (error instanceof Error ? error.message : String(error))
    }, { status: 500 });
  }
}