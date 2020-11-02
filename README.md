# Protocol Buffer to OpenApi

**⚠️ This package is still in early days and the interfaces might change back and forth. When stable enough it will be released as v1.0.**

Generate [OpenAPI v2 and v3 (Swagger)](https://github.com/OAI/OpenAPI-Specification/blob/master/versions) files from [.proto](https://developers.google.com/protocol-buffers) files.

This package downloads the [protoc-gen-swagger plugin](https://github.com/grpc-ecosystem/grpc-gateway/releases) from the [grpc-gateway](https://github.com/grpc-ecosystem/grpc-gateway) project via [octokit/core](https://github.com/octokit/core.js).
It also makes available the collection of the [google common protos](https://github.com/googleapis/api-common-protos.git).

## Installing

Installing @accility/protoc-tools with the latest available non-pre-release of grpc-gateway/protoc-gen-openapi.
```bash
npm install -D @accility/protoc-tools
```

### Installing a release of the openapi generator
Settings version of grpc-gateway/protoc-gen-openapi to `v1.15.0`.
**Only works with `>=1.5.1`!**

```bash
# PowerShell
$env:RELEASETAG="v1.15.0"
npm install -D @accility/protoc-tools
# CMD
set RELEASETAG="v1.15.0"
npm install -D @accility/protoc-tools
# Unix
RELEASETAG="v1.15.0" npm install -D @accility/protoc-tools
```

## Usage

### Basic usage

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

### The shorthand protoc-swagger-wrapper

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

### Installing a release with the API

**[Make sure you know how to install a release of grpc-gateway/protoc-gen-openapi via npm before continuing!](#installing-a-release-of-the-openapi-generator) Only works with `>=1.5.1`!**

```javascript
const swagger = require('../dist/lib/protoc-gen-swagger');
const apis = require('google-proto-files');
const path = require('path');

async function main() {
	let tag = 'v1.5.1'
	let release = swagger.getBinPath(tag)
	
	if (!release.exists) {
		swagger.install(await swagger.downloadAsync('v1.5.1'))
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
