<script>
	export let compiled;
	export let output_w;

	let iframe;

	function update(code) {
		iframe.contentWindow.postMessage(code, '*');
	}

	$: iframe && compiled && update(compiled);

	const srcdoc = `
<!doctype html>
<html>
	<head>
		<script type="module">

			let c;

			function update(source) {
				const blob = new Blob([source], { type: 'text/javascript' });
				const url = URL.createObjectURL(blob);

				import(url).then(({ default: App }) => {
					if (c) c.$destroy();

					document.body.innerHTML = '';
					c = new App({ target: document.body })
				})
			}

			window.addEventListener('message', event => {
				update(event.data)
			}, false)

		<\/script>
		<\script src="https://cdn.tailwindcss.com"><\/script>

	</head>
	<body></body>
</html>
	`;
</script>

<section style="width:{output_w}%;">
	<iframe class="h-full" title="Rendered REPL" bind:this={iframe} {srcdoc} />
</section>
