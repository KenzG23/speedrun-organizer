
// Google Drive OAuth and API utilities
const DISCOVERY_DOC = 'https://www.googleapis.com/discovery/v1/apis/drive/v3/rest';
const SCOPES = 'https://www.googleapis.com/auth/drive.file';

// These would normally come from Google Cloud Console
// For now, using placeholder values - user needs to set these up
const CLIENT_ID = process.env.VITE_GOOGLE_CLIENT_ID || 'your-google-client-id';
const API_KEY = process.env.VITE_GOOGLE_API_KEY || 'your-google-api-key';

let gapi: any;
let tokenClient: any;

export const initializeGoogleDrive = async () => {
  return new Promise((resolve, reject) => {
    // Load Google API script
    if (!window.gapi) {
      const script = document.createElement('script');
      script.src = 'https://apis.google.com/js/api.js';
      script.onload = () => {
        loadGoogleAuth().then(resolve).catch(reject);
      };
      script.onerror = reject;
      document.head.appendChild(script);
    } else {
      loadGoogleAuth().then(resolve).catch(reject);
    }
  });
};

const loadGoogleAuth = async () => {
  return new Promise((resolve, reject) => {
    window.gapi.load('client', async () => {
      try {
        await window.gapi.client.init({
          apiKey: API_KEY,
          discoveryDocs: [DISCOVERY_DOC],
        });

        // Load Google Identity Services
        const script = document.createElement('script');
        script.src = 'https://accounts.google.com/gsi/client';
        script.onload = () => {
          tokenClient = window.google.accounts.oauth2.initTokenClient({
            client_id: CLIENT_ID,
            scope: SCOPES,
            callback: '', // Will be set when needed
          });
          resolve(true);
        };
        script.onerror = reject;
        document.head.appendChild(script);
      } catch (error) {
        reject(error);
      }
    });
  });
};

export const signInToGoogleDrive = (): Promise<any> => {
  return new Promise((resolve, reject) => {
    if (!tokenClient) {
      reject(new Error('Google Drive not initialized'));
      return;
    }

    tokenClient.callback = async (resp: any) => {
      if (resp.error !== undefined) {
        reject(resp);
        return;
      }
      resolve(resp);
    };

    if (window.gapi.client.getToken() === null) {
      tokenClient.requestAccessToken({ prompt: 'consent' });
    } else {
      tokenClient.requestAccessToken({ prompt: '' });
    }
  });
};

export const signOutFromGoogleDrive = () => {
  const token = window.gapi.client.getToken();
  if (token !== null) {
    window.google.accounts.oauth2.revoke(token.access_token);
    window.gapi.client.setToken('');
  }
};

export const uploadToGoogleDrive = async (data: any, fileName: string) => {
  try {
    const fileMetadata = {
      name: fileName,
    };

    const form = new FormData();
    form.append('metadata', new Blob([JSON.stringify(fileMetadata)], { type: 'application/json' }));
    form.append('file', new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' }));

    const response = await fetch('https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart', {
      method: 'POST',
      headers: new Headers({
        Authorization: `Bearer ${window.gapi.client.getToken().access_token}`,
      }),
      body: form,
    });

    return await response.json();
  } catch (error) {
    console.error('Error uploading to Google Drive:', error);
    throw error;
  }
};

export const listGoogleDriveFiles = async (query: string = '') => {
  try {
    const response = await window.gapi.client.drive.files.list({
      q: query,
      fields: 'files(id,name,modifiedTime)',
    });
    return response.result.files;
  } catch (error) {
    console.error('Error listing Google Drive files:', error);
    throw error;
  }
};

export const downloadFromGoogleDrive = async (fileId: string) => {
  try {
    const response = await window.gapi.client.drive.files.get({
      fileId: fileId,
      alt: 'media',
    });
    return JSON.parse(response.body);
  } catch (error) {
    console.error('Error downloading from Google Drive:', error);
    throw error;
  }
};

export const isGoogleDriveConnected = () => {
  return window.gapi && window.gapi.client.getToken() !== null;
};
