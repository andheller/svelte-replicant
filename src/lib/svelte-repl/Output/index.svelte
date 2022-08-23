<script>
	import { getContext } from 'svelte';
	// import { parse } from 'marked';
	import Viewer from './Viewer.svelte';
	import Compiler from './Compiler.js';
	import { browser } from '$app/env';

	const { register_output, module_editor_ready } = getContext('REPL');

	export let svelteUrl;
	export let status;
	export let runtimeError = null;
	export let relaxed = false;
	export let injectedJS;
	export let injectedCSS;
	export let showAst;

	register_output({
		set: async (selected, options) => {
			selected_type = selected.type;

			if (selected.type === 'js' || selected.type === 'json') {
				js_editor.set(`/* Select a component to see its compiled code */`);
				css_editor.set(`/* Select a component to see its compiled code */`);
				return;
			}

			if (selected.type === 'md') {
				markdown = parse(selected.source);
				return;
			}

			const compiled = await compiler.compile(selected, options, showAst);
			if (!js_editor) return; // unmounted

			js_editor.set(compiled.js, 'js');
			css_editor.set(compiled.css, 'css');
			ast = compiled.ast;
		},

		update: async (selected, options) => {
			if (selected.type === 'js' || selected.type === 'json') return;

			// if (selected.type === 'md') {
			// 	markdown = parse(selected.source);
			// 	return;
			// }

			const compiled = await compiler.compile(selected, options, showAst);
			if (!js_editor) return; // unmounted

			js_editor.update(compiled.js);
			css_editor.update(compiled.css);
			ast = compiled.ast;
		}
	});

	const compiler = browser && new Compiler(svelteUrl);

	// refs
	let js_editor;
	let css_editor;

	let view = 'result';
	let selected_type = '';
</script>

<div class="view-toggle">
	{#if selected_type === 'md'}
		<button class="active">Markdown</button>
	{:else}
		<button class:active={view === 'result'} on:click={() => (view = 'result')}>Result</button>
		<button class:active={view === 'js'} on:click={() => (view = 'js')}>JS output</button>
		<button class:active={view === 'css'} on:click={() => (view = 'css')}>CSS output</button>
		{#if showAst}
			<button class:active={view === 'ast'} on:click={() => (view = 'ast')}>AST output</button>
		{/if}
	{/if}
</div>

<Viewer bind:error={runtimeError} {status} {relaxed} {injectedJS} {injectedCSS} />

<!-- </div>

<div class="tab-content" class:visible={selected_type !== 'md' && view === 'js'}>
	{#if embedded}
		<CodeMirror bind:this={js_editor} errorLoc={sourceErrorLoc} {theme} readonly />
	{:else}
		<PaneWithPanel pos={67} panel="Compiler options">
			<div slot="main">
				<CodeMirror bind:this={js_editor} errorLoc={sourceErrorLoc} {theme} readonly />
			</div>

			<div slot="panel-body">
				<CompilerOptions />
			</div>
		</PaneWithPanel>
	{/if}
</div>

<div class="tab-content" class:visible={selected_type !== 'md' && view === 'css'}>
	<CodeMirror bind:this={css_editor} errorLoc={sourceErrorLoc} {theme} readonly />
</div>

	<div class="tab-content" class:visible={selected_type !== 'md' && view === 'ast'}>
		{#await module_editor_ready then}
			<AstView {ast} autoscroll={selected_type !== 'md' && view === 'ast'} />
		{/await}
	</div>
{/if}

<div class="tab-content" class:visible={selected_type === 'md'}>
	<iframe title="Markdown" srcdoc={markdown} />
</div> -->
