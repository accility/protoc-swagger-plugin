import * as fs from 'fs'
import * as path from 'path'
import { Octokit } from '@octokit/core'
import { resolve } from 'path'

const octokit = new Octokit()

/**
 * Gets path to binary.
 * 
 * @param tag Optional release tag. E.g. `v1.15.0`
 */
export function getBinPath(tag?: string): string | undefined {
	let binpath = tag ? path.join(__dirname, '../..', `bin/bin_${tag}`) : path.join(__dirname, '../..', `bin/bin_current`)
	let exists = fs.existsSync(binpath)

	if (exists)
		return binpath
	else {
		binpath = tag ? path.join(__dirname, '../..', `bin/bin_${tag}.exe`) : path.join(__dirname, '../..', `bin/bin_current.exe`)
		exists = fs.existsSync(binpath)

		if (exists)
			return binpath
	}

	return undefined
}

/**
 * Gets path to binary asynchronously.
 * 
 * @param tag Optional release tag. E.g. `v1.15.0`
 */
export async function getBinPathAsync(tag?: string): Promise<string | undefined>
export async function getBinPathAsync(_tag?: string) {
	const tag = _tag ?? await getLatestTagAsync()
	return new Promise<string | undefined>(resolve => {
		let binpath = path.join(__dirname, '../..', `bin/bin_${tag}`)

		fs.access(binpath, (err) => {
			if (err) {
				binpath = path.join(__dirname, '../..', `bin/bin_${tag}.exe`)
				fs.access(binpath, (err) => {
					if (err)
						resolve(undefined)
					resolve(binpath)
				})
			} else
				resolve(binpath)
		})
	})
}

async function getLatestTagAsync() {
	const release = (await octokit.request('GET /repos/{owner}/{repo}/releases/latest', {
		owner: 'grpc-ecosystem',
		repo: 'grpc-gateway'
	})).data

	return release.tag_name
}

/**
 * Downloads a release binary for the current os using `@octokit/core` asynchronously.
 * 
 * @param tag Optional release tag. E.g. `v1.15.0`
 */
export async function downloadAsync(tag?: string) {
	const data = tag ?
		(await octokit.request('GET /repos/{owner}/{repo}/releases/tags/{tag}', {
			owner: 'grpc-ecosystem',
			repo: 'grpc-gateway',
			tag
		})).data :
		// Find the latest non-pre-release
		(await octokit.request('GET /repos/{owner}/{repo}/releases', {
			owner: 'grpc-ecosystem',
			repo: 'grpc-gateway'
		})).data.find((release: any) => !release.prerelease)

	const release = data

	let platform: 'darwin' | 'linux' | 'windows'

	if (process.platform === 'win32')
		platform = 'windows'
	else if (process.platform === 'linux' || process.platform === 'darwin')
		platform = process.platform
	else
		throw new Error('There is no compatible binary for your os.')

	if (release.assets.length <= 0)
		throw new Error('There were no attached assets to the choosen release. You will have to manually download the binaries.')

	const asset = release.assets.find((asset: any) => new RegExp(`^protoc-gen-(?:openapi|swagger).+${platform}-x86_64(?:\.exe$|$)`).test(asset.name))

	if (!asset)
		throw new Error(`There is no compatible download with release tag '${tag}' for your os.\nThis should not have happened, contact the software publisher.`)

	const bin = Buffer.from((await octokit.request(asset.browser_download_url)).data)

	return new Promise<{ bin: Buffer, tag: string, exe: boolean }>((resolve, reject) => {
		fs.access(path.join(__dirname, '../../bin'), (err) => {
			const write = () => {
				const res = () => resolve({ bin, tag: release.tag_name, exe: platform === 'windows' })

				if (!tag)
					// TODO: Write a path to the latest bin file instead of writing it twice.
					fs.writeFile(path.join(__dirname, '../..', 'bin/bin_current' + (platform === 'windows' ? '.exe' : '')), bin, (err) => {
						if (err) reject(err)
						res()
					})
				else
					res()
			}

			if (err)
				fs.mkdir(path.join(__dirname, '../../bin'), (err) => {
					if (err) reject(err)
					write()
				})
			else
				write()
		})
	})
}

/**
 * Installs the specified binary. Returns path to the binary.
 * 
 * Can be used in combination with `downloadAsync()`
 * 
 * @param bin Buffer with the binary
 * @param tag Release tag
 * @param exe Whether the binary is .exe
 * 
 * @example
 * ```typescript
 * install(await downloadAsync(tag))
 * ```
 */
export function install(bin: Buffer, tag: string, exe: string): string
export function install(bin: { bin: Buffer, tag: string, exe: boolean }): string
export function install(...args: any[]): string {
	const [_bin, _tag, _exe] = args as [Buffer | { bin: Buffer, tag: string, exe: boolean }, string | undefined, boolean | undefined]

	const tag = ('bin' in _bin ? _bin.tag : _tag) ?? ''
	const bin = ('bin' in _bin ? _bin.bin : _bin) ?? ''
	const exe = ('bin' in _bin ? _bin.exe : _exe) ?? false

	const filename = 'bin/bin_' + tag + (exe ? '.exe' : '')

	if (!fs.existsSync(path.join(__dirname, '../../bin')))
		fs.mkdirSync(path.join(__dirname, '../../bin'))

	fs.writeFileSync(path.join(__dirname, '../..', filename), bin)

	return path.join(__dirname, '../..', filename)
}

/**
 * Installs the specified binary asynchronously. Returns path to the binary.
 * 
 * Can be used in combination with `downloadAsync()`
 * 
 * @param bin Buffer with the binary
 * @param tag Release tag
 * @param exe Whether the binary is .exe
 * 
 * @example
 * ```typescript
 * await installAsync(await downloadAsync(tag))
 * ```
 */
export function installAsync(bin: Buffer, tag: string, exe: string): Promise<string>
export function installAsync(bin: { bin: Buffer, tag: string, exe: boolean }): Promise<string>
export function installAsync(...args: any[]) {
	const [_bin, _tag, _exe] = args as [Buffer | { bin: Buffer, tag: string, exe: boolean }, string | undefined, boolean | undefined]

	const tag = ('bin' in _bin ? _bin.tag : _tag) ?? ''
	const bin = ('bin' in _bin ? _bin.bin : _bin) ?? ''
	const exe = ('bin' in _bin ? _bin.exe : _exe) ?? false

	const filename = 'bin/bin_' + tag + (exe ? '.exe' : '')

	return new Promise<string>((resolve, reject) => {

		fs.access(path.join(__dirname, '../../bin'), (err) => {
			const write = () =>
				fs.writeFile(path.join(__dirname, '../..', filename), bin, (err) => {
					if (err)
						return reject(err)
					resolve(path.join(__dirname, '../..', filename))
				})

			if (err)
				fs.mkdir(path.join(__dirname, '../../bin'), (err) => {
					if (err) reject(err)
					write()
				})
			else
				write()
		})
	})
}

/**
 * Gets path to binary. Same as `getBinPath()` without the tags parameter.
 */
export function latestBin() {
	return getBinPath()
}

async function main(tag?: string) {
	if (tag)
		console.log(`Installing grpc-gateway protoc-gen-openapi ${tag}...`)
	else
		console.log(`Installing the latest grpc-gateway protoc-gen-openapi release...`)
	install(await downloadAsync(tag))
}

// If run by node cli, execute main
if (require.main === module)
	main(process.env['RELEASETAG'])
