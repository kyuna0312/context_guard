// Lazy pg pool + query helper for the forge-db MCP server. The pool is only
// instantiated on the first call to q(). The record-change hook reads the
// same env var but stays import-free so it works without node_modules.

import pg from "pg";

let _pool;
function pool() {
  if (!_pool) {
    const url = process.env.FORGE_DATABASE_URL;
    if (!url) {
      throw new Error(
        "FORGE_DATABASE_URL is not set — export it in the shell that launches Claude Code, then restart."
      );
    }
    // pg has no default connect timeout; without one an unreachable host
    // hangs the tool call instead of erroring.
    _pool = new pg.Pool({ connectionString: url, connectionTimeoutMillis: 5000 });
    // An idle client error (dropped connection) is an 'error' event on the
    // pool; unhandled it would crash the whole MCP server.
    _pool.on("error", (err) => console.error(`forge-db pool error: ${err.message}`));
  }
  return _pool;
}

export async function q(text, params = []) {
  const client = await pool().connect();
  try {
    return (await client.query(text, params)).rows;
  } finally {
    client.release();
  }
}
