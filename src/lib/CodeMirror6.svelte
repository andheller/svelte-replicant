<script>
	import { browser } from '$app/env';
	import { onMount, onDestroy } from 'svelte';
	import * as Y from 'yjs';
	import { yCollab, yUndoManagerKeymap } from 'y-codemirror.next';
	import { WebrtcProvider } from 'y-webrtc';

	import { EditorView, basicSetup } from 'codemirror';
	import { keymap } from '@codemirror/view';
	import { javascript } from '@codemirror/lang-javascript';
	import { html } from '@codemirror/lang-html';
	// import { oneDark } from '@codemirror/next/theme-one-dark'

	// import * as random from 'lib0/random';
	import { EditorState } from '@codemirror/state';

	// import { onMount, createEventDispatcher } from 'svelte';

	let editor, view, ydoc, state, provider, ytext, cm;
	export let update_component_source;
	export let text = '';
	export const userColor = { color: '#30bced', light: '#30bced33' };

	// export const userColor = usercolors[random.uint32() % usercolors.length];

	//$: create_codemirror(text);
	// $: text = global_text;

	onMount(() => {
		if (provider) provider.destroy();
		create_codemirror(text);
	});
	onDestroy(() => {
		if (view) view.destroy();
		if (provider) provider.destroy();
	});
	function create_codemirror(text) {
		if (!browser) return;
		if (view) view.destroy();
		if (provider) provider.destroy();
		if (ydoc) ydoc.destroy();

		if (editor) {
			ydoc = new Y.Doc();

			// provider = new WebrtcProvider(uuid, ydoc);
			// provider.awareness.setLocalStateField('user', {
			// 	name: 'Anonymous ' + Math.floor(Math.random() * 100),
			// 	color: userColor.color,
			// 	colorLight: userColor.light
			// });

			ytext = ydoc.getText('codemirror');

			state = EditorState.create({
				doc: text,
				// doc: ytext.toString(),
				extensions: [
					keymap.of([...yUndoManagerKeymap]),
					basicSetup,
					html(),
					EditorView.lineWrapping,
					EditorView.updateListener.of((e) => {
						if (e.docChanged) {
							update_component_source(e.state.doc.toString());
						}
					})
					// yCollab(ytext, provider.awareness),
					// oneDark
					// EditorView.updateListener.of(() => {
					// 	ytext = ytext;
					// 	console.log(ytext.toString());
					// })
					// // EditorView.updateListener.of(() => {
					// 	ytext = ytext;
					// 	global_text = ytext.toString();
					// 	console.log(text);
					// })
				]
			});

			view = new EditorView({
				state,
				parent: editor
			});
		}
	}

	export function update_editor_source(new_source) {
		view.setState(
			EditorState.create({
				doc: new_source,
				// doc: ytext.toString(),
				extensions: [
					keymap.of([...yUndoManagerKeymap]),
					basicSetup,
					html(),
					EditorView.lineWrapping,
					EditorView.updateListener.of((e) => {
						if (e.docChanged) {
							update_component_source(e.state.doc.toString());
						}
					})
					// yCollab(ytext, provider.awareness),
					// oneDark
					// EditorView.updateListener.of(() => {
					// 	ytext = ytext;
					// 	console.log(ytext.toString());
					// })
					// // EditorView.updateListener.of(() => {
					// 	ytext = ytext;
					// 	global_text = ytext.toString();
					// 	console.log(text);
					// })
				]
			})
		);

		if (!editor) return;
		// if (state) state.update({ changes: { from: 0, to: state.doc.length, insert: new_source } });

		// if (editor) {
		// 	const { left, top } = editor.getScrollInfo();
		// 	editor.setValue((code = new_code));
		// 	editor.scrollTo(left, top);
		// }
	}
</script>

<div bind:this={editor} class="grow" />
<button on:click={() => update_editor_source('')}>update Source</button>
