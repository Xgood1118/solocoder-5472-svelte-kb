<script>
  import TreeNode from './TreeNode.svelte'

  export let nodes = []
</script>

<div class="tree-view">
  {#each nodes as node (node.id)}
    <TreeNode node={node} level={0} />
  {/each}
</div>

<style>
  .tree-view {
    user-select: none;
  }
</style>
