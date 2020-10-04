import { ProtocOptions, protoc } from '@accility/protoc-tools';
import * as apis from 'google-proto-files';
import * as path from 'path';
import * as os from 'os';

const extension = os.platform().toLowerCase() === 'win32' ? '.exe' : '';
export function fromProto(options: ProtocOptions): Promise<void> {
	options.includeDirs.push(path.resolve(apis.getProtoPath(), '..'));
	options.plugin = plugin;
	return protoc(options);
}

export const plugin = {
	name: 'swagger',
	path: path.resolve(__dirname, '../../native/bin', os.platform().toLowerCase(), os.arch().toLowerCase(), 'protoc-gen-swagger' + extension),
}
