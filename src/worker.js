/**
 * Created by imal365 on 3/10/18.
 */

importScripts('../src/WASM/a.out.js');

var api = null;
Module.onRuntimeInitialized = function () {
    api = {
        version: Module.cwrap('version', 'number', []),
        create_buffer: Module.cwrap('create_buffer', 'number', ['number', 'number']),
        destroy_buffer: Module.cwrap('destroy_buffer', '', ['number']),

        free_result: Module.cwrap('free_result', '', ['number']),
        get_result_size: Module.cwrap('get_result_size', 'number', []),
        get_result_pointer: Module.cwrap('get_result_pointer', 'number', []),
        encode: Module.cwrap('encode', '', ['number', 'number', 'number', 'number'])
    };
};

FromBase64 = function (str) {
    return atob(str).split('').map(function (c) {
        return c.charCodeAt(0);
    });
};


/**
 * @return {string}
 */
ToBase64 = function (u8) {
    return btoa(u8.reduce(function (data, byte) {
        return data + String.fromCharCode(byte);
    }, ''));
};


onmessage = function (e) {
    var image = e.data[0];
    var index = e.data[1];
    var p = api.create_buffer(image.width, image.height);
    Module.HEAP8.set(image.data, p);
    api.encode(p, image.width, image.height, 100);
    var resultPointer = api.get_result_pointer();
    var resultSize = api.get_result_size();
    var resultView = new Uint8Array(Module.HEAP8.buffer, resultPointer, resultSize);
    var result = new Uint8Array(resultView);
    api.free_result(resultPointer);
    api.destroy_buffer(p);
    var dataurl = "data:image/webp;base64," + ToBase64(result);
    postMessage({dataurl: dataurl, index: index});
};