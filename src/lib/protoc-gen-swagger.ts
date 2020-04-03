import { ProtocOptions, protoc } from '@accility/protoc-tools';
import * as apis from 'google-proto-files';
import * as path from 'path';

const extension = process.platform === 'win32' ? '.exe' : '';
export function fromProto(options: ProtocOptions) : Promise<void> {
  options.includeDirs.push(path.resolve(apis.getProtoPath(), '..'));
  options.plugin = plugin;
  return protoc(options);
}

export const plugin = {
    name: 'swagger',
    path: path.resolve(__dirname, '../../native/bin', process.platform, process.arch, 'protoc-gen-swagger' + extension),
}