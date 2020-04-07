import * as tools from '@accility/protoc-tools';
import * as swagger from '../dist/lib/protoc-gen-swagger';
import * as apis from 'google-proto-files';
import { resolve } from 'path';

swagger.fromProto({
    includeDirs: [
        resolve('./test/protos')
    ],
    files: ['product.proto'],
    outDir: resolve(__dirname, 'generated')
});

tools.protoc({
    includeDirs: [
        resolve(apis.getProtoPath(), '..'),
        resolve('./test/protos')
    ],
    files: ['product.proto'],
    outDir: resolve(__dirname, 'generated'),
    outOptions: [
        swagger.createSwaggerOptions({ outOptions: 'logtostderr=true'}),
        tools.generators.js(),
    ]
});