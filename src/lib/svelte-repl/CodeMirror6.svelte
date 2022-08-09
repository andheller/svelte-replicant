<script>
	import { browser } from '$app/env';
	import { onMount, onDestroy } from 'svelte';
	import * as Y from 'yjs';
	import { yCollab, yUndoManagerKeymap } from 'y-codemirror.next';
	import { WebrtcProvider } from 'y-webrtc';

	import { EditorView, basicSetup } from 'codemirror';
	import { keymap } from '@codemirror/view';
	import { javascript } from '@codemirror/lang-javascript';
	// import { oneDark } from '@codemirror/next/theme-one-dark'

	// import * as random from 'lib0/random';
	import { EditorState } from '@codemirror/state';

	// import { onMount, createEventDispatcher } from 'svelte';

	let editor, view, ydoc, state, provider, ytext;
	export const userColor = { color: '#30bced', light: '#30bced33' };
	// export const userColor = usercolors[random.uint32() % usercolors.length];

	let uuid = '7703377e-2913-41b8-827b-fafea31eb745';

	onMount(() => {
		if (!browser) return;
		if (view) return;
		if (editor) {
			ydoc = new Y.Doc();

			provider = new WebrtcProvider(uuid, ydoc);
			provider.awareness.setLocalStateField('user', {
				name: 'Anonymous ' + Math.floor(Math.random() * 100),
				color: userColor.color,
				colorLight: userColor.light
			});
			ytext = ydoc.getText('codemirror');

			state = EditorState.create({
				doc: ytext.toString(),
				extensions: [
					keymap.of([...yUndoManagerKeymap]),
					basicSetup,
					javascript(),
					EditorView.lineWrapping,
					yCollab(ytext, provider.awareness),
					// oneDark
					EditorView.updateListener.of(() => (ytext = ytext))
				]
			});

			view = new EditorView({
				state,
				parent: editor
			});
		}
	});
	onDestroy(() => {
		if (view) {
			view.destroy();
		}
	});
</script>

<div bind:this={editor} />
