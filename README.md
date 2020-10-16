# .proto to OpenApi Conversion

⚠️ This package is still in early days and the interfaces might change back and forth. When stable enough it will be released as v1.0.

Generate [OpenAPI v2 and v3 (Swagger)](https://github.com/OAI/OpenAPI-Specification/blob/master/versions) files from [.proto](https://developers.google.com/protocol-buffers) files.

This package downloads the [protoc-gen-swagger plugin](https://github.com/grpc-ecosystem/grpc-gateway/releases) from the [grpc-gateway](https://github.com/grpc-ecosystem/grpc-gateway) project via [octokit/core](https://github.com/octokit/core.js).
It also makes available the collection of the [google common protos](https://github.com/googleapis/api-common-protos.git).

## Installing

```bash
npm install -D @accility/protoc-tools
```

## Usage

Basic usage with [@accility/protoc-tools](https://github.com/accility/protoc-tools).

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

With the shorthand protoc-swagger-wrapper

```javascript
const swagger = require('../dist/lib/protoc-gen-swagger');
const apis = require('google-proto-files');
const path = require('path');

await swagger.fromProto({
	includeDirs: [
		// The .proto-files from the package google-proto-files is automatically added
		// to the include paths since we always need the REST annotations when
		// converting from .proto to OpenApi.
		path.resolve(apis.getProtoPath(), '..'),
		path.resolve('./test/protos')
	],
	files: ['product.proto'],
	outOptions: 'logtostderr=true:' + path.resolve(__dirname, 'generated')
});

```

Specifying a custom release binary of grpc-gateway

```javascript
const swagger = require('../dist/lib/protoc-gen-swagger');
const apis = require('google-proto-files');
const path = require('path');

async function main() {
	let tag = 'v1.0.0'
	let release = swagger.getBinPath(tag)
	
	if (!release.exists) {
		swagger.install(await swagger.downloadAsync('v1.0.0'))
		release = swagger.getBinPath(tag)
	}
	
	swagger.fromProto({
		includeDirs: [
			path.resolve(apis.getProtoPath(), '..'),
			path.resolve('./test/protos')
		],
		files: ['product.proto'],
		outOptions: 'logtostderr=true:' + path.resolve(__dirname, 'generated'),
		binPath: release.path
	});
}

main()
```
