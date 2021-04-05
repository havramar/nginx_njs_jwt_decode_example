function jwt(data) {
  var parts = data
    .split('.')
    .slice(0, 2)
    .map((v) => Buffer.from(v, 'base64url').toString())
    .map(JSON.parse);
  return { headers: parts[0], payload: parts[1] };
}

function jwt_payload_sub(r) {
  // Check for query parameter `access_token` for JWT
  if (!('access_token' in r.args)) {
    return '';
  }
  var decoded = jwt(r.args['access_token']);

  // Change `name` to any other string that needs to be passed to nginx.conf variable
  return decoded.payload.name;
}

export default { jwt_payload_sub };
