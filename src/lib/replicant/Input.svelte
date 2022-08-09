<script>
	import Tabs from './Tabs.svelte';
	import CodeMirror from '$lib/CodeMirror6.svelte';

	export let components = [];
	export let current = 0;
	export let input_w;
	let update_editor_source;

	// 	let textarea;
	let codemirror;

	function get_max(_components) {
		const ids = _components.map(({ id }) => id);
		return Math.max(...ids);
	}

	function new_component() {
		const id = get_max(components) + 1;

		components = components.concat({
			id,
			name: `Component${id}`,
			type: 'svelte',
			source: ''
		});

		current = id;
		codemirror.update_editor_source('');
		// textarea.focus();
	}
	function update_component_source(new_code) {
		components[current_component].source = new_code;
	}

	$: current_component = components.findIndex(({ id }) => id === current);
	$: tabs = components.map(({ id, name, type }) => ({ id, name, type }));
</script>

<section class="items-stretch flex flex-col" style="width:{input_w}%">
	<Tabs
		{tabs}
		{current}
		on:select={({ detail }) => {
			current = detail;
			codemirror.update_editor_source(components[current].source);
		}}
		on:new={new_component}
	/>
	<!-- <textarea
		class="grow h-96 p-4"
		bind:values={components[current_component].source}
		bind:this={textarea}
	/> -->

	<CodeMirror
		{update_component_source}
		bind:text={components[current_component].source}
		bind:this={codemirror}
	/>
	<!-- {JSON.stringify(components[current_component].source)} -->
	<!-- <button on:click={() => codemirror.update_editor_source('')}>Update</button> -->
</section>
