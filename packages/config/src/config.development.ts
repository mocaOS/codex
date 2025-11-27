export default {
  env: "development",

  api: {
    baseUrl: "http://localhost:8055",
  },

  moca: {
    api: {
      baseUrl: "https://api.moca.qwellco.de",
    },
  },

  ipfs: {
    gateway: "http://127.0.0.1:8080",
    // codex_files_hash: "QmNdMnuJURo3sFkLR2WLSshPqycfjafbHoAcd2FTdBJ8S5", // pre launch
    codex_files_hash: "QmPm4Tgbt1MM5dE343mqsFkXwdzdmyUCQznf6SdD7fm4W2",
  },

  directus: {
    codexFolderId: null, // Will be looked up or created if null
    codexFolderName: "Codex",
    ipfsGateway: "https://ipfs.qwellcode.de",
  },
};
