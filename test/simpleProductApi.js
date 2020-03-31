const swagger = require('../dist/lib/protoc-gen-swagger');
const apis = require('google-proto-files');
const path = require('path');

swagger.fromProto({
    includeDirs: [
        path.resolve(apis.getProtoPath(), '..'),
        path.resolve('./test/protos')
    ],
    files: ['product.proto'],
    outOptions: 'logtostderr=true:' + path.resolve(__dirname, 'generated')
});
