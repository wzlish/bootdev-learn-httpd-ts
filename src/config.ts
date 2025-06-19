process.loadEnvFile();

function getENV(key: string) {
  if (!Object.hasOwn(process.env, key) || !process.env[key]) {
    throw new Error(`${key} not found or set in .env`);
  }

  return process.env[key];
}

type APIConfig = {
  fileserverHits: number;
  messageLengthLimit: number;
  db_url: string;
};
export const apiConfig: APIConfig = {
  messageLengthLimit: 140,
  fileserverHits: 0,
  db_url: getENV("DB_URL"),
};
