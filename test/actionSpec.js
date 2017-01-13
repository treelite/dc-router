/**
 * @file Action spec
 * @author treelite (c.xinle@gmail.com)
 */

import {action} from '../index';
import MockContext from './MockContext';

describe('Action', () => {

    describe('for single function', () => {

        it('no params', done => {
            let called = 0;

            let handler = action('get', '/hello')(ctx => {
                called++;
                expect(ctx instanceof MockContext).toBeTruthy();
            });

            let ctx = new MockContext('get', '/');
            handler(ctx, () => {
                expect(called).toEqual(0);
                ctx = new MockContext('get', '/hello');
                handler(ctx, () => {
                    expect(called).toEqual(1);
                    done();
                });
            });
        });

        it('width one param', done => {
            let called = 0;
            let handler = action('get', '/:id')((ctx, params) => {
                called++;
                expect(params).toEqual({id: 'www'});
            });

            let ctx = new MockContext('get', '/www');
            handler(ctx, () => {
                expect(called).toEqual(1);
                done();
            });
        });

        it('width params', done => {
            let called = 0;
            let handler = action('get', '/:id/:name')((ctx, params) => {
                called++;
                expect(params).toEqual({id: 'www', name: 'cxl'});
            });

            let ctx = new MockContext('get', '/www/cxl');
            handler(ctx, () => {
                expect(called).toEqual(1);
                done();
            });
        });

        it('check method', done => {
            let called = 0;
            let handler = action('post', '/')((ctx, params) => {
                called++;
            });

            let ctx = new MockContext('get', '/');
            handler(ctx, () => {
                expect(called).toEqual(0);
                ctx = new MockContext('post', '/');
                handler(ctx, () => {
                    expect(called).toEqual(1);
                    done();
                });
            });
        });

    });

});
