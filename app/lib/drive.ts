import { google } from 'googleapis';
import { Readable } from 'stream';

export async function uploadToDrive(
  videoBuffer: Buffer,
  fileName: string,
  mimeType: string = 'video/mp4'
): Promise<string> {
  try {
    // Get credentials from environment variable or secret file
    const credentials = JSON.parse(
      process.env.GOOGLE_DRIVE_CREDENTIALS || '{}'
    );
    
    const auth = new google.auth.GoogleAuth({
      credentials,
      scopes: ['https://www.googleapis.com/auth/drive.file'],
    });
    
    const drive = google.drive({ version: 'v3', auth });
    
    // Convert buffer to readable stream
    const stream = Readable.from(videoBuffer);
    
    const response = await drive.files.create({
      requestBody: {
        name: fileName,
        parents: [process.env.GOOGLE_DRIVE_FOLDER_ID || 'root'],
      },
      media: {
        mimeType,
        body: stream,
      },
      fields: 'id, webViewLink',
    });
    
    return response.data.webViewLink || `https://drive.google.com/file/d/${response.data.id}/view`;
  } catch (error) {
    console.error('Drive upload error:', error);
    throw error;
  }
}