import { ProtocOptions, protoc } from '@accility/protoc-tools';
import * as apis from 'google-proto-files';
import * as path from 'path';

const extension = process.platform === 'win32' ? '.exe' : '';

interface SwaggerOptions extends ProtocOptions {
	binPath?: string
}

export function fromProto(options: SwaggerOptions): Promise<void> {
	options.includeDirs.push(path.resolve(apis.getProtoPath(), '..'));
	options.plugin = plugin(options.binPath)
	return protoc(options);
}

export function plugin(binPath?: string) {
	return {
		name: 'swagger',
		path: binPath ?? path.join(__dirname, '../..', 'native/bin_current' + extension)
	}
}

export * from './installer'