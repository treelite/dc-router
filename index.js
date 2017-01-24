/**
 * @file dc-router
 * @author treelite (c.xinle@gmail.com)
 */

let prefixs = new WeakMap();
let subActions = new WeakMap();
let checkMethod = (ctx, method) => ctx.method.toLowerCase() === method.toLowerCase();

/**
 * Create a single action middleware
 *
 * @param {Function} target action handler
 * @param {string} method HTTP method
 * @param {string} path the path to process
 * @return {Function}
 */
function createAction(target, method, path) {
    return async function (ctx, next) {
        if (checkMethod(ctx, method)) {
            let params = matchPath(ctx, path);
            if (params) {
                await target(ctx, params);
            }
        }
        await next();
    };
}

/**
 * Parse the path to a RegExp and a array of param name
 *
 * @param {string} path path
 * @return {Object}
 */
function path2Reg(path) {
    let paramNames = [];
    path = path.replace(/\/:([^\/]+)/g, ($0, $1) => {
        paramNames.push($1);
        return '/([^/]+)';
    });
    let reg = new RegExp(`^${path}$`);
    return {reg, paramNames};
}

/**
 * Normalize path
 * Begin and end with '/'
 *
 * @param {...string} paths paths
 * @return {string}
 */
function normalizePath(...paths) {
    let res = '/';

    for (let path of paths) {
        if (path.charAt(0) === '/') {
            path = path.substring(1);
        }

        res += path;

        if (res.charAt(res.length - 1) !== '/') {
            res += '/';
        }
    }

    return res;
}

/**
 * Check current request is if match the path
 * If match, return param object, otherwise return `undefined`
 *
 * @param {Object} ctx koa's context
 * @param {string} path path
 * @return {!Object}
 */
function matchPath(ctx, path) {
    let reqPath = normalizePath(ctx.path);
    let {reg, paramNames} = path2Reg(normalizePath(path));
    let matchs = reg.exec(reqPath);
    if (matchs) {
        let res = {};
        for (let [index, name] of paramNames.entries()) {
            res[name] = matchs[index + 1];
        }
        return res;
    }
}

/**
 * Decorator for action
 *
 * @public
 * @param {string} method HTTP method
 * @param {string=} path the path which need to be processed
 * @return {Function}
 */
export function action(method, path = '/') {
    return function (...args) {
        if (args.length === 1) {
            return createAction(args[0], method, path);
        }

        let cls = args[0].constructor;
        let name = args[1];
        let actions = subActions.get(cls) || [];
        actions.push({path, name, method});
        subActions.set(cls, actions);
        // Return original descriptor
        return args[2];
    };
}

/**
 * Do something before action
 *
 * @public
 * @param {string} path sub path
 * @return {Function}
 */
export function before(path = '/') {
    return function (target, name, descriptor) {
        let cls = target.constructor;
        let handlers = prefixs.get(cls) || [];
        handlers.push({path, name});
        prefixs.set(cls, handlers);
        return descriptor;
    };
}

/**
 * Decorator for router
 *
 * @public
 * @param {string} path the parent path for router
 * @return {Function}
 */
export function router(path = '/') {
    return function (target) {
        return async function (ctx, next) {
            let obj;

            async function invoke(name, params) {
                obj = obj || Reflect.construct(target, []);
                return await obj[name](ctx, params);
            }

            // Call prefix handler
            let prefixHandlrs = prefixs.get(target) || [];
            for (let handler of prefixHandlrs) {
                let fullPath = normalizePath(path, handler.path);
                let params = matchPath(ctx, fullPath);
                if (params) {
                    await invoke(handler.name, params);
                }
            }

            // Call action
            let actions = subActions.get(target) || [];
            for (let action of actions) {
                if (!checkMethod(ctx, action.method)) {
                    continue;
                }
                let fullPath = normalizePath(path, action.path);
                let params = matchPath(ctx, fullPath);
                if (params) {
                    await invoke(action.name, params);
                    break;
                }
            }

            await next();
        };
    };
}

/**
 * Decorator for GET
 *
 * @public
 * @param {string} path the path which need to be processed
 * @return {Function}
 */
export function get(path) {
    return action('get', path);
}

/**
 * Decorator for POST
 *
 * @public
 * @param {string} path the path which need to be processed
 * @return {Function}
 */
export function post(path) {
    return action('post', path);
}
