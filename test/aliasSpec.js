/**
 * @file Alias action spec
 * @author treelite (c.xinle@gmail.com)
 */

import {get, post} from '../index';
import MockContext from './MockContext';

describe('Alias actions', () => {

    it('get', done => {
        let called = 0;

        let handler = get('/hello')(ctx => {
            called++;
            expect(ctx instanceof MockContext).toBeTruthy();
        });

        let ctx = new MockContext('get', '/');
        handler(ctx, () => {
            expect(called).toEqual(0);
            ctx = new MockContext('get', '/hello');
            handler(ctx, () => {
                expect(called).toEqual(1);
                ctx = new MockContext('head', '/hello');
                handler(ctx, () => {
                    expect(called).toEqual(1);
                    done();
                });
            });
        });
    });

    it('post', done => {
        let called = 0;

        let handler = post('/hello')(ctx => {
            called++;
            expect(ctx instanceof MockContext).toBeTruthy();
        });

        let ctx = new MockContext('post', '/');
        handler(ctx, () => {
            expect(called).toEqual(0);
            ctx = new MockContext('post', '/hello');
            handler(ctx, () => {
                expect(called).toEqual(1);
                ctx = new MockContext('head', '/hello');
                handler(ctx, () => {
                    expect(called).toEqual(1);
                    done();
                });
            });
        });
    });

});
