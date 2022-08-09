<script>
	import { onMount } from 'svelte';
	import { browser } from '$app/env';
	import Worker from './worker.js?worker';
	import Input from './Input.svelte';
	import Output from './Output.svelte';

	// export let embed = false;
	let input_w = 50;
	let output_w = 50;
	let resize = false;
	let resize_bar;
	let current = 0;
	let worker, compiled;

	export let components = [
		{
			id: 0,
			name: 'App',
			type: 'svelte',
			source: `<script>
  import Component from './Component1.svelte';
<\/script>

<Component />
	`
		},
		{
			id: 1,
			name: 'Component1',
			type: 'svelte',
			source: '<h1>Hello</h1>'
		}
	];

	onMount(async () => {
		if (!browser) return;
		worker = new Worker();
		worker.addEventListener('message', (event) => {
			compiled = event.data;
		});
	});

	function compile(_components) {
		if (worker) worker.postMessage(_components);
	}
	function handle_pointerdown(e) {
		resize = true;
		resize_bar.setPointerCapture(e.pointerId);

		resize_bar.addEventListener('pointermove', (e) => {
			if (!resize) return;
			input_w = (e.clientX / window.innerWidth) * 100;
			output_w = 100 - input_w;
		});
		resize_bar.addEventListener(
			'pointerup',
			() => {
				resize = false;
				resize_bar.releasePointerCapture(e.pointerId);
			},
			{ once: true }
		);
	}

	$: compile(components);
</script>

<main>
	<div class="h-screen w-full inline-flex">
		<Input bind:components bind:current {input_w} />
		<div
			bind:this={resize_bar}
			on:pointerdown={handle_pointerdown}
			class="bg-slate-50 h-full w-1 cursor-col-resize absolute"
			style="left:{input_w}%; margin-left:-3px;"
		/>
		<Output {compiled} {output_w} />
	</div>
</main>
