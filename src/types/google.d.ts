
// Google API type declarations
declare global {
  interface Window {
    gapi: {
      load: (api: string, callback: () => void) => void;
      client: {
        init: (config: {
          apiKey: string;
          discoveryDocs: string[];
        }) => Promise<void>;
        getToken: () => { access_token: string } | null;
        setToken: (token: string | null) => void;
        drive: {
          files: {
            list: (params: {
              q?: string;
              fields?: string;
            }) => Promise<{
              result: {
                files: Array<{
                  id: string;
                  name: string;
                  modifiedTime: string;
                }>;
              };
            }>;
            get: (params: {
              fileId: string;
              alt: string;
            }) => Promise<{
              body: string;
            }>;
          };
        };
      };
    };
    google: {
      accounts: {
        oauth2: {
          initTokenClient: (config: {
            client_id: string;
            scope: string;
            callback: string | ((response: any) => void);
          }) => {
            callback: (response: any) => void;
            requestAccessToken: (options: { prompt: string }) => void;
          };
          revoke: (token: string) => void;
        };
      };
    };
  }
}

export {};
