<script>
	import { getContext } from 'svelte';
	import { parse } from 'marked';
	import Viewer from './Viewer.svelte';
	import PaneWithPanel from './PaneWithPanel.svelte';
	import CompilerOptions from './CompilerOptions.svelte';
	import Compiler from './Compiler.js';
	import CodeMirror from '../CodeMirror.svelte';
	import AstView from './AstView.svelte';
	import { is_browser } from '../env.js';

	const { register_output, module_editor_ready } = getContext('REPL');

	export let svelteUrl;
	export let status;
	export let runtimeError = null;
	export let relaxed = false;
	export let injectedJS;
	export let injectedCSS;
	export let theme;

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

			const compiled = await compiler.compile(selected, options);
			if (!js_editor) return; // unmounted

			js_editor.set(compiled.js, 'js');
			css_editor.set(compiled.css, 'css');
			ast = compiled.ast;
		},

		update: async (selected, options) => {
			if (selected.type === 'js' || selected.type === 'json') return;

			if (selected.type === 'md') {
				markdown = parse(selected.source);
				return;
			}

			const compiled = await compiler.compile(selected, options);
			if (!js_editor) return; // unmounted

			js_editor.update(compiled.js);
			css_editor.update(compiled.css);
			ast = compiled.ast;
		}
	});

	const compiler = is_browser && new Compiler(svelteUrl);

	// refs
	let js_editor;
	let css_editor;

	let view = 'result';
	let selected_type = '';
</script>

<!-- component viewer -->
<div class="tab-content" class:visible={selected_type !== 'md' && view === 'result'}>
	<Viewer bind:error={runtimeError} {status} {relaxed} {injectedJS} {injectedCSS} />
</div>
