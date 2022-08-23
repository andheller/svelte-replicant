<script>
  import { getContext } from "svelte";
  import { parse } from "marked";
  import Viewer from "./Viewer.svelte";
  // import PaneWithPanel from "./PaneWithPanel.svelte";
  // import CompilerOptions from "./CompilerOptions.svelte";
  import Compiler from "./Compiler.js";
  // import CodeMirror from "../CodeMirror.svelte";
  // import AstView from "./AstView.svelte";
  import { browser } from "$app/env";

  const { register_output, module_editor_ready } = getContext("REPL");

  export let svelteUrl;
  export let status;
  // export let sourceErrorLoc = null;
  export let runtimeError = null;
  // export let embedded = false;
  export let relaxed = false;
  export let injectedJS;
  export let injectedCSS;
  // export let theme;
  export let showAst;

  register_output({
    set: async (selected, options) => {
      selected_type = selected.type;

      if (selected.type === "js" || selected.type === "json") {
        js_editor.set(`/* Select a component to see its compiled code */`);
        css_editor.set(`/* Select a component to see its compiled code */`);
        return;
      }

      if (selected.type === "md") {
        markdown = parse(selected.source);
        return;
      }

      const compiled = await compiler.compile(selected, options, showAst);
      if (!js_editor) return; // unmounted

      js_editor.set(compiled.js, "js");
      css_editor.set(compiled.css, "css");
      ast = compiled.ast;
    },

    update: async (selected, options) => {
      if (selected.type === "js" || selected.type === "json") return;

      if (selected.type === "md") {
        markdown = parse(selected.source);
        return;
      }

      const compiled = await compiler.compile(selected, options, showAst);
      if (!js_editor) return; // unmounted

      js_editor.update(compiled.js);
      css_editor.update(compiled.css);
      ast = compiled.ast;
    },
  });

  const compiler = browser && new Compiler(svelteUrl);

  // refs
  let js_editor;
  let css_editor;

  let view = "result";
  let selected_type = "";
  let markdown = "";
  let ast;
</script>

<Viewer
  bind:error={runtimeError}
  {status}
  {relaxed}
  {injectedJS}
  {injectedCSS}
/>

<style>
  .view-toggle {
    height: 4.2rem;
    border-bottom: 1px solid #eee;
    white-space: nowrap;
    box-sizing: border-box;
  }

  button {
    /* width: 50%;
		height: 100%; */
    background: white;
    text-align: left;
    position: relative;
    font: 400 12px/1.5 var(--font);
    border: none;
    border-bottom: 3px solid transparent;
    padding: 12px 12px 8px 12px;
    color: #999;
    border-radius: 0;
  }

  button.active {
    border-bottom: 3px solid var(--prime);
    color: #333;
  }

  div[slot] {
    height: 100%;
  }

  .tab-content {
    position: absolute;
    width: 100%;
    height: calc(100% - 42px) !important;
    visibility: hidden;
    pointer-events: none;
  }

  .tab-content.visible {
    visibility: visible;
    pointer-events: all;
  }
  iframe {
    width: 100%;
    height: 100%;
    border: none;
    display: block;
  }
</style>
