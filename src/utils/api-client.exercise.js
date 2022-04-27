const apiURL = process.env.REACT_APP_API_URL

function client(endpoint, {token, headers, data, ...customConfig} = {}) {
  const config = {
    method: data ? 'POST' : 'GET',
    headers: {
      Authorization: token ? `Bearer ${token}` : undefined,
      'Content-Type': data ? 'application/json' : undefined,
      ...headers,
    },
    body: data ? data : undefined,
    ...customConfig,
  }
  console.debug(config)

  return window.fetch(`${apiURL}/${endpoint}`, config).then(async response => {
    console.debug(response)
    const data = await response.json()
    if (response.ok) {
      return data
    } else {
      return Promise.reject(data)
    }
  })
}

export {client}
