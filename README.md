# JWT decoding using njs in Nginx

## Assumptions

1. JWT token stores user's name under payload `name`.
1. Token is passed via query parameter `access_token`.

## Testing njs script in CLI
Notes about CLI approach:
* `console.log` being available ([see all other global objects available](https://nginx.org/en/docs/njs/cli.html))
* can't use `export`
```bash
$ cat jwt_working_example_njs_cli.js | docker run --rm -i nginx njs -q -
```

## Testing script with Nginx via Docker

Run nginx with script:
```bash
$ docker run --rm -v $(pwd)/nginx.conf:/etc/nginx/nginx.conf:ro -v $(pwd)/jwt.conf:/etc/nginx/conf.d/jwt.conf:ro  -v $(pwd)/jwt.js:/etc/nginx/jwt.js:ro -p 8080:8000 nginx
```

Test using `curl`:
```bash
$ curl localhost:8080/jwt?access_token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c
John Doe
```

### Token generation
Token generated via https://jwt.io/#debugger-io

Inputs:
* header
    ```
    {
      "alg": "HS256",
      "typ": "JWT"
    }
    ```
* paypload
    ```
    {
      "sub": "1234567890",
      "name": "John Doe",
      "iat": 1516239022
    }
    ```
## How working example was achieved

1. Created Nginx configuration file [jwt.conf](jwt.conf) that defines `/jwt` endpoint.
1. Created [jwt.js](jwt.js) with modified example from https://nginx.org/en/docs/njs/examples.html#jwt_field.
1. Added `load_model` to the beginning of default `nginx.conf` file:
    ```
    load_module modules/ngx_http_js_module.so;
    ```
1. Added `$jwt_user` to log_format in `nginx.conf` file:
    ```
    log_format  main  '$remote_addr - $remote_user [$time_local] "$request" '
                      '$status $body_bytes_sent "$http_referer" '
                      '"$http_user_agent" "$http_x_forwarded_for" "$jwt_user"';
    ```

## Debugging examples

### CLI

Use in [jwt_working_example_njs_cli.js](jwt_working_example_njs_cli.js):
```javascript
console.log(JSON.stringify(debug_this_object));
```

### Nginx

Use in [jwt.js](jwt.js):
```javascript
r.error(JSON.stringify(r));
```
Request object is injected as `r` variable.

Output can be found in CLI output where Docker container was run.

## Reference
* [NJS reference](http://nginx.org/en/docs/njs/reference.html)
* [NJS examples](https://nginx.org/en/docs/njs/examples.html)
* [NJS CLI Objects](https://nginx.org/en/docs/njs/cli.html)
* [Nginx ngx_http_js_module docs](https://nginx.org/en/docs/http/ngx_http_js_module.html)
