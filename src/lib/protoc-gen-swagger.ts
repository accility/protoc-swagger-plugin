import { ProtocOptions, protoc, OutputOptions, createGeneratorOptions, GeneratorOptions} from '@accility/protoc-tools';
import * as apis from 'google-proto-files';
import { resolve } from 'path';

const extension = process.platform === 'win32' ? '.exe' : '';
export function fromProto(options: ProtocOptions) : Promise<void> {
  options.includeDirs.push(resolve(apis.getProtoPath(), '..'));
  options.outOptions = [createSwaggerOptions()];
  return protoc(options);
}

export function createSwaggerOptions({outPath = undefined, outOptions = undefined}: GeneratorOptions = {}): OutputOptions {
   return {
      name: 'swagger',
      pluginPath: resolve(__dirname, '../../native/bin', process.platform, process.arch, 'protoc-gen-swagger' + extension),
      outPath,
      outOptions
    }
};
