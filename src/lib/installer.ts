import * as fs from 'fs'
import * as path from 'path'
import { Octokit } from '@octokit/core'
import { resolve } from 'path'

const octokit = new Octokit()

/**
 * Gets path to binary.
 * 
 * @param tag Optional release tag.
 */
export function getBinPath(tag?: string): { exists: boolean, path: string | undefined, exe: boolean | undefined } {
	let _path = tag ? path.join(__dirname, '../..', `bin/bin${tag}`) : path.join(__dirname, '../..', `bin/bin_current`)
	let exists = fs.existsSync(_path)

	if (exists)
		return { exists, path: _path, exe: false }
	else {
		_path = tag ? path.join(__dirname, '../..', `bin/bin${tag}.exe`) : path.join(__dirname, '../..', `bin/bin_current.exe`)
		exists = fs.existsSync(_path)

		if (exists)
			return { exists, path: _path, exe: true }
	}

	return { exists: false, path: undefined, exe: undefined }
}

/**
 * Gets path to binary asynchronously.
 * 
 * @param tag Optional release tag.
 */
export async function getBinPathAsync(tag?: string): Promise<{ exists: boolean, path: string | undefined, exe: boolean | undefined }>
export async function getBinPathAsync(_tag?: string) {
	const tag = _tag ?? await getLatestTagAsync()
	return new Promise<{ exists: boolean, path: string | undefined, exe: boolean | undefined }>(resolve => {
		let filepath = path.join(__dirname, '../..', `bin/bin${tag}`)

		fs.access(filepath, (err) => {
			if (err) {
				filepath = path.join(__dirname, '../..', `bin/bin${tag}.exe`)
				fs.access(filepath, (err) => {
					if (err)
						resolve({ exists: false, path: undefined, exe: undefined })
					resolve({ exists: true, path: filepath, exe: true })
				})
			} else
				resolve({ exists: true, path: filepath, exe: false })
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
 * @param tag Optional release tag.
 */
export async function downloadAsync(tag?: string) {
	const { data } = tag ?
		await octokit.request('GET /repos/{owner}/{repo}/releases/tags/{tag}', {
			owner: 'grpc-ecosystem',
			repo: 'grpc-gateway',
			tag
		}) :
		await octokit.request('GET /repos/{owner}/{repo}/releases/latest', {
			owner: 'grpc-ecosystem',
			repo: 'grpc-gateway'
		})

	const release = data

	let platform: 'darwin' | 'linux' | 'windows'

	if (process.platform === 'win32')
		platform = 'windows'
	else if (process.platform === 'linux' || process.platform === 'darwin')
		platform = process.platform
	else
		throw new Error('There is no compatible binary for your os.')

	const asset = release.assets.find((asset: any) => new RegExp(`^protoc-gen-openapiv[0-9]-v[0-9\\.]+?-${platform}-x86_64(?:\\.exe|)$`).test(asset.name))

	if (!asset)
		throw new Error('There is no compatible download for your os.\nThis should not have happened, contact the software publisher.')

	const bin = Buffer.from((await octokit.request(asset.browser_download_url)).data)

	return new Promise<{ bin: Buffer, tag: string, exe: boolean }>((resolve, reject) => {
		fs.access(path.join(__dirname, '../../bin'), (err) => {
			const write = () =>
				fs.writeFile(path.join(__dirname, '../..', 'bin/bin_current' + (platform === 'windows' ? '.exe' : '')), bin, (err) => {
					if (err) reject(err)

					resolve({ bin, tag: release.tag_name, exe: platform === 'windows' })
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

	const filename = 'bin/bin' + tag + (exe ? '.exe' : '')

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

	const filename = 'bin/bin' + tag + (exe ? '.exe' : '')

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
export function latest() {
	return getBinPath()
}

async function main(tag?: string) {
	install(await downloadAsync(tag))
}

// If run by node, execute main
if (require.main === module)
	// Pass the second argument as tag to main
	main(process.argv[2])
