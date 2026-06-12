import { NextRequest, NextResponse } from 'next/server';
import { exec } from 'child_process';
import { promisify } from 'util';
import fs from 'fs';
import path from 'path';

const execPromise = promisify(exec);

export async function POST(request: NextRequest) {
  try {
    const { url } = await request.json();
    
    if (!url) {
      return NextResponse.json({ error: 'No URL provided' }, { status: 400 });
    }
    
    // Clean URL
    let cleanUrl = url.trim();
    const videoIdMatch = cleanUrl.match(/(?:v=|\/)([a-zA-Z0-9_-]{11})(?:[&?]|$)/);
    if (videoIdMatch) {
      cleanUrl = `https://youtube.com/watch?v=${videoIdMatch[1]}`;
    }
    
    console.log('Cleaned URL:', cleanUrl);
    
    // Create temp directory
    const tempDir = path.join(process.cwd(), 'tmp');
    if (!fs.existsSync(tempDir)) {
      fs.mkdirSync(tempDir, { recursive: true });
    }
    
    // Clean temp folder of old files
    const oldFiles = fs.readdirSync(tempDir);
    for (const file of oldFiles) {
      if (file.endsWith('.mp4') || file.endsWith('.part') || file.endsWith('.ytdl')) {
        try {
          fs.unlinkSync(path.join(tempDir, file));
          console.log(`Deleted old file: ${file}`);
        } catch (e) {}
      }
    }
    
    // Use yt-dlp with the working command
    const outputPath = path.join(tempDir, '%(title)s.%(ext)s');
    const command = `yt-dlp -f "best[ext=mp4]" -o "${outputPath}" --no-playlist --restrict-filenames "${cleanUrl}"`;
    
    console.log('Running yt-dlp...');
    const { stdout, stderr } = await execPromise(command, { timeout: 300000 });
    
    if (stderr) {
      console.log('yt-dlp stderr:', stderr);
    }
    if (stdout) {
      console.log('yt-dlp stdout:', stdout);
    }
    
    // Find downloaded file
    const files = fs.readdirSync(tempDir);
    const videoFile = files.find(f => f.endsWith('.mp4'));
    
    if (videoFile) {
      const filePath = path.join(tempDir, videoFile);
      const buffer = fs.readFileSync(filePath);
      const stats = fs.statSync(filePath);
      
      console.log(`Download complete: ${videoFile} (${(stats.size / 1024 / 1024).toFixed(2)} MB)`);
      
      // Clean up
      fs.unlinkSync(filePath);
      
      // Sanitize filename
      const safeFileName = videoFile.replace(/[^\w\s.-]/g, '').replace(/\s+/g, '_');
      
      return new NextResponse(buffer, {
        headers: {
          'Content-Type': 'video/mp4',
          'Content-Length': stats.size.toString(),
          'Content-Disposition': `attachment; filename="${safeFileName}"`,
        },
      });
    }
    
    return NextResponse.json({ error: 'Download failed - no file found' }, { status: 500 });
    
  } catch (error) {
    console.error('Download error:', error);
    return NextResponse.json({ 
      error: 'Download failed: ' + (error instanceof Error ? error.message : String(error))
    }, { status: 500 });
  }
}