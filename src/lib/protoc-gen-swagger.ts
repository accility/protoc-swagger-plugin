import { ProtocOptions, protoc } from '@accility/protoc-tools';
import * as apis from 'google-proto-files';
import * as path from 'path';
import { latestBin } from './installer';

interface SwaggerOptions extends ProtocOptions {
	binPath?: string
}

export function fromProto(options: SwaggerOptions) {
	options.includeDirs.push(path.resolve(apis.getProtoPath(), '..'));
	options.plugin = plugin(options.binPath)
	return protoc(options);
}

export function plugin(binPath?: string) {
	const latest = latestBin()

	if (!latest)
		throw new Error('Latest binary was not found. Install the latest binary or specify a custom binary path.')

	return {
		name: 'swagger',
		path: binPath ?? latest
	}
}

export * from './installer'