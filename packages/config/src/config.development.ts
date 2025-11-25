export default {
  env: "development",

  api: {
    baseUrl: "http://localhost:8055",
  },

  ipfs: {
    gateway: "http://127.0.0.1:8080",
    codex_files_hash: "QmNdMnuJURo3sFkLR2WLSshPqycfjafbHoAcd2FTdBJ8S5",
  },

  directus: {
    codexFolderId: null, // Will be looked up or created if null
    codexFolderName: "Codex",
    ipfsGateway: "http://ipfs.qwellcode.de",
  },
};
