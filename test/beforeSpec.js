/**
 * @file Before spec
 * @author treelite (c.xinle@gmail.com)
 */

import {router, post, get, before} from '../index';
import MockContext from './MockContext';

describe('before', () => {

    it('single handler', done => {
        let called = [];

        @router('/:name')
        class Handler {
            @before('/:id')
            check(ctx, params) {
                expect(params.id).toEqual('100');
                called.push('check');
            }

            @get('/:id')
            query() {
                called.push('query');
            }

            @post('/:id')
            save() {
                called.push('save');
            }

            @get('/')
            index() {
                called.push('index');
            }
        }

        let ctx = new MockContext('post', '/treelite/100');

        Handler(ctx, () => {
            expect(called).toEqual(['check', 'save']);
            called = [];
            ctx = new MockContext('get', '/treelite/100');

            Handler(ctx, () => {
                expect(called).toEqual(['check', 'query']);
                called = [];

                ctx = new MockContext('get', '/treelite');
                Handler(ctx, () => {
                    expect(called).toEqual(['index']);
                    done();
                });
            });
        });
    });

    it('multi handlers with async', done => {
        let called = [];

        @router('/')
        class Handler {
            @before('/')
            check() {
                called.push(1);
                return new Promise(resolve => setTimeout(resolve, 300));
            }

            @before('/')
            finish() {
                called.push(2);
            }
        }

        let ctx = new MockContext('post', '/');
        Handler(ctx, () => {
            expect(called).toEqual([1, 2]);
            done();
        });
    });

});
