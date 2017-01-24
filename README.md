# dc-router

Another router for Koa(v2), base on decorator.

Current implementation is based on the older decorator proposal, please use [babel-plugin-transform-decorators-legacy](https://github.com/loganfsmyth/babel-plugin-transform-decorators-legacy) to compile codes. When [new proposal](http://tc39.github.io/proposal-decorators/) is ready, `dc-router` will update immediately.

## Usage

```js
import koa from 'koa';
import {router, get, post} from 'dc-router';

let app = new koa();

@router('/product')
class Product {

    @get('/')
    index(ctx) {
        // Do something for GET /product
        ...
    }

    @get('/:id')
    query(ctx, params) {
        // Do something for GET /product/:id
        ...
    }

    @post('/:id')
    add(ctx, params) {
        // Do something for POST /product/:id
        ...
    }

}

app.use(Product);
app.listen(80);
```

## API

### router(path)

Create a router module.

* __path__ `{string}` the parent path
* _return_ `{Function}` a middleware for Koa(v2)

### action(method, path)

Create handler for the path.

* __method__ `{string}` HTTP method
* __path__ `{string}` the sub path, it combines with parent path to be the full path

### get(path)

Shortcut for `action('get', path)`

### post(path)

Shortcut for `action('post', path)`

### options(path)

Shortcut for `action('options', path)`

### head(path)

Shortcut for `action('head', path)`

### put(path)

Shortcut for `action('put', path)`

### before(path)

Do something before action, must be used for class methods.

* __path__ `{string}` the sub path, it combines with parent path to be the full path


## Decorate a function ?

Current proposal don't support decorator for function, because it's not compatible with function declarations being hoisted, more information see this: [https://esdiscuss.org/topic/decorators-for-functions]()

But if really want use `dc-router` for function, it could be this way:

```js
function handler(ctx, params) {
    ...
}

// Don't need `router`
// Just `action`
app.use(get('/hello')(handler));
```
