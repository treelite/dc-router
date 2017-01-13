/**
 * @file Router spec
 * @author treelite (c.xinle@gmail.com)
 */

import {router, action} from '../index';
import MockContext from './MockContext';

describe('Router', () => {

    it('normal', done => {

        let called = [];

        @router('/:name')
        class Handler {
            @action('get')
            query(ctx, params) {
                called.push('query');
                expect(params).toEqual({name: 'www'});
            }

            @action('post')
            save(ctx, params) {
                called.push('save');
                expect(params).toEqual({name: 'www'});
            }
        }

        let ctx = new MockContext('post', '/www');
        Handler(ctx, () => {
            ctx = new MockContext('get', '/www');
            Handler(ctx, () => {
                expect(called).toEqual(['save', 'query']);
                done();
            });
        });

    });

    it('sub paths', done => {
        let called = [];

        @router('/shop')
        class Handler {
            @action('get', '/products/:id')
            query(ctx, params) {
                called.push('query');
                expect(params).toEqual({id: '1001'});
            }

            @action('get', '/search/:key')
            search(ctx, params) {
                called.push('search');
                expect(params).toEqual({key: 'null'});
            }
        }

        let ctx = new MockContext('get', '/shop');

        Handler(ctx, () => {
            ctx = new MockContext('get', '/shop/search/null');
            Handler(ctx, () => {
                ctx = new MockContext('get', '/shop/products/1001');
                Handler(ctx, () => {
                    expect(called).toEqual(['search', 'query']);
                    done();
                });
            });
        });
    });

});
