import config from '@/config'

/**
 * Call the Mausritter Colony server.
 * Query values are URL-encoded. HTTP error statuses do not throw: the caller gets the
 * status so it can be displayed. Only network failures reject.
 * @param  {String} path                     Route below the API root, e.g. "/sheets".
 * @param  {Object} [options]
 * @param  {String} [options.method='GET']   HTTP method.
 * @param  {Object} [options.query]          Query string parameters.
 * @param  {Object} [options.body]           JSON body.
 * @return {Promise<{ ok: Boolean, status: Number, statusText: String }>}
 */
export async function request (path, { method = 'GET', query, body } = {}) {
  const queryString = query ? `?${new URLSearchParams(query)}` : ''
  const response = await fetch(`${config.SERVER_API_URL}${path}${queryString}`, {
    method,
    headers: body ? { 'Content-Type': 'application/json' } : undefined,
    body: body ? JSON.stringify(body) : undefined
  })
  let statusText = response.statusText
  if (!response.ok) {
    // Server errors are JSON: { error: true, message }
    const json = await response.json().catch(() => null)
    statusText = json?.message || statusText
  }
  return { ok: response.ok, status: response.status, statusText }
}

export default { request }
