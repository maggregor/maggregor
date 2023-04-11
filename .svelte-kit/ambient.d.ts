
// this file is generated — do not edit it


/// <reference types="@sveltejs/kit" />

/**
 * Environment variables [loaded by Vite](https://vitejs.dev/guide/env-and-mode.html#env-files) from `.env` files and `process.env`. Like [`$env/dynamic/private`](https://kit.svelte.dev/docs/modules#$env-dynamic-private), this module cannot be imported into client-side code. This module only includes variables that _do not_ begin with [`config.kit.env.publicPrefix`](https://kit.svelte.dev/docs/configuration#env).
 * 
 * _Unlike_ [`$env/dynamic/private`](https://kit.svelte.dev/docs/modules#$env-dynamic-private), the values exported from this module are statically injected into your bundle at build time, enabling optimisations like dead code elimination.
 * 
 * ```ts
 * import { API_KEY } from '$env/static/private';
 * ```
 * 
 * Note that all environment variables referenced in your code should be declared (for example in an `.env` file), even if they don't have a value until the app is deployed:
 * 
 * ```
 * MY_FEATURE_FLAG=""
 * ```
 * 
 * You can override `.env` values from the command line like so:
 * 
 * ```bash
 * MY_FEATURE_FLAG="enabled" npm run dev
 * ```
 */
declare module '$env/static/private' {
	export const PROXY_HOST: string;
	export const PROXY_PORT: string;
	export const HTTP_HOST: string;
	export const HTTP_PORT: string;
	export const MONGODB_TARGET_URI: string;
	export const MONGODB_BACKEND_URI: string;
	export const npm_package_devDependencies__fontsource_fira_mono: string;
	export const NVM_INC: string;
	export const npm_package_scripts_test_e2e: string;
	export const npm_package_devDependencies_prettier: string;
	export const LDFLAGS: string;
	export const npm_package_dependencies__nestjs_swagger: string;
	export const npm_package_dependencies_mongoose: string;
	export const npm_package_dependencies_ts_pegjs: string;
	export const npm_package_scripts_parser_generate: string;
	export const npm_package_scripts_preview_ui: string;
	export const npm_package_dependencies_object_sizeof: string;
	export const TERM_PROGRAM: string;
	export const npm_package_scripts_test_unit_coverage: string;
	export const NODE: string;
	export const npm_config_version_git_tag: string;
	export const npm_package_devDependencies__nestjs_testing: string;
	export const npm_package_devDependencies_typescript: string;
	export const NVM_CD_FLAGS: string;
	export const INIT_CWD: string;
	export const npm_package_dependencies_nuxt_vitest: string;
	export const npm_package_devDependencies_vite: string;
	export const TERM: string;
	export const SHELL: string;
	export const npm_package_dependencies_bson: string;
	export const npm_package_devDependencies__types_cookie: string;
	export const CPPFLAGS: string;
	export const TMPDIR: string;
	export const npm_config_email: string;
	export const npm_config_init_license: string;
	export const npm_package_scripts_test_integration_watch: string;
	export const npm_package_dependencies_joi: string;
	export const npm_package_devDependencies_supertest: string;
	export const GOOGLE_APPLICATION_CREDENTIALS: string;
	export const npm_package_devDependencies_mongodb_memory_server: string;
	export const TERM_PROGRAM_VERSION: string;
	export const ZDOTDIR: string;
	export const ORIGINAL_XDG_CURRENT_DESKTOP: string;
	export const MallocNanoZone: string;
	export const npm_package_scripts_test_e2e_watch: string;
	export const npm_package_dependencies__nestjs_mongoose: string;
	export const npm_config_registry: string;
	export const npm_package_devDependencies__sveltejs_kit: string;
	export const npm_package_scripts_start_ui: string;
	export const npm_package_scripts_build_ui: string;
	export const PNPM_HOME: string;
	export const ZSH: string;
	export const npm_package_devDependencies_tsconfig_paths: string;
	export const npm_package_readmeFilename: string;
	export const npm_package_description: string;
	export const NVM_DIR: string;
	export const USER: string;
	export const npm_package_license: string;
	export const npm_package_scripts_start_dev: string;
	export const npm_package_scripts_check_watch: string;
	export const npm_package_devDependencies__sachinraja_eslint_config: string;
	export const npm_package_devDependencies_dotenv: string;
	export const COMMAND_MODE: string;
	export const npm_package_devDependencies__vitest_coverage_c8: string;
	export const npm_package_dependencies_lodash: string;
	export const SSH_AUTH_SOCK: string;
	export const npm_package_devDependencies__nestjs_platform_fastify: string;
	export const npm_package_devDependencies__types_express: string;
	export const npm_package_devDependencies_eslint: string;
	export const __CF_USER_TEXT_ENCODING: string;
	export const npm_package_devDependencies__typescript_eslint_eslint_plugin: string;
	export const npm_package_devDependencies_tslib: string;
	export const npm_execpath: string;
	export const npm_package_devDependencies_svelte: string;
	export const PAGER: string;
	export const npm_package_dependencies_nuxt_lodash: string;
	export const npm_package_devDependencies__types_supertest: string;
	export const npm_package_devDependencies_unplugin_auto_import: string;
	export const npm_package_devDependencies_eslint_plugin_prettier: string;
	export const npm_package_devDependencies_wait_port: string;
	export const LSCOLORS: string;
	export const npm_package_devDependencies__typescript_eslint_parser: string;
	export const npm_config_argv: string;
	export const PATH: string;
	export const npm_package_dependencies__vueuse_nuxt: string;
	export const npm_package_devDependencies__nestjs_cli: string;
	export const npm_package_devDependencies__neoconfetti_svelte: string;
	export const USER_ZDOTDIR: string;
	export const __CFBundleIdentifier: string;
	export const npm_package_dependencies_mongodb: string;
	export const npm_package_devDependencies_npm_run_all: string;
	export const JENV_LOADED: string;
	export const PWD: string;
	export const npm_package_scripts_preview: string;
	export const npm_lifecycle_event: string;
	export const npm_package_name: string;
	export const npm_package_devDependencies_source_map_support: string;
	export const LANG: string;
	export const npm_package_scripts_test_integration: string;
	export const npm_config_version_commit_hooks: string;
	export const npm_package_scripts_start: string;
	export const npm_package_scripts_build: string;
	export const npm_package_dependencies_rxjs: string;
	export const NODE_PATH: string;
	export const npm_config_username: string;
	export const npm_package_dependencies__nestjs_core: string;
	export const npm_package_devDependencies_ts_loader: string;
	export const npm_package_devDependencies_vitest: string;
	export const VSCODE_GIT_ASKPASS_EXTRA_ARGS: string;
	export const XPC_FLAGS: string;
	export const npm_config_bin_links: string;
	export const npm_package_dependencies__nestjs_common: string;
	export const npm_package_devDependencies_eslint_config_prettier: string;
	export const npm_package_version: string;
	export const npm_package_devDependencies__sveltejs_adapter_auto: string;
	export const XPC_SERVICE_NAME: string;
	export const npm_package_devDependencies_svelte_check: string;
	export const VSCODE_INJECTION: string;
	export const npm_package_type: string;
	export const npm_package_devDependencies__nestjs_schematics: string;
	export const SHLVL: string;
	export const HOME: string;
	export const VSCODE_GIT_ASKPASS_MAIN: string;
	export const npm_config_strict_ssl: string;
	export const npm_config_save_prefix: string;
	export const npm_config_version_git_message: string;
	export const npm_package_devDependencies_vitest_mock_extended: string;
	export const npm_package_dependencies__fortawesome_fontawesome_free: string;
	export const npm_package_devDependencies_ts_node: string;
	export const YARN_WRAP_OUTPUT: string;
	export const LESS: string;
	export const LOGNAME: string;
	export const npm_package_dependencies__nestjs_config: string;
	export const npm_package_dependencies_reflect_metadata: string;
	export const npm_lifecycle_script: string;
	export const JENV_SHELL: string;
	export const npm_package_devDependencies_dprint: string;
	export const VSCODE_GIT_IPC_HANDLE: string;
	export const npm_package_scripts_test_unit_watch: string;
	export const npm_package_dependencies_crc_32: string;
	export const npm_package_dependencies_peggy: string;
	export const NVM_BIN: string;
	export const BUN_INSTALL: string;
	export const JWT_TOKEN_ACHILIO: string;
	export const npm_config_user_agent: string;
	export const npm_config_ignore_scripts: string;
	export const npm_config_version_git_sign: string;
	export const npm_package_devDependencies__types_node: string;
	export const VSCODE_GIT_ASKPASS_NODE: string;
	export const GIT_ASKPASS: string;
	export const npm_package_dependencies__nestjs_platform_express: string;
	export const npm_config_ignore_optional: string;
	export const npm_config_init_version: string;
	export const npm_package_scripts_check: string;
	export const npm_package_scripts_test_all: string;
	export const npm_config_version_tag_prefix: string;
	export const npm_package_scripts_test_unit: string;
	export const npm_node_execpath: string;
	export const COLORTERM: string;
	export const NODE_ENV: string;
}

/**
 * Similar to [`$env/static/private`](https://kit.svelte.dev/docs/modules#$env-static-private), except that it only includes environment variables that begin with [`config.kit.env.publicPrefix`](https://kit.svelte.dev/docs/configuration#env) (which defaults to `PUBLIC_`), and can therefore safely be exposed to client-side code.
 * 
 * Values are replaced statically at build time.
 * 
 * ```ts
 * import { PUBLIC_BASE_URL } from '$env/static/public';
 * ```
 */
declare module '$env/static/public' {

}

/**
 * This module provides access to runtime environment variables, as defined by the platform you're running on. For example if you're using [`adapter-node`](https://github.com/sveltejs/kit/tree/master/packages/adapter-node) (or running [`vite preview`](https://kit.svelte.dev/docs/cli)), this is equivalent to `process.env`. This module only includes variables that _do not_ begin with [`config.kit.env.publicPrefix`](https://kit.svelte.dev/docs/configuration#env).
 * 
 * This module cannot be imported into client-side code.
 * 
 * ```ts
 * import { env } from '$env/dynamic/private';
 * console.log(env.DEPLOYMENT_SPECIFIC_VARIABLE);
 * ```
 * 
 * > In `dev`, `$env/dynamic` always includes environment variables from `.env`. In `prod`, this behavior will depend on your adapter.
 */
declare module '$env/dynamic/private' {
	export const env: {
		PROXY_HOST: string;
		PROXY_PORT: string;
		HTTP_HOST: string;
		HTTP_PORT: string;
		MONGODB_TARGET_URI: string;
		MONGODB_BACKEND_URI: string;
		npm_package_devDependencies__fontsource_fira_mono: string;
		NVM_INC: string;
		npm_package_scripts_test_e2e: string;
		npm_package_devDependencies_prettier: string;
		LDFLAGS: string;
		npm_package_dependencies__nestjs_swagger: string;
		npm_package_dependencies_mongoose: string;
		npm_package_dependencies_ts_pegjs: string;
		npm_package_scripts_parser_generate: string;
		npm_package_scripts_preview_ui: string;
		npm_package_dependencies_object_sizeof: string;
		TERM_PROGRAM: string;
		npm_package_scripts_test_unit_coverage: string;
		NODE: string;
		npm_config_version_git_tag: string;
		npm_package_devDependencies__nestjs_testing: string;
		npm_package_devDependencies_typescript: string;
		NVM_CD_FLAGS: string;
		INIT_CWD: string;
		npm_package_dependencies_nuxt_vitest: string;
		npm_package_devDependencies_vite: string;
		TERM: string;
		SHELL: string;
		npm_package_dependencies_bson: string;
		npm_package_devDependencies__types_cookie: string;
		CPPFLAGS: string;
		TMPDIR: string;
		npm_config_email: string;
		npm_config_init_license: string;
		npm_package_scripts_test_integration_watch: string;
		npm_package_dependencies_joi: string;
		npm_package_devDependencies_supertest: string;
		GOOGLE_APPLICATION_CREDENTIALS: string;
		npm_package_devDependencies_mongodb_memory_server: string;
		TERM_PROGRAM_VERSION: string;
		ZDOTDIR: string;
		ORIGINAL_XDG_CURRENT_DESKTOP: string;
		MallocNanoZone: string;
		npm_package_scripts_test_e2e_watch: string;
		npm_package_dependencies__nestjs_mongoose: string;
		npm_config_registry: string;
		npm_package_devDependencies__sveltejs_kit: string;
		npm_package_scripts_start_ui: string;
		npm_package_scripts_build_ui: string;
		PNPM_HOME: string;
		ZSH: string;
		npm_package_devDependencies_tsconfig_paths: string;
		npm_package_readmeFilename: string;
		npm_package_description: string;
		NVM_DIR: string;
		USER: string;
		npm_package_license: string;
		npm_package_scripts_start_dev: string;
		npm_package_scripts_check_watch: string;
		npm_package_devDependencies__sachinraja_eslint_config: string;
		npm_package_devDependencies_dotenv: string;
		COMMAND_MODE: string;
		npm_package_devDependencies__vitest_coverage_c8: string;
		npm_package_dependencies_lodash: string;
		SSH_AUTH_SOCK: string;
		npm_package_devDependencies__nestjs_platform_fastify: string;
		npm_package_devDependencies__types_express: string;
		npm_package_devDependencies_eslint: string;
		__CF_USER_TEXT_ENCODING: string;
		npm_package_devDependencies__typescript_eslint_eslint_plugin: string;
		npm_package_devDependencies_tslib: string;
		npm_execpath: string;
		npm_package_devDependencies_svelte: string;
		PAGER: string;
		npm_package_dependencies_nuxt_lodash: string;
		npm_package_devDependencies__types_supertest: string;
		npm_package_devDependencies_unplugin_auto_import: string;
		npm_package_devDependencies_eslint_plugin_prettier: string;
		npm_package_devDependencies_wait_port: string;
		LSCOLORS: string;
		npm_package_devDependencies__typescript_eslint_parser: string;
		npm_config_argv: string;
		PATH: string;
		npm_package_dependencies__vueuse_nuxt: string;
		npm_package_devDependencies__nestjs_cli: string;
		npm_package_devDependencies__neoconfetti_svelte: string;
		USER_ZDOTDIR: string;
		__CFBundleIdentifier: string;
		npm_package_dependencies_mongodb: string;
		npm_package_devDependencies_npm_run_all: string;
		JENV_LOADED: string;
		PWD: string;
		npm_package_scripts_preview: string;
		npm_lifecycle_event: string;
		npm_package_name: string;
		npm_package_devDependencies_source_map_support: string;
		LANG: string;
		npm_package_scripts_test_integration: string;
		npm_config_version_commit_hooks: string;
		npm_package_scripts_start: string;
		npm_package_scripts_build: string;
		npm_package_dependencies_rxjs: string;
		NODE_PATH: string;
		npm_config_username: string;
		npm_package_dependencies__nestjs_core: string;
		npm_package_devDependencies_ts_loader: string;
		npm_package_devDependencies_vitest: string;
		VSCODE_GIT_ASKPASS_EXTRA_ARGS: string;
		XPC_FLAGS: string;
		npm_config_bin_links: string;
		npm_package_dependencies__nestjs_common: string;
		npm_package_devDependencies_eslint_config_prettier: string;
		npm_package_version: string;
		npm_package_devDependencies__sveltejs_adapter_auto: string;
		XPC_SERVICE_NAME: string;
		npm_package_devDependencies_svelte_check: string;
		VSCODE_INJECTION: string;
		npm_package_type: string;
		npm_package_devDependencies__nestjs_schematics: string;
		SHLVL: string;
		HOME: string;
		VSCODE_GIT_ASKPASS_MAIN: string;
		npm_config_strict_ssl: string;
		npm_config_save_prefix: string;
		npm_config_version_git_message: string;
		npm_package_devDependencies_vitest_mock_extended: string;
		npm_package_dependencies__fortawesome_fontawesome_free: string;
		npm_package_devDependencies_ts_node: string;
		YARN_WRAP_OUTPUT: string;
		LESS: string;
		LOGNAME: string;
		npm_package_dependencies__nestjs_config: string;
		npm_package_dependencies_reflect_metadata: string;
		npm_lifecycle_script: string;
		JENV_SHELL: string;
		npm_package_devDependencies_dprint: string;
		VSCODE_GIT_IPC_HANDLE: string;
		npm_package_scripts_test_unit_watch: string;
		npm_package_dependencies_crc_32: string;
		npm_package_dependencies_peggy: string;
		NVM_BIN: string;
		BUN_INSTALL: string;
		JWT_TOKEN_ACHILIO: string;
		npm_config_user_agent: string;
		npm_config_ignore_scripts: string;
		npm_config_version_git_sign: string;
		npm_package_devDependencies__types_node: string;
		VSCODE_GIT_ASKPASS_NODE: string;
		GIT_ASKPASS: string;
		npm_package_dependencies__nestjs_platform_express: string;
		npm_config_ignore_optional: string;
		npm_config_init_version: string;
		npm_package_scripts_check: string;
		npm_package_scripts_test_all: string;
		npm_config_version_tag_prefix: string;
		npm_package_scripts_test_unit: string;
		npm_node_execpath: string;
		COLORTERM: string;
		NODE_ENV: string;
		[key: `PUBLIC_${string}`]: undefined;
		[key: string]: string | undefined;
	}
}

/**
 * Similar to [`$env/dynamic/private`](https://kit.svelte.dev/docs/modules#$env-dynamic-private), but only includes variables that begin with [`config.kit.env.publicPrefix`](https://kit.svelte.dev/docs/configuration#env) (which defaults to `PUBLIC_`), and can therefore safely be exposed to client-side code.
 * 
 * Note that public dynamic environment variables must all be sent from the server to the client, causing larger network requests — when possible, use `$env/static/public` instead.
 * 
 * ```ts
 * import { env } from '$env/dynamic/public';
 * console.log(env.PUBLIC_DEPLOYMENT_SPECIFIC_VARIABLE);
 * ```
 */
declare module '$env/dynamic/public' {
	export const env: {
		[key: `PUBLIC_${string}`]: string | undefined;
	}
}
