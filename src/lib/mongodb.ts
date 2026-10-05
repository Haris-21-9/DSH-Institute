/**
 * MongoDB Configuration & Verified Credentials for Colabify Database
 * Synchronizes Projects, Team Members, and Blog Articles directly with MongoDB Atlas.
 */
declare const process: {
  env: {
    MONGODB_URI?: string;
    MONGODB_DB_NAME?: string;
    MONGODB_USERNAME?: string;
    MONGODB_PASSWORD?: string;
  };
};

export const MONGODB_CONFIG = {
  uri:
    (typeof process !== "undefined" && process?.env?.MONGODB_URI) ||
    "mongodb+srv://haris2192001_db_user:1of06JZdrwXOtgif@cluster0.9xogsl5.mongodb.net/Colabify?retryWrites=true&w=majority&appName=Cluster0",
  dbName: (typeof process !== "undefined" && process?.env?.MONGODB_DB_NAME) || "Colabify",
  username: (typeof process !== "undefined" && process?.env?.MONGODB_USERNAME) || "haris2192001_db_user",
  password: (typeof process !== "undefined" && process?.env?.MONGODB_PASSWORD) || "1of06JZdrwXOtgif",
  cluster: "cluster0.9xogsl5.mongodb.net",
  collections: {
    projects: "projects",
    team: "team_members",
    blogs: "blogs",
  },
};
