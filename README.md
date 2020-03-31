# @accility/protoc-swagger-plugin

Generate [OpenAPI v2 (Swagger)](https://github.com/OAI/OpenAPI-Specification/blob/master/versions/2.0.md) files from [.proto](https://developers.google.com/protocol-buffers) files.

This package includes the [protoc-gen-swagger plugin](https://github.com/grpc-ecosystem/grpc-gateway/releases) from the [grpc-gateway](https://github.com/grpc-ecosystem/grpc-gateway) project.
It also makes available the collection of the [google common protos](https://github.com/googleapis/api-common-protos.git).

## Installing

```bash
npm install -D @accility/protoc-tools
```

## Usage

```javascript
const protoc = require('@accility/protoc-tools');
const swagger = require('@accility/protoc-swagger-plugin');
const apis = require('google-proto-files');
const path = require('path');

protoc({
    includeDirs: [
        path.resolve(apis.getProtoPath(), '..'),
        path.resolve('.')
    ],
    files: ['product.proto'],
    plugin: swagger.plugin
});
```

Or with the shorthand protoc-swagger-wrapper

```javascript
const swagger = require('@accility/protoc-swagger-plugin');
const path = require('path');

// The .proto-files from the package google-proto-files is automatically added
// to the include paths since we always need the REST annotations when
// converting from .proto to OpenApi.
swagger.fromProto({
    includeDirs: [path.resolve('./test/protos')],
    files: ['product.proto']
});
```


